import debug from "debug";
import { Request, Response, Router } from "express";
import { ParsedUrlQueryInput } from "querystring";
import { format, parse } from "url";

import { Configuration, generateHex } from "../utils";

const log = debug("fauxauth:authorize");

type AuthorizeQuery = {
	client_id: string;
	redirect_uri?: string;
	state?: string;
};

export default (configuration: Configuration): Router => {
	const router = Router();

	router.get("/", (req: Request, res: Response) => {
		log("GET received %j", req.query);
		const {
			client_id: clientId,
			redirect_uri: redirectUri,
			state,
		} = req.query as AuthorizeQuery;

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

	router.post("/", (req, res) => {
		log("POST received %j", req.body);
		const { redirect_uri: pathname, ...query } = req.body;
		res.redirect(format({ pathname, query }));
	});

	return router;
};

export const validateRedirect = (
	redirectUri: string,
	callbackUrl: string,
): boolean => {
	const redirect = parse(redirectUri);
	const callback = parse(callbackUrl);
	return (
		redirect.host === callback.host
		&& redirect.port === callback.port
		&& typeof redirect.path === "string"
		&& typeof callback.path === "string"
		&& redirect.path.startsWith(callback.path)
	);
};
