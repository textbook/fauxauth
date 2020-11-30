import { Request, Response, Router } from "express";
import { ParsedUrlQueryInput } from "querystring";
import { format, parse } from "url";

import { Configuration, generateHex } from "../utils";

type AuthorizeQuery = {
  client_id: string;
  redirect_uri?: string;
  state?: string;
};

export default (configuration: Configuration) => {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const {
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    } = req.query as AuthorizeQuery;
    if (clientId !== configuration.clientId) {
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
      return res.redirect(format({ pathname, query }));
    }

    query.code = "placeholder";
    const redirectUrl = format({ pathname, query });

    const roles: { [role: string]: string } = {};
    Object.keys(configuration.tokenMap).forEach((role) => {
      const code = generateHex(20);
      roles[role] = code;
      configuration.codes[code] = configuration.tokenMap![role];
    });

    res.render("index", { query: { ...query, redirect_uri: redirectUrl }, roles });
  });

  router.post("/", (req, res) => {
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
    redirect.host === callback.host &&
    redirect.port === callback.port &&
    redirect.path!.indexOf(callback.path!) === 0
  );
};
