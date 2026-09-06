import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

function startElectron({ startup }: { startup: (argv?: string[], options?: object) => void }) {
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  void startup(['.', '--no-sandbox'], { env })
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        onstart: startElectron,
      },
      preload: {
        input: 'electron/preload.ts',
        onstart: startElectron,
      },
    }),
  ],
})
