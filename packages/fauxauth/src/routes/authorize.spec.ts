import { validateRedirect } from "./authorize.js";

describe("validateRedirect function", () => {
	const callback = "http://example.com/path";

	/**
	 * Examples from :
	 * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#redirect-urls
	 */

	[
		"http://example.com/path",
		"http://example.com/path/subdir/other",
	].forEach((validRedirect) => {
		it(`should accept ${validRedirect}`, () => {
			expect(validateRedirect(validRedirect, callback)).toBe(true);
		});
	});

	[
		"http://example.com/bar",
		"http://example.com/",
		"http://example.com:8080/path",
		"http://oauth.example.com:8080/path",
		"http://example.org",
		"https://example.com/path",
	].forEach((invalidRedirect) => {
		it(`should reject ${invalidRedirect}`, () => {
			expect(validateRedirect(invalidRedirect, callback)).toBe(false);
		});
	});
});
