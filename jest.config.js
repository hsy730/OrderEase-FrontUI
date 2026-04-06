export default {
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.js'],
  moduleNameMapper: {
    '^@/utils/api$': '<rootDir>/tests/mocks/api.js',
    '^@/store/storage$': '<rootDir>/tests/mocks/storage.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {},
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  // 启用实验性 ESM 支持
  experimentalESM: true
}
