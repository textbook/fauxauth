import express from "express";
import morgan from "morgan";
import url from "url";

export const app = express();

app.use(express.json());
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

app.post("/access_token", (req, res) => {
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
