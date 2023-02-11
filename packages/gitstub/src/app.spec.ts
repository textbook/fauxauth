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

	it("exposes API routes", async () => {
		const app = appFactory();
		await request(app)
			.get("/api/user")
			.expect(401, { message: "Requires authentication" });
		await request(app)
			.get("/api/user/emails")
			.expect(401, { message: "Requires authentication" });
	});
});
