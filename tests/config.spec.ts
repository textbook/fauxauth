import { getAll, initialise } from "../src/config";

describe("getAll function", () => {
	it("contains the documented defaults", () => {
		initialise();
		expect(getAll()).toEqual({
			callbackUrl: "http://example.org/",
			clientId: "1ae9b0ca17e754106b51",
			clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			codes: {},
		});
	});

	it("includes overrides from the environment", () => {
		process.env.FAUXAUTH_CONFIG = "{\"clientId\": \"deadbeef\"}";

		initialise();
		expect(getAll()).toEqual({
			callbackUrl: "http://example.org/",
			clientId: "deadbeef",
			clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			codes: {},
		});
	});
});
