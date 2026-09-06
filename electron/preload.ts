import { contextBridge, ipcRenderer } from 'electron'
import type { ExportResult, ImportResult, Todo, TodoExport } from '../src/shared/types.ts'

contextBridge.exposeInMainWorld('todoApi', {
  load: (): Promise<Todo[]> => ipcRenderer.invoke('todos:load'),
  save: (todos: Todo[]): Promise<void> => ipcRenderer.invoke('todos:save', todos),
  exportTodos: (payload: TodoExport): Promise<ExportResult> =>
    ipcRenderer.invoke('todos:export', payload),
  importTodos: (): Promise<ImportResult> => ipcRenderer.invoke('todos:import'),
})
