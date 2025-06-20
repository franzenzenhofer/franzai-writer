module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'server-only': '<rootDir>/tests/mocks/empty-module.js',
    'lucide-react': '<rootDir>/tests/mocks/lucide-react.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/', // Exclude Playwright tests
    '/.next/',
  ],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)',
  ],
};
