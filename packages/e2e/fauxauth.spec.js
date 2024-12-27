import axios from "axios";
import { remote } from "webdriverio";

const baseUrl = process.env.FAUXAUTH_URL || "http://localhost:3000";

/** @type {import("webdriverio").RemoteOptions} */
const webdriverConfig = {
	baseUrl,
	capabilities: {
		browserName: process.env.BROWSER || "chrome",
		"goog:chromeOptions": {
			args: ["disable-gpu", "headless"],
		},
	},
	hostname: process.env.SELENIUM_HOST,
	logLevel: process.env.WD_LOG_LEVEL || "warn",
	path: process.env.SELENIUM_PATH,
	port: process.env.SELENIUM_PORT ? parseInt(process.env.SELENIUM_PORT, 10) : undefined,
};

describe("fauxauth", () => {
	let browser;

	beforeAll(async () => {
		browser = await remote(webdriverConfig);
	});

	beforeEach(async () => {
		const { statusCode } = await makeRequest("/_configuration", { method: "DELETE" });
		if (statusCode !== 204) {
			throw new Error("failed to reset configuration");
		}
	});

	afterAll(async () => {
		if (browser) {
			await browser.deleteSession();
		}
	});

	it("renders a basic home page", async () => {
		await browser.url("/");
		const title = await browser.$("h1");
		await expect(title.getText()).resolves.toBe("Fauxauth");
	});

	it("works with default configuration", async () => {
		const state = "testing";

		const { headers: { location } } = await authorize({ state });
		const url = new URL(location);
		expect(url.origin).toBe("http://example.org");
		expect(url.searchParams.get("state")).toBe(state);
		expect(url.searchParams.get("code")).toMatch(/[0-9a-f]{20}/);

		const { body } = await accessToken({ code: url.searchParams.get("code"), state });
		expect(body).toMatch(/access_token=[0-9a-f]{40}/);
	});

	it("works with custom configuration", async () => {
		const code = "deadbeef";
		const token = "somereallylongtoken";
		await configure([
			{ op: "add", path: `/codes/${code}`, value: { token } },
			{ op: "replace", path: "/clientSecret", value: "notsosecret" },
		]);

		const { body } = await accessToken({ client_secret: "notsosecret", code });
		expect(body).toContain(`access_token=${token}`);
	});

	it("supports scope management", async () => {
		const { headers } = await authorize({ scope: "public_repo read:user" });
		const url = new URL(headers.location);

		const { body } = await accessToken({ code: url.searchParams.get("code") });
		expect(Object.fromEntries(new URLSearchParams(body).entries())).toEqual({
			access_token: expect.stringMatching(/^[a-f\d]{40}$/),
			scope: "public_repo,read:user",
			token_type: "bearer",
		});
	});

	it("appends scopes if requested", async () => {
		await configure([{ op: "replace", path: "/appendScopes", value: true }]);

		const { headers } = await authorize({ scope: "public_repo read:user" });
		const url = new URL(headers.location);

		const { body } = await accessToken({ code: url.searchParams.get("code") });
		expect(Object.fromEntries(new URLSearchParams(body).entries())).toEqual({
			access_token: expect.stringMatching(/^[a-f\d]{40}\/public_repo\/read:user$/),
			scope: "public_repo,read:user",
			token_type: "bearer",
		});
	});

	describe("with a token map", () => {
		it("provides a browser flow", async () => {
			await configure([{
				op: "add",
				path: "/tokenMap",
				value: { "Administrator": "secretadmintoken", "User": "secretusertoken" },
			}]);

			const options = new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				state: "bananas",
				redirect_uri: "http://example.org/test",
			});
			await browser.url(`/authorize?${options}`);
			const select = await browser.$("#role-select");
			await select.selectByVisibleText("User");
			const button = await browser.$("#submit-button");
			await button.click();

			const url = new URL(await browser.getUrl());
			expect(url.origin).toBe("https://example.org");
			expect(url.pathname).toBe("/test");
			expect(Object.fromEntries(url.searchParams.entries())).toEqual({
				code: expect.stringMatching(/^[a-f\d]{20}$/i),
				state: "bananas",
			});

			const { body } = await accessToken({ code: url.searchParams.get("code") });
			expect(body).toContain("access_token=secretusertoken");
		});

		it("supports scope management", async () => {
			await configure([{
				op: "add",
				path: "/tokenMap",
				value: { "Administrator": "secretadmintoken", "User": "secretusertoken" },
			}]);

			const options = new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				redirect_uri: "http://example.org/test",
				scope: ["read:user", "read:org"].join(" "),
				state: "bananas",
			});
			await browser.url(`/authorize?${options}`);
			const select = await browser.$("#role-select");
			await select.selectByVisibleText("Administrator");
			const readScope = await browser.$("#scope-read\\:user");
			await expect(readScope.isSelected()).resolves.toBe(true);
			const emailScope = await browser.$("#scope-read\\:org");
			await expect(emailScope.isSelected()).resolves.toBe(true);
			await emailScope.click();
			await expect(emailScope.isSelected()).resolves.toBe(false);
			const button = await browser.$("#submit-button");
			await button.click();

			const url = new URL(await browser.getUrl());

			const { body } = await accessToken({ code: url.searchParams.get("code") });
			expect(Object.fromEntries(new URLSearchParams(body).entries())).toEqual({
				access_token: "secretadmintoken",
				scope: "read:user",
				token_type: "bearer",
			});
		});
	});
});

const accessToken = async (params) => {
	const res = await makeRequest("/access_token", {
		method: "POST",
		body: new URLSearchParams({
			client_id: "1ae9b0ca17e754106b51",
			client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
			...params,
		}).toString(),
	});
	expect(res.statusCode).toBe(200);
	return res;
};

const authorize = async (params) => {
	const res = await makeRequest("/authorize", {
		followRedirect: false,
		qs: { client_id: "1ae9b0ca17e754106b51", ...params },
	});
	expect(res.statusCode).toBe(302);
	return res;
};

const configure = async (body) => {
	const res = await makeRequest("/_configuration", { body, json: true, method: "PATCH" });
	expect(res.statusCode).toBe(200);
	return res;
};

const makeRequest = (url, options) => axios
	.request({
		baseURL: baseUrl,
		data: options.body,
		method: options.method,
		params: options.qs,
		maxRedirects: options.followRedirect !== false ? 5 : 0,
		url,
	})
	.catch((error) => {
		if (error.response) {
			return error.response;
		}
		throw error;
	})
	.then(({ data, headers, status }) => ({
		body: data,
		headers,
		statusCode: status,
	}));
