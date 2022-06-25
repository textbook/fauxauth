import { Config } from "@jest/types";

const config: Config.InitialOptions = {
	coverageDirectory: "./coverage",
	preset: "ts-jest",
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
};

export default config;
