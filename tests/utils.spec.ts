import { generateConfiguration, generateHex } from "../src/utils";

describe("generateConfiguration function", () => {
	it("contains the documented defaults", () => {
		expect(generateConfiguration()).toEqual({
			callbackUrl: "http://example.org/",
			clientId: "1ae9b0ca17e754106b51",
			clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			codes: {},
		});
	});

	it("includes overrides from the environment", () => {
		process.env.FAUXAUTH_CONFIG = "{\"clientId\": \"deadbeef\"}";

		expect(generateConfiguration()).toEqual({
			callbackUrl: "http://example.org/",
			clientId: "deadbeef",
			clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			codes: {},
		});

		delete process.env.FAUXAUTH_CONFIG;
	});
});

describe("generateHex function", () => {
	it("generates valid hex strings", () => {
		expect(generateHex(20)).toMatch(/[0-9a-f]{20}/);
		expect(generateHex(40)).toMatch(/[0-9a-f]{40}/);
	});

	it("generates unique hex strings", () => {
		expect(generateHex(20)).not.toBe(generateHex(20));
	});

	it("generates hex strings without loads of zeroes", () => {
		const hex = generateHex(40);
		const zeroes = Array.from(hex).reduce((count, char) => count + (char === "0" ? 1 : 0), 0);
		expect(zeroes).toBeLessThan(10);
	});
});
