import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js', 'vitest.config.js', 'db/init/**', 'db/migrations/**'],
    },
  },
})
