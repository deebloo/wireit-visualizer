#! /usr/bin/env node

import { readFileSync } from "node:fs";
import * as url from "node:url";
import { resolve } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import detectPort from "detect-port";

import { Graph } from "./graph.js";
import { EsmReader, WireitAnalyzer } from "./analyzer.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

var app = express();

const PORT = await detectPort(4200);

nunjucks.configure(resolve(__dirname, "../views"), {
  autoescape: true,
});

app.use(express.static(resolve(__dirname, "../target/ui")));
app.use(express.static(resolve(__dirname, "../vendor")));

app.get("/data", async (req, res) => {
  const taskQuery = req.query.task;

  let tasks: string[] = [];

  if (typeof taskQuery === "string") {
    tasks.push(taskQuery);
  } else if (Array.isArray(taskQuery)) {
    for (let task of taskQuery) {
      if (typeof task === "string") {
        tasks.push(task);
      }
    }
  } else if (!taskQuery) {
    // if not tasks are defined, find them in the root package.json
    const projectJson = JSON.parse(
      readFileSync(resolve("./package.json")).toString()
    );

    tasks = Object.keys(projectJson.wireit).map((task) => `./:${task}`);
  }

  const graph = await analyzeTasks(tasks);

  res.send(graph.graph);
});

app.get("/", async (_req, res) => {
  res.send(nunjucks.render("graphviz.html"));
});

app.get("/mermaid", async (_req, res) => {
  res.send(nunjucks.render("mermaid.html"));
});

app.listen(PORT, () => {
  console.log(`Visualizing build on port ${PORT}`);
});

process.on("SIGINT", () => {
  process.exit(0);
});

async function analyzeTasks(tasks: string[]) {
  const analyzer = new WireitAnalyzer(new EsmReader());
  const graph = new Graph(analyzer);

  await Promise.all(
    tasks.map((taskPath) => {
      const [packageDir, ...task] = taskPath.split(":");

      return graph.analyze({
        name: task.join(":"),
        packageDir,
      });
    })
  );

  return graph;
}
