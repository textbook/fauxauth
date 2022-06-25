module.exports = {
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
	testTimeout: 30_000,
};
