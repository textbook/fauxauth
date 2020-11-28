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

    if (!query.error) {
      const code = generateHex(20);
      configuration.codes.push(code);
      query.code = code;
    }

    const redirectUrl = format({ pathname, query });

    if (configuration.tokenMap) {
      res.render("index", {
        redirectUrl,
        roles: Object.keys(configuration.tokenMap),
      });
    } else {
      res.redirect(redirectUrl);
    }
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
