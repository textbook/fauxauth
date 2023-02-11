import express, { Application } from "express";
import { Configuration as FauxauthConfig, coreRouter } from "fauxauth";

import { createRoutes } from "./routes";

export type Configuration = Pick<FauxauthConfig, "appendScopes" | "callbackUrl" | "clientId" | "clientSecret">;

export default (configuration: Partial<Configuration> = {}): Application => {
	const app = express();
	const { middleware, routes, views } = coreRouter({ ...configuration, tokenMap: {} });
	app.set("view engine", views.engine);
	app.set("views", views.directory);
	app.use(middleware);

	app.use("/api", createRoutes());
	app.use("/login/oauth", routes);

	return app;
};
