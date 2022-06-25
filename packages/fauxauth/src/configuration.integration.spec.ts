import { Application } from "express";
import request from "supertest";

import appFactory, { Configuration } from "./index";

describe("_configure endpoint", () => {
	const endpoint = "/_configuration";
	const initialConfig: Configuration = {
		callbackUrl: "http://example.org/",
		clientId: "1ae9b0ca17e754106b51",
		clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
		codes: {},
	};

	let app: Application;

	beforeEach(() => {
		app = appFactory();
	});

	it("exposes current configuration", () => {
		return request(app)
			.get(endpoint)
			.expect(200, initialConfig);
	});

	it("allows overriding initial configuration", async () => {
		const oldClientId = "1ae9b0ca17e754106b51";
		const newClientId = "something-else";

		await request(app)
			.get("/authorize")
			.query({ client_id: oldClientId })
			.expect(302);

		await request(app)
			.patch(endpoint)
			.send([{ op: "replace", path: "/clientId", value: newClientId }])
			.expect(200)
			.then(({ body }) => {
				expect(body).toMatchObject({ clientId: newClientId });
			});

		await request(app)
			.get("/authorize")
			.query({ client_id: oldClientId })
			.expect(404);
	});

	it("allows adding codes directly", async () => {
		const code = "somenewcode";
		const token = "andthetokenforit";
		await request(app)
			.patch(endpoint)
			.send([{ op: "add", path: `/codes/${code}`, value: token }])
			.expect(200)
			.then(({ body }) => {
				expect(body).toMatchObject({ codes: { [code]: token } });
			});

		await request(app)
			.post("/access_token")
			.type("form")
			.send({
				client_id: initialConfig.clientId,
				client_secret: initialConfig.clientSecret,
				code,
			})
			.expect(200);
	});

	it("allows returning to default configuration", async () => {
		await request(app)
			.patch(endpoint)
			.send([
				{ op: "replace", path: "/clientId", value: "helloworld" },
				{ op: "add", path: "/codes/foo", value: "bar" },
			])
			.expect(200);

		await request(app)
			.delete(endpoint)
			.expect(204);

		await request(app)
			.get(endpoint)
			.expect(200, initialConfig);
	});

	it("rejects invalid configuration changes", async () => {
		await request(app)
			.patch(endpoint)
			.send([
				{ op: "add", path: "/accessToken", value: "something" },
				{ op: "test", path: "/accessToken", value: "somethingelse" },
				{ op: "add", path: "/callbackUrl", value: "http://failure.com/" },
			])
			.expect(422, initialConfig);

		return request(app)
			.get(endpoint)
			.expect(200, initialConfig);
	});

	it("supports resetting to overridden configuration", async () => {
		const overrides: Omit<Configuration, "codes"> = {
			clientId: "bar",
			clientSecret: "bar",
			callbackUrl: "https://example.com",
		};
		const configuredApp = appFactory({ ...overrides });

		await request(configuredApp)
			.delete(endpoint)
			.expect(204);

		return request(configuredApp)
			.get(endpoint)
			.expect(200)
			.then(({ body }) => {
				expect(body).toMatchObject(overrides);
			});
	});
});
