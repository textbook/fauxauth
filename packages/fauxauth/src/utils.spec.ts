import { generateHex } from "./utils.js";

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
