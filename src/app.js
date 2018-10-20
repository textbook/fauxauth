import express from "express";
import morgan from "morgan";
import url from "url";

export const app = express();

app.use(morgan("dev"));

app.get("/authorize", (req, res) => {
  const { state, redirect_uri: redirectUri } = req.query;

  res.redirect(
    url.format({
      pathname: redirectUri,
      query: state ? { state } : {},
    })
  );
});
