import { render, screen, fireEvent } from '@testing-library/angular';
import { App } from '../front/src/app/app';
import { TodoService } from '../front/src/app/todo.service';
import { of } from 'rxjs';

describe('App', () => {
  // If you want tests to pause for a debugger, set globalThis.DEBUG_FRONT = true in the Karma client
  // or set process.env.DEBUG_FRONT for Node/Jest. When true, the test runner will hit this debugger.
  if ((globalThis as any).DEBUG_FRONT) {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  const mockService = {
    getAll: () => of([
      { id: 1, name: 'Test task', isCompleted: false, createdAt: new Date().toISOString() }
    ]),
    create: (title: string) => of({
      id: 2, name: title, isCompleted: false, createdAt: new Date().toISOString()
    }),
    delete: (id: number) => of(void 0),
    update: () => of(void 0)
  };

  it('renders todo list', async () => {
    await render(App, {
      providers: [{ provide: TodoService, useValue: mockService }]
    });

    expect(screen.getByText('Test task')).toBeTruthy();
  });

  it('adds a new todo', async () => {
    await render(App, {
      providers: [{ provide: TodoService, useValue: mockService }]
    });

    const input = screen.getByPlaceholderText(/what would you like/i);
    fireEvent.input(input, { target: { value: 'New task' } });

    const button = screen.getByText('Add');
    fireEvent.click(button);

    expect(await screen.findByText('New task')).toBeTruthy();
  });

  it('toggles completion', async () => {
    await render(App, {
      providers: [{ provide: TodoService, useValue: mockService }]
    });

    const circle = screen.getByRole('button', { name: /delete/i }).previousElementSibling!;
    fireEvent.click(circle);

    expect(circle.classList.contains('filled')).toBe(true);
  });
});
