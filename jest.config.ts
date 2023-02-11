import { Config } from "@jest/types";

const config: Config.InitialOptions = {
	coverageDirectory: "<rootDir>/reports/coverage",
	projects: [
		createProject("fauxauth"),
		createProject("gitstub"),
	],
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "<rootDir>/reports/jest" }],
	],
};

function createProject(pkg: string): Config.InitialProjectOptions {
	return ({
		extensionsToTreatAsEsm: [".ts"],
		displayName: pkg,
		moduleNameMapper: {
			"^(\\.{1,2}/.*)\\.js$": "$1",
		},
		preset: "ts-jest/presets/default-esm",
		rootDir: `./packages/${pkg}`,
		transform: {
			"^.+\\.ts$": ["ts-jest", { useESM: true }],
		},
	});
}

export default config;
