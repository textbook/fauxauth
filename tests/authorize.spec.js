import { validateRedirect } from "../src/routes/authorize";

describe("validateRedirect function", () => {
  const callback = "http://example.com/path";

  /**
   * Examples from :
   * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#redirect-urls
   * */

  [
    { redirect: "http://example.com/path", valid: true },
    { redirect: "http://example.com/path/subdir/other", valid: true },
    { redirect: "http://example.com/bar", valid: false },
    { redirect: "http://example.com/", valid: false },
    { redirect: "http://example.com:8080/path", valid: false },
    { redirect: "http://oauth.example.com:8080/path", valid: false },
    { redirect: "http://example.org", valid: false },
  ].forEach(({ redirect, valid }) => {
    it(`should ${valid ? "accept" : "reject"} ${redirect}`, () => {
      expect(validateRedirect(redirect, callback)).toBe(valid);
    });
  });
});
