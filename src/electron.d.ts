import type { ExportResult, ImportResult, Todo, TodoExport } from './shared/types.ts'

export type TodoApi = {
  load: () => Promise<Todo[]>
  save: (todos: Todo[]) => Promise<void>
  exportTodos: (payload: TodoExport) => Promise<ExportResult>
  importTodos: () => Promise<ImportResult>
}

declare global {
  interface Window {
    todoApi?: TodoApi
  }
}

export {}
