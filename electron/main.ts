import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ExportResult, ImportResult, Todo, TodoExport } from '../src/shared/types.ts'
import { parseExportPayload, parseTodoList } from '../src/shared/validate.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

type StoredData = {
  version: 1
  todos: Todo[]
}

function dataFilePath() {
  return path.join(app.getPath('userData'), 'todos.json')
}

async function readStoredTodos(): Promise<Todo[]> {
  try {
    const raw = await fs.readFile(dataFilePath(), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    const fromExport = parseExportPayload(parsed)
    if (fromExport) return fromExport.todos
    const list = parseTodoList(parsed)
    return list ?? []
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return []
    throw error
  }
}

async function writeStoredTodos(todos: Todo[]) {
  const payload: StoredData = { version: 1, todos }
  await fs.mkdir(path.dirname(dataFilePath()), { recursive: true })
  await fs.writeFile(dataFilePath(), JSON.stringify(payload, null, 2), 'utf8')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 740,
    minWidth: 380,
    minHeight: 520,
    title: '待办',
    backgroundColor: '#f4f1ea',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    void win.loadURL(devUrl)
  } else {
    void win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('todos:load', async (): Promise<Todo[]> => {
    return readStoredTodos()
  })

  ipcMain.handle('todos:save', async (_event, todos: unknown): Promise<void> => {
    const list = parseTodoList(todos)
    if (!list) {
      throw new Error('待办数据格式无效，未写入本地文件')
    }
    await writeStoredTodos(list)
  })

  ipcMain.handle(
    'todos:export',
    async (_event, payload: unknown): Promise<ExportResult> => {
      const data = parseExportPayload(payload)
      if (!data) {
        return { ok: false, error: '导出数据格式无效' }
      }

      const result = await dialog.showSaveDialog({
        title: '导出待办',
        defaultPath: `todos-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })

      if (result.canceled || !result.filePath) {
        return { ok: false, error: '已取消', cancelled: true }
      }

      const exportBody: TodoExport = {
        version: 1,
        exportedAt: data.exportedAt || new Date().toISOString(),
        todos: data.todos,
      }

      await fs.writeFile(result.filePath, JSON.stringify(exportBody, null, 2), 'utf8')
      return { ok: true }
    },
  )

  ipcMain.handle('todos:import', async (): Promise<ImportResult> => {
    const result = await dialog.showOpenDialog({
      title: '导入待办',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false, error: '已取消', cancelled: true }
    }

    try {
      const raw = await fs.readFile(result.filePaths[0], 'utf8')
      const parsed: unknown = JSON.parse(raw)
      const data = parseExportPayload(parsed)
      if (!data) {
        return { ok: false, error: '文件结构不正确，需要包含 version 和 todos' }
      }
      await writeStoredTodos(data.todos)
      return { ok: true, todos: data.todos }
    } catch (error) {
      if (error instanceof SyntaxError) {
        return { ok: false, error: '不是合法的 JSON 文件' }
      }
      return { ok: false, error: '读取文件失败' }
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
