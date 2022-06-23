module.exports = {
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
	testEnvironment: "node",
	testMatch: [
		"**/*.e2e.js",
	],
	testTimeout: 30_000,
};
