import { Component, OnInit } from '@angular/core';
import { TodoService } from '../todo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  imports: [CommonModule, FormsModule]  // Import modules as needed
})
export class TodoListComponent implements OnInit {
  todos: any[] = [];
  newTodo: string = '';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe(
      (data) => {
        this.todos = data;
      },
      (error) => {
        console.error('Error fetching todos', error);
      }
    );
  }

  addTodo() {
    if (this.newTodo.trim()) {
      this.todoService.addTodo(this.newTodo).subscribe(
        (data) => {
          this.todos.push(data);
          this.newTodo = '';
        },
        (error) => {
          console.error('Error adding todo', error);
        }
      );
    }
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe(
      () => {
        this.todos = this.todos.filter(todo => todo.id !== id);
      },
      (error) => {
        console.error('Error deleting todo', error);
      }
    );
  }

  updateTodo(todo: any) {
    this.todoService.updateTodo(todo.id, todo).subscribe(
      () => {
        this.loadTodos();
      },
      (error) => {
        console.error('Error updating todo', error);
      }
    );
  }
}
