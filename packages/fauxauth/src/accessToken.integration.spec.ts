import { Application } from "express";
import request from "supertest";
import { parse } from "url";
import { parseString } from "xml2js";

import appFactory, { Configuration } from "./index.js";

describe("access_token endpoint", () => {
	let app: Application;
	let code: string;
	const defaultConfiguration: Configuration = {
		appendScopes: false,
		callbackUrl: "http://example.org/",
		clientId: "1ae9b0ca17e754106b51",
		clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
		codes: {},
	};

	const endpoint = "/access_token";

	beforeEach(async () => {
		app = appFactory();
		await request(app)
			.get("/authorize")
			.query({
				client_id: defaultConfiguration.clientId,
				client_secret: defaultConfiguration.clientSecret,
			})
			.expect(302)
			.then((res) => {
				const { query } = parse(res.get("Location"), true);
				code = query.code as string;
			});
	});

	it("returns an access token", () => {
		return request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: defaultConfiguration.clientId,
				client_secret: defaultConfiguration.clientSecret,
				code,
			})
			.expect(200)
			.then((res) => {
				const content = new URLSearchParams(res.text);
				expect(content.get("access_token")).toMatch(/[0-9a-f]{40}/);
				expect(content.get("token_type")).toBe("bearer");
			});
	});

	it("rejects unrecognised codes", () => {
		return request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: defaultConfiguration.clientId,
				client_secret: defaultConfiguration.clientSecret,
				code: "badcode",
			})
			.accept("json")
			.expect(200)
			.then((res) => {
				expect(res.body.error).toBe("bad_verification_code");
			});
	});

	it("rejects already-used codes", async () => {
		await request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: defaultConfiguration.clientId,
				client_secret: defaultConfiguration.clientSecret,
				code,
			})
			.accept("json")
			.expect(200)
			.then((res) => {
				expect(res.body.error).toBeUndefined();
			});

		await request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: defaultConfiguration.clientId,
				client_secret: defaultConfiguration.clientSecret,
				code,
			})
			.accept("json")
			.expect(200)
			.then((res) => {
				expect(res.body.error).toBe("bad_verification_code");
			});
	});

	it("rejects unknown clients", () => {
		return request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: "something",
			})
			.expect(404);
	});

	it("provides error details on invalid credentials", () => {
		return request(app)
			.post(endpoint)
			.type("form")
			.send({
				client_id: defaultConfiguration.clientId,
				client_secret: "everyoneknowsthis",
			})
			.accept("json")
			.expect(200)
			.then((res) => {
				expect(res.body.error).toBe("incorrect_client_credentials");
			});
	});

	describe("scopes", () => {
		it("includes scopes if provided", async () => {
			const appWithScopes = appFactory({ codes: {
				"some-cool-code": { token: "even-cooler-token", scopes: ["read:user", "user:email"] } },
			});
			await request(appWithScopes)
				.post(endpoint)
				.type("form")
				.send({
					client_id: defaultConfiguration.clientId,
					client_secret: defaultConfiguration.clientSecret,
					code: "some-cool-code",
				})
				.accept("json")
				.expect(200, {
					access_token: "even-cooler-token",
					scope: "read:user,user:email",
					token_type: "bearer",
				});
		});

		it("includes scopes in token if requested", async () => {
			const appWithScopes = appFactory({
				appendScopes: true,
				codes: { "some-cool-code": { token: "even-cooler-token", scopes: ["read:user", "user:email"] } } },
			);
			await request(appWithScopes)
				.post(endpoint)
				.type("form")
				.send({
					client_id: defaultConfiguration.clientId,
					client_secret: defaultConfiguration.clientSecret,
					code: "some-cool-code",
				})
				.accept("json")
				.expect(200, {
					access_token: "even-cooler-token/read:user/user:email",
					scope: "read:user,user:email",
					token_type: "bearer",
				});
		});
	});

	describe("accept types", () => {
		it("handles application/json", () => {
			return request(app)
				.post(endpoint)
				.type("form")
				.send({
					client_id: defaultConfiguration.clientId,
					client_secret: defaultConfiguration.clientSecret,
					code,
				})
				.accept("json")
				.expect(200)
				.then((res) => {
					expect(res.body.access_token).toMatch(/[0-9a-f]{40}/);
					expect(res.body.token_type).toBe("bearer");
				});
		});

		it("handles application/xml", () => {
			return request(app)
				.post(endpoint)
				.type("form")
				.send({
					client_id: defaultConfiguration.clientId,
					client_secret: defaultConfiguration.clientSecret,
					code,
				})
				.accept("application/xml")
				.expect("Content-Type", /application\/xml/)
				.then((res) => parseXml(res.text))
				.then((body) => {
					expect(body.OAuth.access_token).toMatch(/[0-9a-f]{40}/);
					expect(body.OAuth.token_type).toBe("bearer");
				});
		});

		function parseXml(text: string): Promise<any> {
			return new Promise((resolve, reject) => {
				parseString(text, { explicitArray: false }, (err, result) => {
					if (err) {
						return reject(err);
					}
					resolve(result);
				});
			});
		}
	});
});
