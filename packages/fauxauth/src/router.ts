import cors from "cors";
import { json, type RequestHandler, Router, urlencoded } from "express";
import url from "url";

import tokenRouter from "./routes/accessToken.js";
import authRouter from "./routes/authorize.js";
import { Configuration, initialise } from "./config.js";

export interface CoreRouter {
	middleware: RequestHandler[];
	routes: Router;
	views: {
		directory: string;
		engine: string;
	}
}

export default (configuration?: Partial<Configuration>): CoreRouter => {
	const routes = Router();
	initialise(configuration);
	routes.use("/authorize", authRouter);
	routes.use("/access_token", tokenRouter);
	return {
		routes,
		middleware: [cors(), json(), urlencoded({ extended: false })],
		views: {
			directory: url.fileURLToPath(new URL("../views", import.meta.url)),
			engine: "pug",
		},
	};
};
