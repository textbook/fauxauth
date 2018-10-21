import { Router } from "express";

const router = new Router();

router.post("/", (req, res) => {
  const accept = req.get("accept");
  const accessToken = "e72e16c7e42f292c6912e7710c838347ae178b4a";
  const tokenType = "bearer";

  if (accept === "application/json") {
    return res.json({
      access_token: accessToken,
      token_type: tokenType,
    });
  }
  res.send(`access_token=${accessToken}&token_type=${tokenType}`);
});

export default router;
