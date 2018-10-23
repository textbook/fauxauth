import { Router } from "express";
import { format, parse } from "url";

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
      query.code = "helloworld";
    }

    res.redirect(format({ pathname, query }));
  });

  return router;
};

export const validateRedirect = (redirectUri, callbackUrl) => {
  const { host: redirectHost, port: redirectPort, path: redirectPath } = parse(
    redirectUri
  );
  const { host: callbackHost, port: callbackPort, path: callbackPath } = parse(
    callbackUrl
  );
  return (
    redirectHost === callbackHost
    && redirectPort === callbackPort
    && redirectPath.indexOf(callbackPath) === 0
  );
};
