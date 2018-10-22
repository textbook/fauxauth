import express from "express";
import morgan from "morgan";

import authRouter from "./routes/authorize";
import tokenRouter from "./routes/accessToken";

export default (configuration) => {
  const app = express();

  app.use(express.json());
  app.use(morgan("dev"));

  app.use("/access_token", tokenRouter(configuration));
  app.use("/authorize", authRouter(configuration));

  return app;
};
