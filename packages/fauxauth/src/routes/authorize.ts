import debug from "debug";
import { Request, Response, Router } from "express";
import { ParsedUrlQueryInput } from "querystring";
import { format, URL } from "url";

import { getAll } from "../config";
import { generateHex } from "../utils";

const log = debug("fauxauth:authorize");

type AuthorizeQuery = {
	client_id: string;
	redirect_uri?: string;
	state?: string;
};

const router = Router();

router.get("/", (
	req: Request<unknown, unknown, unknown, AuthorizeQuery>,
	res: Response,
) => {
	log("GET received %j", req.query);
	const configuration = getAll();
	const {
		client_id: clientId,
		redirect_uri: redirectUri,
		state,
	} = req.query;

	if (clientId !== configuration.clientId) {
		log("incorrect client ID: '%s' vs '%s'", clientId, configuration.clientId);
		return res.sendStatus(404);
	}

	let pathname = configuration.callbackUrl;
	const query: ParsedUrlQueryInput = {};

	if (state) {
		query.state = state;
	}

	if (redirectUri) {
		if (validateRedirect(redirectUri, configuration.callbackUrl)) {
			pathname = redirectUri;
		} else {
			log("invalid redirect: '%s' vs. '%s'", redirectUri, configuration.callbackUrl);
			query.error = "redirect_uri_mismatch";
		}
	}

	if (query.error) {
		return res.redirect(format({ pathname, query }));
	}

	if (!configuration.tokenMap) {
		const code = generateHex(20);
		configuration.codes[code] = generateHex(40);
		query.code = code;
		log("sending '%s' from %j", code, configuration.codes);
		const location = format({ pathname, query });
		log("redirecting to '%s'", location);
		return res.redirect(location);
	}

	const roles: { [role: string]: string } = {};
	for (const role of Object.keys(configuration.tokenMap)) {
		const code = generateHex(20);
		roles[role] = code;
		configuration.codes[code] = configuration.tokenMap[role];
	}

	log("sending '%j' from %j", roles, configuration.codes);

	res.render("index", { query: { ...query, redirect_uri: pathname }, roles });
});

router.post("/", (
	req: Request<unknown, unknown, { [key: string]: string }>,
	res: Response
) => {
	log("POST received %j", req.body);
	const { redirect_uri: pathname, ...query } = req.body;
	res.redirect(format({ pathname, query }));
});

export default router;

export const validateRedirect = (
	redirectUri: string,
	callbackUrl: string,
): boolean => {
	const redirect = new URL(redirectUri);
	const callback = new URL(callbackUrl);
	return (
		redirect.host === callback.host
		&& redirect.protocol == callback.protocol
		&& redirect.port === callback.port
		&& redirect.pathname.startsWith(callback.pathname)
	);
};
