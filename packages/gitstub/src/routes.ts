import { type RequestHandler, Router } from "express";

export const createRoutes = (): Router => {
	const router = Router();
	router.get("/user", requireAuth);
	router.get("/user/emails", requireAuth);
	return router;
};

const requireAuth: RequestHandler =  (req, res) => {
	res.status(401).send({ message: "Requires authentication" });
};
