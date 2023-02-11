import { createHash } from "crypto";

import { components } from "@octokit/openapi-types";

/**
 * @link https://docs.github.com/en/rest/users/emails?apiVersion=2022-11-28#list-email-addresses-for-the-authenticated-user
 */
type GitHubEmail = components["schemas"]["email"];

/**
 * @link https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
 */
type GitHubUser = components["schemas"]["private-user"];

export interface UserSpec {
	_id: string;
	emails: GitHubEmail[];
	token: string;
	user: GitHubUser;
}

export interface User {
	gitHubId: number;
	gitHubLogin?: string;
	name?: string;
	privateEmails?: string[];
	publicEmails?: string[];
	token: string;
}

export default function createSpec({
	gitHubId,
	gitHubLogin,
	name,
	privateEmails = [],
	publicEmails = [],
	token,
}: User): UserSpec {
	let login = gitHubLogin;
	if (login === undefined) {
		if (name === undefined) {
			throw new Error("A user must have a name or gitHubLogin");
		}
		login = name.toLowerCase().split(" ").join("-");
	}

	const emails = [
		...publicEmails.map((email) => createEmail(email, "public")),
		...privateEmails.map((email) => createEmail(email, "private")),
	];
	if (emails.length === 0) {
		throw new Error("A user must have some emails");
	}
	const [primaryEmail] = emails;
	primaryEmail.primary = true;

	const gravatarId = createGravatarId(primaryEmail.email);

	return {
		_id: emails[0].email,
		emails,
		token,
		user: createUser({
			email: publicEmails.length === 0 ? null : publicEmails[0],
			gravatarId,
			id: gitHubId,
			login,
			name: name ?? null,
		}),
	};
}

const createEmail = (email: string, visibility: "public" | "private"): GitHubEmail => ({
	email,
	primary: false,
	verified: true,
	visibility,
});

const createGravatarId = (email: string): string => createHash("md5")
	.update(email.trim().toLowerCase())
	.digest("hex");

const createUser = ({
	email,
	gravatarId,
	id,
	login,
	name,
}: {
	email: string | null,
	gravatarId: string,
	id: number,
	login: string,
	name: string | null,
}): GitHubUser => ({
	avatar_url: `https://www.gravatar.com/avatar/${gravatarId}?default=identicon`,
	email,
	gravatar_id: gravatarId,
	html_url: `https://github.com/${login}`,
	id,
	login,
	name,
	type: "User",
	url: `https://api.github.com/users/${login}`,
} as GitHubUser);
