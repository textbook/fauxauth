import createSpec from "./users";

const GRAVATAR_URL = /^https:\/\/www.gravatar.com\/avatar\/[\da-f]+\?default=identicon/;

describe("users", () => {
	it("creates a user object", () => {
		const { _id, emails, token, user } = createSpec({
			gitHubId: 1,
			gitHubLogin: "octocat",
			name: "Monalisa Octocat",
			publicEmails: ["octocat@github.com"],
			token: "abc123",
		});
		expect(_id).toBe("octocat@github.com");
		expect(token).toBe("abc123");
		expect(emails).toEqual(expect.arrayContaining([
			{ email: "octocat@github.com", primary: true, visibility: "public", verified: true },
		]));
		expect(user).toEqual({
			avatar_url: expect.stringMatching(GRAVATAR_URL),
			html_url: "https://github.com/octocat",
			gravatar_id: expect.stringMatching(/^[\da-f]+$/),
			id: 1,
			email: "octocat@github.com",
			login: "octocat",
			name: "Monalisa Octocat",
			type: "User",
			url: "https://api.github.com/users/octocat",
		});
	});

	it("allows user's emails to be private", () => {
		expect(createSpec({
			gitHubId: 0,
			name: "",
			privateEmails: [""],
			token: "",
		})).toHaveProperty("user", expect.objectContaining({ email: null }));
	});

	it("allows name to be undefined", () => {
		expect(createSpec({
			gitHubId: 0,
			gitHubLogin: "",
			privateEmails: [""],
			token: "",
		})).toHaveProperty("user", expect.objectContaining({ name: null }));
	});

	it("creates login from name by default", () => {
		expect(createSpec({
			gitHubId: 0,
			name: "John Doe",
			publicEmails: [""],
			token: "",
		})).toHaveProperty("user", expect.objectContaining({ login: "john-doe" }));
	});

	it("requires at least one of name or login", () => {
		expect(() => createSpec({
			gitHubId: 0,
			publicEmails: [""],
			token: "",
		})).toThrow("A user must have a name or gitHubLogin");
	});

	it("requires at least one email", () => {
		expect(() => createSpec({
			gitHubId: 0,
			name: "",
			token: "",
		})).toThrow("A user must have some emails");
	});
});
