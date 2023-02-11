/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  // globals: {
  //   'ts-jest': {
  //     tsconfig: {
  //       jsxImportSource: '<rootDir>/src/dom',
  //       jsx: "react-jsx",
  //     },
  //   },
  // },
  rootDir: __dirname,
  roots: ['test'],
  testEnvironment: 'jsdom',
  testMatch: [ '<rootDir>/**/*.test.{ts,tsx}' ],
  transform: {
    "^.+\\.ts$": [ "ts-jest", { tsconfig: '<rootDir>/tsconfig.json' } ],
    "^.+\\.tsx$": [
      "ts-jest",
      {
        tsconfig: {
          jsxImportSource: '<rootDir>/src/dom',
          jsx: "react-jsx",
          outDir: "<rootDir>/dist-test",
        }
      }
    ]
  },

  // collectCoverage: true,
  // setupFiles: ['<rootDir>/jest.setup.js'],

  // collectCoverageFrom: [
  //   '<rootDir>/packages/**/__tests__/**/*.ts',
  //   '!<rootDir>/packages/**/templates/**/*.ts',
  // ],
  // testMatch: [
  //   '<rootDir>/packages/**/*.test.ts'
  // ],
  // transform: {
  //   '^.+\\.js?$': '<rootDir>/node_modules/babel-jest'
  // },
  // testPathIgnorePatterns: [
  //   '/node_modules/',
  // ],
  // coveragePathIgnorePatterns: [
  //   '/node_modules/',
  // ],
  // projects: [
  //   '<rootDir>/packages/*/jest.config.js'
  // ]
}
