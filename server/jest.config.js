/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/tests/**'
  ],
  coverageDirectory: './coverage',
  coverageReporters: [
    'lcov',
    'text',
    'html'
  ],
  testTimeout: 30000 // מגדיר timeout ארוך יותר לטסטים
};
