import { Config } from "@jest/types";

const config: Config.InitialOptions = {
	coverageDirectory: "./coverage",
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	preset: "ts-jest/presets/default-esm",
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
	transform: {
		"^.+\\.ts$": ["ts-jest", { useESM: true }],
	},
};

export default config;
