import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { Item } from './item';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/`;

  /** GET /todos/ */
  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.base}/`);
  }

  /** GET /todos/complete */
  getComplete(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.base}/complete`);
  }

  /** GET /todos/{id} */
  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.base}/${id}`);
  }

  /** POST /todos/ */
  create(name: string, isCompleted = false): Observable<Item> {
    const body: Partial<Item> = { name, isCompleted };
    return this.http.post<Item>(`${this.base}/`, body);
  }

  /** PUT /todos/{id} */
  update(id: string, name: string, isCompleted: boolean): Observable<void> {
    const body: Partial<Item> = { name, isCompleted };
    return this.http.put<void>(`${this.base}/${id}`, body);
  }

  /** DELETE /todos/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
