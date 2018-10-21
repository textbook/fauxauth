import express from "express";
import morgan from "morgan";

import authRouter from "./routes/authorize";
import tokenRouter from "./routes/accessToken";

export const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/access_token", tokenRouter);
app.use("/authorize", authRouter);
