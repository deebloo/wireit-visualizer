#! /usr/bin/env node

import express from "express";
import nunjucks from "nunjucks";
import { readFileSync } from "fs";
import { Analyzer } from "wireit/lib/analyzer.js";
import * as url from "url";
import { join } from "path";
import detectPort from "detect-port";

import { Graph } from "./graph.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

var app = express();

const PORT = await detectPort(4200);

nunjucks.configure(join(__dirname, "../views"), {
  autoescape: true,
});

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
      readFileSync(join("./package.json")).toString()
    );

    tasks = Object.keys(projectJson.wireit).map((task) => `./:${task}`);
  }

  const graph = await analyzeTasks(tasks);

  res.send(graph.graph);
});

app.get("/", async (_req, res) => {
  res.send(nunjucks.render("index.html"));
});

app.listen(PORT, () => {
  console.log(`Visualizing build on port ${PORT}`);
});

process.on("SIGINT", () => {
  process.exit(0);
});

async function analyzeTasks(tasks: string[]) {
  const analyzer = new Analyzer("npm");
  const graph = new Graph();

  await Promise.all(
    tasks.map((taskPath) => {
      const [packageDir, ...task] = taskPath.split(":");

      return graph.analyze(
        {
          name: task.join(":"),
          packageDir,
        },
        analyzer
      );
    })
  );

  return graph;
}
