import express from "express";
import nunjucks from "nunjucks";
import { readFileSync } from "fs";
import { Analyzer } from "wireit/lib/analyzer.js";

import { MermaidGraph } from "./graph.js";
import { find_deps } from "./find_deps.js";

var app = express();
const PORT = 4300;

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

const analyzer = new Analyzer("npm");

app.get("/", async function (_req, res) {
  const mermaid = new MermaidGraph("flowchart TD", []);
  const projectJson = JSON.parse(readFileSync("./package.json").toString());

  for (let task of Object.keys(projectJson.wireit)) {
    await find_deps(
      {
        name: task,
        packageDir: "./",
      },
      analyzer,
      mermaid
    );
  }

  res.render("index.html", {
    graph: mermaid.toString(),
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
