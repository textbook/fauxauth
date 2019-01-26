const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  testMatch: ["**/*.e2e.ts"]
};
