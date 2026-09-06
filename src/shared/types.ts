export type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'completed'

export type TodoExport = {
  version: 1
  exportedAt: string
  todos: Todo[]
}

export type ImportResult =
  | { ok: true; todos: Todo[] }
  | { ok: false; error: string; cancelled?: boolean }

export type ExportResult =
  | { ok: true }
  | { ok: false; error: string; cancelled?: boolean }
