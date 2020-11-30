#! /usr/bin/env node

import http from "http";

import appFactory, { generateConfiguration } from ".";

const port = parseInt(process.env.PORT || "3000", 10);

const server = http.createServer(appFactory(generateConfiguration()));

server.listen(port);

server.on("listening", () => {
	// tslint:disable-next-line:no-console
	console.log(`listening on port ${port}`);
});
