import { Router } from "express";
import jiff from "jiff";

export default (configuration) => {
  const router = new Router();

  router.get("/", (_, res) => {
    res.send(configuration);
  });

  router.patch("/", (req, res) => {
    jiff.patchInPlace(req.body, configuration);
    res.send(configuration);
  });

  return router;
};
