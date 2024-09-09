const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { Pool } = require('pg');

// Initialize Secret Manager client
const client = new SecretManagerServiceClient();

async function accessSecretVersion(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/western-beanbag-432114-m2/secrets/${secretName}/versions/latest`,
  });

  const payload = version.payload.data.toString('utf8');
  return JSON.parse(payload); // Parse the JSON object from the secret
}

// Initialize database connection pool
async function initDbPool() {
  const dbCredentials = await accessSecretVersion('my-database-credentials'); // Fetch and parse the JSON secret

  const pool = new Pool({
    user: dbCredentials.username,  // Use the 'username' field from the JSON object
    host: '/cloudsql/western-beanbag-432114-m2:us-central1:dms-instance',  // Replace with your instance connection name
    database: 'postgres',
    password: dbCredentials.password,  // Use the 'password' field from the JSON object
    port: 5432,
  });

  pool.on('connect', (client) => {
    client.query('SET application_name = $1', ['my-serverless-app']);
  });

  return pool;
}

// Initialize the pool once when the function is loaded
let poolPromise = initDbPool();

exports.getTodos = async (req, res) => {
  const pool = await poolPromise; // Use the initialized pool
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM todos ORDER BY id ASC');
    res.status(200).json(result.rows);
    client.release();
  } catch (err) {
    res.status(500).send('Error fetching todos: ' + err.message);
  }
};

exports.addTodo = async (req, res) => {
  const { title } = req.body;
  const pool = await poolPromise;

  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
    res.status(201).json(result.rows[0]);
    client.release();
  } catch (err) {
    res.status(500).send('Error adding todo: ' + err.message);
  }
};

exports.updateTodo = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, completed } = req.body;
  const pool = await poolPromise;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
      [title, completed, id]
    );
    res.status(200).json(result.rows[0]);
    client.release();
  } catch (err) {
    res.status(500).send('Error updating todo: ' + err.message);
  }
};

exports.deleteTodo = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pool = await poolPromise;

  try {
    const client = await pool.connect();
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(200).send(`Todo deleted with ID: ${id}`);
    client.release();
  } catch (err) {
    res.status(500).send('Error deleting todo: ' + err.message);
  }
};
