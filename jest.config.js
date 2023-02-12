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
  roots: ['test', 'src'],
  testEnvironment: 'jsdom',
  testMatch: [ '<rootDir>/**/*.test.{ts,tsx}' ],
  transformIgnorePatterns: ['/node_modules/'],
  transform: {
    ".+": [
      "ts-jest",
      {
        tsconfig: {
          target: "es2017",
          lib: ["es2017", "dom", "dom.iterable"],
          types: ["jest"],
          module: "commonjs",
          esModuleInterop: true,
          declaration: true,
          noImplicitAny: true,
          removeComments: true,
          preserveConstEnums: true,
          moduleResolution: "node",
          jsx: "react-jsx",
          jsxImportSource: '<rootDir>/src/dom',
          allowJs: false,
          strict: true,
          sourceMap: true,
          outDir: "./dist",
          // outDir: "<rootDir>/dist-test",
          rootDir: "./src"
        }
      }
    ],
    // "^.+\\.ts$": [ "ts-jest", { tsconfig: '<rootDir>/tsconfig.json' } ],
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

