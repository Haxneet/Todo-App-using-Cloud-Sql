import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'https://<YOUR_CLOUD_FUNCTION_URL>'; // Replace with your Cloud Function URL

  constructor(private http: HttpClient) {}

  getTodos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getTodos`);
  }

  addTodo(todo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/addTodo`, { title: todo });
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteTodo/${id}`);
  }

  updateTodo(id: number, todo: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateTodo/${id}`, todo);
  }
}
