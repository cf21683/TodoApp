import { useEffect } from 'react'
import { DataActions } from './components/DataActions.tsx'
import { TodoFilter } from './components/TodoFilter.tsx'
import { TodoInput } from './components/TodoInput.tsx'
import { TodoList } from './components/TodoList.tsx'
import { useTodos } from './hooks/useTodos.ts'

function TodoApp() {
  const {
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
  } = useTodos()

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 2800)
    return () => window.clearTimeout(timer)
  }, [message, setMessage])

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>待办</h1>
          <p>本地保存，可导出或导入 JSON</p>
        </div>
        <DataActions onExport={() => void exportTodos()} onImport={() => void importTodos()} />
      </header>

      <TodoInput onAdd={addTodo} />

      <section className="panel">
        {!ready ? (
          <p className="empty">加载中…</p>
        ) : (
          <TodoList
            todos={visibleTodos}
            onToggle={toggleTodo}
            onEdit={editTodo}
            onDelete={deleteTodo}
          />
        )}
      </section>

      <footer className="footer">
        <span>{remaining} 项未完成</span>
        <TodoFilter filter={filter} onChange={setFilter} />
        <button
          type="button"
          className="text-btn"
          onClick={clearCompleted}
          disabled={completedCount === 0}
        >
          清除已完成
        </button>
      </footer>

      {message ? <div className="toast">{message}</div> : null}
    </main>
  )
}

function App() {
  if (!window.todoApi) {
    return (
      <main className="app">
        <p className="empty">请使用 npm run dev 在 Electron 窗口中打开</p>
      </main>
    )
  }

  return <TodoApp />
}

export default App
