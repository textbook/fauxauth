import { Config } from "@jest/types";

const config: Config.InitialOptions = {
	clearMocks: false,
	coverageDirectory: "./coverage",
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
	testEnvironment: "node",
	testPathIgnorePatterns: ["e2e/"],
	testTimeout: 10_000,
	transform: {
		"^.+\\.(ts)$": "ts-jest",
	},
};

export default config;
