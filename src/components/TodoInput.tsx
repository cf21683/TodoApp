import { useState, type FormEvent } from 'react'

type TodoInputProps = {
  onAdd: (text: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onAdd(text)
    setText('')
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="添加待办，按回车确认"
        aria-label="新待办"
        autoFocus
      />
      <button type="submit" disabled={!text.trim()}>
        添加
      </button>
    </form>
  )
}
