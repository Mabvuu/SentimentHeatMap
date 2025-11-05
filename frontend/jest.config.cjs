/* eslint-env node */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
};
