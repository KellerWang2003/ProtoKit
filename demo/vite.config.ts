import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { watch: { ignored: ['!**/src/**'] } },
  resolve: { alias: { 'proto-kit': fileURLToPath(new URL('../src/index.ts', import.meta.url)) } },
})
