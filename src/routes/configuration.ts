import { Request, Response, Router } from "express";
import jiff from "jiff";

import * as configuration from "../config";

const router = Router();

router.get("/", (_: Request, res: Response) => {
	res.send(configuration.getAll());
});

router.patch("/", (req: Request, res: Response) => {
	try {
		configuration.update(jiff.patch(req.body, configuration.getAll()));
		res.send(configuration.getAll());
	} catch (e) {
		res.status(422).send(configuration.getAll());
	}
});

router.delete("/", (_: Request, res: Response) => {
	configuration.reset();
	res.sendStatus(204);
});

export default router;
