import express from "express";
import nunjucks from "nunjucks";

import { Graph } from "./create_graph.js";
import { find_deps } from "./find_deps.js";

var app = express();
const PORT = 3001;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.get("/", function (_req, res) {
  const graph = find_deps("package.json", new Graph([]));

  res.render("index.njks", {
    graph: graph.toString(),
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
