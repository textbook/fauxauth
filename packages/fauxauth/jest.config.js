// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	clearMocks: false,
	coverageDirectory: "../../coverage",
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
	testEnvironment: "node",
	testPathIgnorePatterns: ["e2e/"],
	testTimeout: 10_000,
	transform: {
		"^.+\\.(ts)$": "ts-jest",
	},
};
