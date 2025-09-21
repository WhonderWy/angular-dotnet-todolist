import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from "@angular/common";

import { TodoService } from './todo.service';
import { Item } from './item';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'My To Do List';
  todos = signal<Item[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private api: TodoService) {
    this.load();
    // Keep reactivity alive in zoneless mode
    effect(() => void this.todos());
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getAll().subscribe({
      next: data => {
        this.todos.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Failed to load');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  addItem(input: HTMLInputElement) {
    const name = input.value.trim();
    if (!name) return;
    this.api.create(name).subscribe({
      next: created => {
        this.todos.update(list => [created, ...list]);
        input.value = '';
      },
      error: err => {
        this.error.set('Failed to add');
        console.error(err);
      }
    });
  }

  removeItem(id: string) {
    const prev = this.todos();
    this.todos.update(list => list.filter(i => i.id !== id));
    this.api.delete(id).subscribe({
      error: err => {
        this.error.set('Failed to delete');
        this.todos.set(prev);
        console.error(err);
      }
    });
  }

  toggleComplete(item: Item) {
    item.isCompleted = !item.isCompleted;
    // optionally call service.update(item.id, item.name, item.isCompleted)
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  trackById = (_: number, item: Item) => item.id;
}
