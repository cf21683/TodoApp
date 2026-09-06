import type { Todo, TodoExport } from './types.ts'

function isTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.text === 'string' &&
    typeof item.completed === 'boolean' &&
    typeof item.createdAt === 'number' &&
    Number.isFinite(item.createdAt)
  )
}

export function parseTodoList(value: unknown): Todo[] | null {
  if (!Array.isArray(value)) return null
  if (!value.every(isTodo)) return null
  return value
}

export function parseExportPayload(value: unknown): TodoExport | null {
  if (!value || typeof value !== 'object') return null
  const payload = value as Record<string, unknown>
  if (payload.version !== 1) return null
  const todos = parseTodoList(payload.todos)
  if (!todos) return null
  return {
    version: 1,
    exportedAt: typeof payload.exportedAt === 'string' ? payload.exportedAt : '',
    todos,
  }
}
