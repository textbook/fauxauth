import { Application } from "express";
import request from "supertest";

import appFactory, { Configuration } from "./index.js";

describe("authorize endpoint", () => {
	const endpoint = "/authorize";
	const defaultConfiguration: Configuration = {
		appendScopes: false,
		callbackUrl: "http://example.org/",
		clientId: "1ae9b0ca17e754106b51",
		clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
		codes: {},
	};

	let app: Application;

	beforeEach(() => {
		app = appFactory();
	});

	it("adds CORS headers", () => {
		return request(app)
			.get(endpoint)
			.expect("access-control-allow-origin", "*");
	});

	it("redirects you back to the default callback URL", () => {
		return request(app)
			.get(endpoint)
			.query({ client_id: defaultConfiguration.clientId })
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(`${url.origin}/`).toBe(defaultConfiguration.callbackUrl);
			});
	});

	it("redirects you back to the specified location if valid", () => {
		const redirectUri = `${defaultConfiguration.callbackUrl}foo/`;

		return request(app)
			.get(endpoint)
			.query({
				client_id: defaultConfiguration.clientId,
				redirect_uri: redirectUri,
			})
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(url.pathname).toBe("/foo/");
			});
	});

	it("rejects invalid redirect URIs", () => {
		return request(app)
			.get(endpoint)
			.query({
				client_id: defaultConfiguration.clientId,
				redirect_uri: "http://elsewhere.com",
			})
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(`${url.origin}/`).toBe(defaultConfiguration.callbackUrl);
				expect(url.searchParams.get("error")).toBe("redirect_uri_mismatch");
			});
	});

	it("includes the state if specified", () => {
		const state = "randomstate";

		return request(app)
			.get(endpoint)
			.query({
				client_id: defaultConfiguration.clientId,
				state,
			})
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(url.searchParams.get("state")).toBe(state);
			});
	});

	it("does not include scope if specified", () => {
		return request(app)
			.get(endpoint)
			.query({
				client_id: defaultConfiguration.clientId,
				scope: "foo bar",
			})
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(Object.fromEntries(url.searchParams.entries())).toEqual({
					code: expect.stringMatching(/^[a-f\d]{20}$/),
				});
			});
	});

	it("provides a code", () => {
		return request(app)
			.get(endpoint)
			.query({
				client_id: defaultConfiguration.clientId,
			})
			.expect(302)
			.then((res) => {
				const url = new URL(res.get("Location"));
				expect(url.searchParams.get("code")).toMatch(/[0-9a-f]{20}/);
			});
	});

	it("rejects unknown clients", () => {
		return request(app)
			.get(endpoint)
			.query({
				client_id: "who-knows",
				redirect_uri: "http://example.org",
			})
			.expect(404);
	});

	describe("with token map", () => {
		const tokenMap = { role: "tokenforthatrole" };

		beforeEach(() => {
			app = appFactory({ ...defaultConfiguration, tokenMap });
		});

		it("uses a token map if provided", () => {
			return request(app)
				.get(endpoint)
				.query({ client_id: defaultConfiguration.clientId })
				.expect(200)
				.expect("Content-Type", /html/);
		});

		it("handles the post from the form", () => {
			const code = "mycode";
			const redirectUri = `${defaultConfiguration.callbackUrl}path/to`;
			const state = "state";

			return request(app)
				.post(endpoint)
				.type("form")
				.send({ redirect_uri: redirectUri, scope: "foo", state, code })
				.expect(302)
				.then((res) => {
					const url = new URL(res.get("Location"));
					expect(url.pathname).toBe("/path/to");
					expect(Object.fromEntries(url.searchParams.entries())).toEqual({ code, state });
				});
		});
	});
});
