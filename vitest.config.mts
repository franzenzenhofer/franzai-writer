import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'happy-dom',
    exclude: [ // Added this to exclude e2e tests
      'tests/e2e/**',
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/dev.ts',
        'src/app/api/test-ai/**',
        'src/app/api/test-env/**',
        'src/lib/mock-data.ts',
        'src/lib/firebase.ts',
        'src/ai/**',
        '**/*.spec.{ts,tsx}', // This excludes spec files from coverage, not from running
      ],
      // excludeFiles was removed as it's not a standard vitest option for excluding test files from running
    },
  },
})
