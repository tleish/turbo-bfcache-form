module.exports = {
  // testPathIgnorePatterns: ['/node_modules/', '.git', '/dist/'],
  setupFiles: [
    './testSetup.js'
  ],
  moduleDirectories: [
    './node_modules/',
    './src/',
  ],
  coverageDirectory: 'tmp/coverage-js',
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 50,
      lines: 75,
      statements: 50,
    },
  },
};
