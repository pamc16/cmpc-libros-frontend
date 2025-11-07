import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    globals: true,        // usar globals como describe, it, expect
    environment: 'jsdom', // simula un navegador
    setupFiles: './src/setupTests.ts', // opcional, para setup global
    coverage: {
      provider: 'v8',             // puede ser 'c8' o 'istanbul'
      reporter: ['text', 'lcov'], // text = consola, lcov = para reportes html
      include: ['src/**/*.{ts,tsx}'], // qué archivos cubrir
      exclude: ['**/*.test.{ts,tsx}', 'node_modules', 'dist'], // excluir tests y node_modules
    },
  },
})
