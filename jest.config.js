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
  // preset: 'ts-jest',
  rootDir: __dirname,
  roots: ['test'],
  testEnvironment: 'jsdom',
  testMatch: [ '<rootDir>/**/*.test.{ts,tsx}' ],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsxImportSource: '<rootDir>/src/dom',
          jsx: "react-jsx",
          outDir: "<rootDir>/dist-test",
        }
      }
    ],
    "^.+\\.ts?$": [ "ts-jest", { tsconfig: '<rootDir>/tsconfig.json' } ],
    // "^.+\\.tsx$": [ "ts-jest", { tsconfig: '<rootDir>/tsconfig.test.json' } ],
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

