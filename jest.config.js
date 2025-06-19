module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'server-only': '<rootDir>/tests/mocks/empty-module.js', // Or a more specific mock if needed
  },
};
