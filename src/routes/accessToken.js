import { Router } from "express";
import qs from "querystring";

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

  res.send(qs.stringify(payload));
});

export default router;
