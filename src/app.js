import express from "express";
import morgan from "morgan";
import url from "url";

export const app = express();

app.use(morgan("dev"));

app.get("/authorize", (req, res) => {
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
