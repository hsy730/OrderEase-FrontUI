export default {
  testEnvironment: 'jsdom',
  setupFiles: ['./tests/setup.js'],
  moduleNameMapper: {
    '^@/utils/api$': '<rootDir>/tests/mocks/api.js',
    '^@/store/storage$': '<rootDir>/tests/mocks/storage.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }]
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: ['**/tests/**/*.test.js']
}
