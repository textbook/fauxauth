import { Router } from "express";
import { format, parse } from "url";

import { generateHex } from "../utils";

export default (configuration) => {
  const router = new Router();

  router.get("/", (req, res) => {
    const { state, redirect_uri: redirectUri, client_id: clientId } = req.query;
    if (clientId !== configuration.clientId) {
      return res.sendStatus(404);
    }

    let pathname = configuration.callbackUrl;
    const query = {};

    if (state) {
      query.state = state;
    }

    if (redirectUri) {
      if (validateRedirect(redirectUri, configuration.callbackUrl)) {
        pathname = redirectUri;
      } else {
        query.error = "redirect_uri_mismatch";
      }
    }

    if (!query.error) {
      const code = generateHex(20);
      configuration.codes.push(code);
      query.code = code;
    }

    res.redirect(format({ pathname, query }));
  });

  return router;
};

export const validateRedirect = (redirectUri, callbackUrl) => {
  const redirect = parse(redirectUri);
  const callback = parse(callbackUrl);
  return (
    redirect.host === callback.host
    && redirect.port === callback.port
    && redirect.path.indexOf(callback.path) === 0
  );
};
