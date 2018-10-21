#! /usr/bin/env node

import http from "http";

import { app } from "./app";

const port = parseInt(process.env.PORT || "3000", 10);

const server = http.createServer(app);

server.listen(port);

server.on("listening", () => {
  // eslint-disable-next-line no-console
  console.log(`listening on port ${port}`);
});
