import { Router } from "express";
import url from "url";

export default (configuration) => {
  const router = new Router();

  router.get("/", (req, res) => {
    const { state, redirect_uri: pathname, client_id: clientId } = req.query;
    if (clientId !== configuration.clientId) {
      return res.sendStatus(404);
    }

    const query = { code: "helloworld" };
    if (state) {
      query.state = state;
    }

    res.redirect(
      url.format({
        pathname,
        query,
      })
    );
  });

  return router;
};
