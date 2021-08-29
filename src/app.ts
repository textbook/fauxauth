import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";
import path from "path";

import { Configuration, initialise } from "./config";
import tokenRouter from "./routes/accessToken";
import authRouter from "./routes/authorize";
import configRouter from "./routes/configuration";

export default (overrides?: Partial<Configuration>): Application => {
	const app = express();
	initialise(overrides);

	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "..", "views"));
	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(morgan("dev"));

	app.use("/authorize", authRouter);
	app.use("/_configuration", configRouter);
	app.use("/access_token", tokenRouter);

	return app;
};
