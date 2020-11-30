import { Application } from "express";
import request from "supertest";

import appFactory, { Configuration, generateConfiguration } from "../../src";

describe("_configure endpoint", () => {
	const endpoint = "/_configuration";
	const startingConfiguration = generateConfiguration();

	let app: Application;
	let initialConfig: Configuration;

	beforeEach(() => {
		initialConfig = generateConfiguration();
		app = appFactory(initialConfig);
	});

	it("exposes current configuration", () => {
		return request(app)
			.get(endpoint)
			.expect(200, initialConfig);
	});

	it("allows overriding initial configuration", async () => {
		const oldClientId = initialConfig.clientId;
		const newClientId = "something-else";

		await request(app)
			.get("/authorize")
			.query({ client_id: oldClientId })
			.expect(302);

		await request(app)
			.patch(endpoint)
			.send([{ op: "replace", path: "/clientId", value: newClientId }])
			.expect(200, { ...initialConfig, clientId: newClientId });

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
			.expect(200, { ...initialConfig, codes: { [code]: token } });

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
			.expect(200, generateConfiguration());
	});

	it("rejects invalid configuration changes", async () => {
		await request(app)
			.patch(endpoint)
			.send([
				{ op: "add", path: "/accessToken", value: "something" },
				{ op: "test", path: "/accessToken", value: "somethingelse" },
				{ op: "add", path: "/callbackUrl", value: "http://failure.com/" },
			])
			.expect(422, startingConfiguration);

		return request(app)
			.get(endpoint)
			.expect(200, startingConfiguration);
	});
});
