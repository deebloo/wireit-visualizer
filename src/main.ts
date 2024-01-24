#! /usr/bin/env node
import { startServer } from "./main/server.js";

startServer();

process.on("SIGINT", () => {
  process.exit(0);
});
