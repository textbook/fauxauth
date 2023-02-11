import { type RequestHandler, Router } from "express";

import { type UserSpec } from "./users.js";

export const createRoutes = (data: Record<string, UserSpec>): Router => {
	const router = Router();
	router.get("/user", requireAuth, (req, res, next) => {
		if (req.token in data) {
			return res.status(200).send(data[req.token].user);
		}
		next();
	});
	router.get("/user/emails", requireAuth, (req, res, next) => {
		if (req.token in data) {
			return res.status(200).send(data[req.token].emails);
		}
		next();
	});
	return router;
};

const requireAuth: RequestHandler =  (req, res, next) => {
	const unauthenticated = () => res.status(401).send({ message: "Requires authentication" });
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		return unauthenticated();
	}
	const [scheme, token] = authHeader.split(" ");
	if (!["Bearer", "token"].includes(scheme)) {
		return unauthenticated();
	}
	req.token = token;
	next();
};
