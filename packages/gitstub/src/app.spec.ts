import { load } from "cheerio";
import request from "supertest";

import appFactory from "./app.js";

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

	it("exposes user details", async () => {
		const clientId = "abc123";
		const clientSecret = "def456";
		const app = appFactory({
			clientId,
			clientSecret,
			users: [
				{ gitHubId: 123, gitHubLogin: "textbook", name: "John Doe", privateEmails: ["hello@example.com"], token: "abc123" },
			],
		});

		const { text } = await request(app)
			.get("/login/oauth/authorize")
			.query({ client_id: clientId })
			.expect(200);

		const code = getCode(text, "hello@example.com");
		expect(code).toMatch(/^[\da-f]+$/);

		const { body: { access_token } } = await request(app)
			.post("/login/oauth/access_token")
			.send({
				client_id: clientId,
				client_secret: clientSecret,
				code,
			})
			.accept("json")
			.expect(200);

		const { body } = await request(app)
			.get("/api/user")
			.set("Authorization", `Bearer ${access_token}`)
			.expect(200);

		expect(body).toMatchObject({
			email: null,
			id: 123,
			login: "textbook",
			name: "John Doe",
		});

		await request(app)
			.get("/api/user/emails")
			.set("Authorization", `token ${access_token}`)
			.expect(200, [
				{ email: "hello@example.com", primary: true, visibility: "private", verified: true },
			]);
	});

	it("rejects invalid auth schemes", async () => {
		await request(appFactory())
			.get("/api/user")
			.set("Authorization", "some thing")
			.expect(401, { message: "Requires authentication" });
		await request(appFactory())
			.get("/api/user/emails")
			.set("Authorization", "some thing")
			.expect(401, { message: "Requires authentication" });
	});

	it("rejects unrecognised tokens", async () => {
		await request(appFactory())
			.get("/api/user")
			.set("Authorization", "token abc123")
			.expect(404);
		await request(appFactory())
			.get("/api/user/emails")
			.set("Authorization", "token abc123")
			.expect(404);
	});

	const getCode = (body: string, role: string): string | undefined => {
		const $ = load(body);
		const option = $("option").filter(function () {
			return $(this).text() === role;
		}).first();
		return option.attr("value");
	};
});
