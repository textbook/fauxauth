import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";
import url from "url";

import { Configuration, initialise } from "./config.js";
import tokenRouter from "./routes/accessToken.js";
import authRouter from "./routes/authorize.js";
import configRouter from "./routes/configuration.js";

export default (overrides?: Partial<Configuration>): Application => {
	const app = express();
	initialise(overrides);

	app.set("view engine", "pug");
	app.set("views", url.fileURLToPath(new URL("../views", import.meta.url)));
	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(morgan("dev"));

	app.use("/authorize", authRouter);
	app.use("/_configuration", configRouter);
	app.use("/access_token", tokenRouter);

	return app;
};
