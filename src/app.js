import express from "express";
import morgan from "morgan";

import authRouter from "./routes/authorize";
import configRouter from "./routes/configuration";
import tokenRouter from "./routes/accessToken";

export default (configuration) => {
  const app = express();

  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/authorize", authRouter(configuration));
  app.use("/_configuration", configRouter(configuration));
  app.use("/access_token", tokenRouter(configuration));

  return app;
};
