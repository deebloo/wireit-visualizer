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
  const analyzer = new Analyzer("npm");
  const cytoscape = new Graph();

  const taskQuery = req.query.task;

  let tasks: string[] = [];

  if (typeof taskQuery === "string") {
    tasks = [taskQuery];
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

  console.log(tasks);

  await Promise.all(
    tasks.map((taskPath) => {
      const [packageDir, ...task] = taskPath.split(":");

      return cytoscape.analyze(
        {
          name: task.join(":"),
          packageDir,
        },
        analyzer
      );
    })
  );

  res.send(cytoscape.graph);
});

app.get("/", async function (req, res) {
  res.send(nunjucks.render("index.html"));
});

app.listen(PORT, () => {
  console.log(`Visualizing build on port ${PORT}`);
});

process.on("SIGINT", () => {
  process.exit(0);
});
