export default {
	reporters: [
		"default",
		["jest-junit", { outputDirectory: "./reports/jest" }],
	],
	testTimeout: parseInt(process.env.JEST_TIMEOUT , 10) || 30_000,
	transform: {},
};
