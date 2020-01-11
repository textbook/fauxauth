import cors from "cors";
import express from "express";
import morgan from "morgan";

import tokenRouter from "./routes/accessToken";
import authRouter from "./routes/authorize";
import configRouter from "./routes/configuration";
import { Configuration } from "./utils";

export default (configuration: Configuration) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/authorize", authRouter(configuration));
  app.use("/_configuration", configRouter(configuration));
  app.use("/access_token", tokenRouter(configuration));

  return app;
};
