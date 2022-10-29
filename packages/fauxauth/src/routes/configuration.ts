import { Request, Response, Router } from "express";
import jiff from "jiff";

import { Configuration, getAll, reset, update } from "../config.js";

const router = Router();

router.get("/", (_: Request, res: Response<Configuration>) => {
	res.send(getAll());
});

router.patch("/", (req: Request, res: Response<Configuration>) => {
	try {
		update(jiff.patch(req.body, getAll()));
		res.send(getAll());
	} catch (e) {
		res.status(422).send(getAll());
	}
});

router.delete("/", (_: Request, res: Response) => {
	reset();
	res.sendStatus(204);
});

export default router;
