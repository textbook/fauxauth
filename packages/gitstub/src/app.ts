import express, { type Application } from "express";
import { type Configuration as FauxauthConfig, coreRouter } from "fauxauth";

import { createRoutes } from "./routes.js";
import createSpec, { type User } from "./users.js";

export type Configuration = {
	users: User[];
} & Pick<FauxauthConfig, "appendScopes" | "callbackUrl" | "clientId" | "clientSecret">;

export default ({ users = [], ...configuration }: Partial<Configuration> = {}): Application => {
	const app = express();
	const data = Object.fromEntries(users.map(createSpec).map((spec) => [spec.token, spec]));
	const tokenMap = Object.fromEntries(Object.values(data).map(({ _id, token }) => [_id, token]));

	const { middleware, routes, views } = coreRouter({ ...configuration, tokenMap });
	app.set("view engine", views.engine);
	app.set("views", views.directory);
	app.use(middleware);
	app.use("/api", createRoutes(data));
	app.use("/login/oauth", routes);

	return app;
};
