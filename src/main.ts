#! /usr/bin/env node

import { readFileSync } from "node:fs";
import * as url from "node:url";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import detectPort from "detect-port";
import { ParsedQs } from "qs";

import { Graph, GraphParser, FsReader, WireitAnalyzer } from "./lib.js";
import { GraphvizParser } from "./graphviz.js";
import { MermaidParser } from "./mermaid.js";
import open from "open";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

var app = express();

const args = parseArgs({
  options: {
    port: {
      type: "string",
      short: "p",
    },
    open: {
      type: "boolean",
      short: "o",
    },
    visualizer: {
      type: "string",
      short: "v",
    },
  },
});

const PORT = args.values.port || (await detectPort(4200));
const INITIAL_VIZ = args.values.visualizer ?? "graphviz";

nunjucks.configure(resolve(__dirname, "../views"), {
  autoescape: true,
});

app.use(express.static(resolve(__dirname, "../target/ui")));
app.use(express.static(resolve(__dirname, "../vendor")));

app.get("/api/graph/:graphType", async (req, res) => {
  const tasks = determineTasks(req.query.task);
  const analysis = await analyzeTasks(tasks);

  let parser: GraphParser<unknown> | null = null;

  switch (req.params.graphType) {
    case "graphviz":
      parser = new GraphvizParser();
      break;

    case "mermaid":
      parser = new MermaidParser();
      break;
  }

  if (parser) {
    res.send(parser.parse(analysis.graph));
  } else {
    res.status(404).send(`Graph type "${req.params.graphType}" not defined`);
  }
});

app.get("/", (_req, res) => {
  switch (INITIAL_VIZ.toLocaleLowerCase()) {
    case "graphviz":
      res.redirect("/graph/graphviz");
      break;

    case "mermaid":
      res.redirect("/graph/mermaid");
      break;
  }
});

app.get("/graph/:graphType", async (req, res, next) => {
  try {
    res.send(nunjucks.render(`${req.params.graphType}.njk`));
  } catch (e) {
    console.log(e);
    res.redirect("/graph/graphviz");
  }
});

app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;

  console.log(`Wireit Visualizer running on ${url}`);

  if (args.values.open) {
    await open(url);
  }
});

process.on("SIGINT", () => {
  process.exit(0);
});

async function analyzeTasks(tasks: string[]) {
  const analyzer = new WireitAnalyzer(new FsReader());
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

function determineTasks(
  taskQuery?: string | ParsedQs | string[] | ParsedQs[] | undefined
) {
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

  return tasks;
}
