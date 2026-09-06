import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../shared/types.ts'

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function commit() {
    const trimmed = draft.trim()
    if (!trimmed) {
      setDraft(todo.text)
      setEditing(false)
      return
    }
    if (trimmed !== todo.text) {
      onEdit(todo.id, trimmed)
    }
    setEditing(false)
  }

  return (
    <li className={todo.completed ? 'todo-item completed' : 'todo-item'}>
      <label className="check">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          aria-label={todo.completed ? '标记为未完成' : '标记为已完成'}
        />
        <span />
      </label>
      {editing ? (
        <input
          ref={inputRef}
          className="edit-field"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') {
              setDraft(todo.text)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="todo-text"
          onDoubleClick={() => {
            setDraft(todo.text)
            setEditing(true)
          }}
        >
          {todo.text}
        </button>
      )}
      <button type="button" className="icon-btn" onClick={() => onDelete(todo.id)} aria-label="删除">
        ×
      </button>
    </li>
  )
}
