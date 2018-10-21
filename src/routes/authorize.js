import { Router } from "express";
import url from "url";

const router = new Router();

router.get("/", (req, res) => {
  const { state, redirect_uri: pathname } = req.query;
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

export default router;
