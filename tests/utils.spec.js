import { generateConfiguration, generateHex } from "../src/utils";

describe("generateConfiguration function", () => {
  it("contains the documented defaults", () => {
    expect(generateConfiguration()).toEqual({
      accessToken: null,
      callbackUrl: "http://example.org/",
      clientId: "1ae9b0ca17e754106b51",
      clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
      codes: [],
    });
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
});
