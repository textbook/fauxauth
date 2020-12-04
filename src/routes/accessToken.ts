import debug from "debug";
import { Router } from "express";
import qs from "querystring";
import { Builder } from "xml2js";

import { Configuration } from "../utils";

const log = debug("fauxauth:accessToken");

type AccessTokenQuery = {
	client_id: string;
	client_secret: string;
	code: string;
};

export default (configuration: Configuration): Router => {
	const builder = new Builder({
		headless: true,
		renderOpts: { pretty: false },
	});
	const router = Router();

	router.post("/", (req, res) => {
		log("POST received %j", req.body);
		const {
			client_id: clientId,
			client_secret: clientSecret,
			code,
		} = req.body as AccessTokenQuery;

		if (clientId !== configuration.clientId) {
			return res.sendStatus(404);
		}

		let payload = {};

		if (clientSecret !== configuration.clientSecret) {
			log("incorrect client secret: '%s' vs '%s'", clientSecret, configuration.clientSecret);
			payload = { error: "incorrect_client_credentials" };
		} else if (configuration.codes[code]) {
			log("removing '%s' from %j", code, configuration.codes);
			const token = configuration.codes[code];
			delete configuration.codes[code];
			payload = { access_token: token, token_type: "bearer" };
		} else {
			log("missing code: '%s' in %j", code, configuration.codes);
			payload = { error: "bad_verification_code" };
		}

		log("payload %j", payload);

		const accept = req.get("accept");

		if (accept === "application/json") {
			return res.json(payload);
		}

		if (accept === "application/xml") {
			return res.type(accept).send(builder.buildObject({ OAuth: payload }));
		}

		res.send(qs.stringify(payload));
	});

	return router;
};
