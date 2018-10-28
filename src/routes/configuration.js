import { Router } from "express";
import jiff from "jiff";

import { generateConfiguration } from "../utils";

export default (configuration) => {
  const router = new Router();

  router.get("/", (_, res) => {
    res.send(configuration);
  });

  router.patch("/", (req, res) => {
    jiff.patchInPlace(req.body, configuration);
    res.send(configuration);
  });

  router.delete("/", (req, res) => {
    Object.assign(configuration, generateConfiguration());
    res.sendStatus(204);
  });

  return router;
};
