// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: false,
  coverageDirectory: "coverage",
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["e2e/"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
};
