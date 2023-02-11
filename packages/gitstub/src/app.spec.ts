import request from "supertest";

import appFactory from "./app";

describe("app", () => {
	it("mounts fauxauth core routes", async () => {
		const clientId = "abc123";
		await request(appFactory({ clientId }))
			.get("/login/oauth/authorize")
			.query({ client_id: clientId })
			.expect(200);
	});
});
