import { Router } from "express";
import qs from "querystring";
import { Builder } from "xml2js";

import { Configuration, generateHex } from "../utils";

type AccessTokenQuery = {
  client_id: string;
  client_secret: string;
  code: string;
};

export default (configuration: Configuration) => {
  const builder = new Builder({
    headless: true,
    renderOpts: { pretty: false },
  });
  const router = Router();

  router.post("/", (req, res) => {
    const {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    } = req.body as AccessTokenQuery;

    if (clientId !== configuration.clientId) {
      return res.sendStatus(404);
    }

    const accept = req.get("accept");

    let payload = {};

    if (clientSecret !== configuration.clientSecret) {
      payload = { error: "incorrect_client_credentials" };
    } else if (configuration.codes.indexOf(code) === -1) {
      payload = { error: "bad_verification_code" };
    } else {
      configuration.codes = configuration.codes.filter(
        (existingCode: string) => existingCode !== code,
      );
      payload = {
        access_token: configuration.accessToken || generateHex(40),
        token_type: "bearer",
      };
    }

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
