import { Router } from "express";
import qs from "querystring";
import { Builder } from "xml2js";

const builder = new Builder({ renderOpts: { pretty: false }, headless: true });
const router = new Router();

router.post("/", (req, res) => {
  const accept = req.get("accept");

  const payload = {
    access_token: "e72e16c7e42f292c6912e7710c838347ae178b4a",
    token_type: "bearer",
  };

  if (accept === "application/json") {
    return res.json(payload);
  }

  if (accept === "application/xml") {
    return res.type(accept).send(builder.buildObject({ OAuth: payload }));
  }

  res.send(qs.stringify(payload));
});

export default router;
