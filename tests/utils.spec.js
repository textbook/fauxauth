import { generateHex } from "../src/utils";

describe("generateHex function", () => {
  it("generates valid hex strings", () => {
    expect(generateHex(20)).toMatch(/[0-9a-f]{20}/);
    expect(generateHex(40)).toMatch(/[0-9a-f]{40}/);
  });

  it("generates unique hex strings", () => {
    expect(generateHex(20)).not.toBe(generateHex(20));
  });
});
