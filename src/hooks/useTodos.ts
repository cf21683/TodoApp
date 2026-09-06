import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Filter, Todo } from '../shared/types.ts'

function createId() {
  return crypto.randomUUID()
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const persist = useCallback(async (next: Todo[]) => {
    await window.todoApi?.save(next)
  }, [])

  useEffect(() => {
    const api = window.todoApi
    if (!api) {
      setReady(true)
      return
    }
    let cancelled = false
    void api
      .load()
      .then((list) => {
        if (cancelled) return
        setTodos(list)
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setMessage('读取本地数据失败')
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateTodos = useCallback(
    (updater: (current: Todo[]) => Todo[]) => {
      setTodos((current) => {
        const next = updater(current)
        void persist(next)
        return next
      })
    },
    [persist],
  )

  const addTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      updateTodos((current) => [
        { id: createId(), text: trimmed, completed: false, createdAt: Date.now() },
        ...current,
      ])
    },
    [updateTodos],
  )

  const toggleTodo = useCallback(
    (id: string) => {
      updateTodos((current) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      )
    },
    [updateTodos],
  )

  const editTodo = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      updateTodos((current) =>
        current.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo)),
      )
    },
    [updateTodos],
  )

  const deleteTodo = useCallback(
    (id: string) => {
      updateTodos((current) => current.filter((todo) => todo.id !== id))
    },
    [updateTodos],
  )

  const clearCompleted = useCallback(() => {
    updateTodos((current) => current.filter((todo) => !todo.completed))
  }, [updateTodos])

  const exportTodos = useCallback(async () => {
    const result = await window.todoApi?.exportTodos({
      version: 1,
      exportedAt: new Date().toISOString(),
      todos,
    })
    if (!result) return
    if (!result.ok) {
      if (result.cancelled) return
      setMessage(result.error)
      return
    }
    setMessage('已导出 JSON')
  }, [todos])

  const importTodos = useCallback(async () => {
    const result = await window.todoApi?.importTodos()
    if (!result) return
    if (!result.ok) {
      if (result.cancelled) return
      setMessage(result.error)
      return
    }
    setTodos(result.todos)
    setMessage('已从 JSON 导入')
  }, [])

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed)
    if (filter === 'completed') return todos.filter((todo) => todo.completed)
    return todos
  }, [todos, filter])

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  )

  const completedCount = todos.length - remaining

  return {
    todos,
    visibleTodos,
    filter,
    setFilter,
    ready,
    message,
    setMessage,
    remaining,
    completedCount,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    clearCompleted,
    exportTodos,
    importTodos,
  }
}
