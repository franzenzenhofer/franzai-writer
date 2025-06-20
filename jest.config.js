module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'server-only': '<rootDir>/tests/mocks/empty-module.js', // Or a more specific mock if needed
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
};
