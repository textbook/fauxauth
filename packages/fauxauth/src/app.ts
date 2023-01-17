import express, { Application } from "express";
import morgan from "morgan";

import { Configuration } from "./config.js";
import configRouter from "./routes/configuration.js";
import coreRouter from "./router.js";

export default (overrides?: Partial<Configuration>): Application => {
	const app = express();
	const { middleware, routes, views } = coreRouter(overrides);

	app.set("view engine", views.engine);
	app.set("views", views.directory);
	app.use(middleware);
	app.use(morgan("dev"));

	app.use("/", routes);
	app.use("/_configuration", configRouter);

	return app;
};
