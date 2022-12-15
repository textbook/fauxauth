import axios from "axios";
import { format, parse, URLSearchParams } from "url";
import { remote } from "webdriverio";

const baseUrl = process.env.FAUXAUTH_URL || "http://localhost:3000";

const webdriverConfig = {
	baseUrl,
	capabilities: { browserName: process.env.BROWSER || "chrome" },
	hostname: process.env.SELENIUM_HOST || "localhost",
	logLevel: "warn",
	path: process.env.SELENIUM_PATH || "/wd/hub",
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

	it("works with default configuration", async () => {
		const state = "testing";

		let res = await makeRequest("/authorize", {
			followRedirect: false,
			qs: { client_id: "1ae9b0ca17e754106b51", state },
		});
		expect(res.statusCode).toBe(302);
		const { query, search, ...url } = parse(res.headers.location, true);
		expect(format(url)).toBe("http://example.org/");
		expect(query.state).toBe(state);
		expect(query.code).toMatch(/[0-9a-f]{20}/);

		res = await makeRequest("/access_token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
				code: query.code,
				state,
			}).toString(),
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toMatch(/access_token=[0-9a-f]{40}/);
	});

	it("works with custom configuration", async () => {
		const code = "deadbeef";
		const token = "somereallylongtoken";
		let res = await makeRequest("/_configuration", {
			body: [
				{
					op: "add",
					path: `/codes/${code}`,
					value: { token },
				},
				{ op: "replace", path: "/clientSecret", value: "notsosecret" },
			],
			json: true,
			method: "PATCH",
		});
		expect(res.statusCode).toBe(200);

		res = await makeRequest("/access_token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				client_secret: "notsosecret",
				code,
			}).toString(),
		});
		expect(res.statusCode).toBe(200);
		expect(res.body).toContain(`access_token=${token}`);
	});

	it("supports scope management", async () => {
		const { headers } = await makeRequest("/authorize", {
			followRedirect: false,
			qs: { client_id: "1ae9b0ca17e754106b51", scope: "public_repo read:user" },
		});
		const { query: { code } } = parse(headers.location, true);

		const { body } = await makeRequest("/access_token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
				code,
			}).toString(),
		});
		expect(Object.fromEntries(new URLSearchParams(body).entries())).toEqual({
			access_token: expect.stringMatching(/^[a-z0-9]{40}$/),
			scope: "public_repo,read:user",
			token_type: "bearer",
		});
	});

	it("appends scopes if requested", async () => {
		await makeRequest("/_configuration", {
			body: [
				{ op: "replace", path: "/appendScopes", value: true },
			],
			json: true,
			method: "PATCH",
		});

		const { headers } = await makeRequest("/authorize", {
			followRedirect: false,
			qs: { client_id: "1ae9b0ca17e754106b51", scope: "public_repo read:user" },
		});
		const { query: { code } } = parse(headers.location, true);

		const { body } = await makeRequest("/access_token", {
			method: "POST",
			body: new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
				code,
			}).toString(),
		});
		expect(Object.fromEntries(new URLSearchParams(body).entries())).toEqual({
			access_token: expect.stringMatching(/^[a-z0-9]{40}\/public_repo\/read:user$/),
			scope: "public_repo,read:user",
			token_type: "bearer",
		});
	});

	describe("with a token map", () => {
		it("provides a browser flow", async () => {
			let res = await makeRequest("/_configuration", addTokenMapOptions({
				"Administrator": "secretadmintoken",
				"User": "secretusertoken",
			}));
			expect(res.statusCode).toBe(200);

			await browser.url("/authorize?client_id=1ae9b0ca17e754106b51&state=bananas&redirect_uri=http%3A%2F%2Fexample.org%2Ftest");
			const select = await browser.$("#role-select");
			await select.selectByVisibleText("User");
			const button = await browser.$("#submit-button");
			await button.click();

			const url = await browser.getUrl();
			const { host, pathname, query } = parse(url, true);
			expect(host).toBe("example.org");
			expect(pathname).toBe("/test");
			expect(query).toEqual({
				code: expect.stringMatching(/[a-z0-9]{20}/i),
				state: "bananas",
			});

			res = await makeRequest("/access_token", {
				method: "POST",
				body: new URLSearchParams({
					client_id: "1ae9b0ca17e754106b51",
					client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
					code: query.code,
				}).toString(),
			});
			expect(res.statusCode).toBe(200);
			expect(res.body).toContain("access_token=secretusertoken");
		});

		it("supports scope management", async () => {
			await makeRequest("/_configuration", addTokenMapOptions({
				"Administrator": "secretadmintoken",
				"User": "secretusertoken",
			}));
			const options = new URLSearchParams({
				client_id: "1ae9b0ca17e754106b51",
				redirect_uri: "http://example.org/test",
				scope: ["read:user", "user:email", "read:org"].join(" "),
				state: "bananas",
			});

			await browser.url(`/authorize?${options.toString()}`);
			const select = await browser.$("#role-select");
			await select.selectByVisibleText("Administrator");
			const readScope = await browser.$("#scope-read\\:user");
			await expect(readScope.isSelected()).resolves.toBe(true);
			const emailScope = await browser.$("#scope-user\\:email");
			await expect(emailScope.isSelected()).resolves.toBe(true);
			await emailScope.click();
			await expect(emailScope.isSelected()).resolves.toBe(false);
			const button = await browser.$("#submit-button");
			await button.click();

			const url = await browser.getUrl();
			const { query: { code } } = parse(url, true);

			const res = await makeRequest("/access_token", {
				method: "POST",
				body: new URLSearchParams({
					client_id: "1ae9b0ca17e754106b51",
					client_secret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
					code,
				}).toString(),
			});
			expect(res.statusCode).toBe(200);
			expect(Object.fromEntries(new URLSearchParams(res.body).entries())).toEqual({
				access_token: "secretadmintoken",
				scope: "read:user,read:org",
				token_type: "bearer",
			});
		});
	});
});

const addTokenMapOptions = (tokenMap) => ({
	body: [
		{ op: "add", path: "/tokenMap", value: tokenMap },
	],
	json: true,
	method: "PATCH",
});

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
