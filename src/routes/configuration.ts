import { Request, Response, Router } from "express";
import jiff from "jiff";

import { Configuration, generateConfiguration } from "../utils";

export default (configuration: Configuration): Router => {
	const router = Router();

	router.get("/", (_: Request, res: Response) => {
		res.send(configuration);
	});

	router.patch("/", (req: Request, res: Response) => {
		try {
			// Ensure patch can be fully applied
			jiff.patch(req.body, configuration);
		} catch (e) {
			return res.status(422).send(configuration);
		}
		jiff.patchInPlace(req.body, configuration);
		res.send(configuration);
	});

	router.delete("/", (_: Request, res: Response) => {
		Object.assign(configuration, generateConfiguration());
		res.sendStatus(204);
	});

	return router;
};
