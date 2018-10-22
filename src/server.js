#! /usr/bin/env node

import http from "http";

import appFactory from "./app";

const port = parseInt(process.env.PORT || "3000", 10);

const server = http.createServer(
  appFactory({
    clientId: "1ae9b0ca17e754106b51",
    clientSecret: "3efb56fdbac1cb21f3d4fea9b70036e04a34d068",
  })
);

server.listen(port);

server.on("listening", () => {
  // eslint-disable-next-line no-console
  console.log(`listening on port ${port}`);
});
