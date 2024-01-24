import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import express from "express";
import nunjucks from "nunjucks";
import detectPort from "detect-port";
import open from "open";

import { GraphParser } from "../lib.js";
import { GraphvizParser } from "../graphviz.js";
import { MermaidParser } from "../mermaid.js";
import { analyzeTasks, determineTasks } from "./util.js";
import { args } from "./args.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export async function startServer() {
  var app = express();

  const PORT = args.values.port || (await detectPort(4200));

  nunjucks.configure(resolve(__dirname, "../../views"), {
    autoescape: true,
  });

  app.use(express.static(resolve(__dirname, "../../target/ui")));
  app.use(express.static(resolve(__dirname, "../../vendor")));

  app.get("/api/graph", async (req, res) => {
    const tasks = determineTasks(req.query.task);
    const analysis = await analyzeTasks(tasks);

    res.send(analysis.graph);
  });

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
      res.send({
        source: analysis.graph,
        parsed: parser.parse(analysis.graph),
      });
    } else {
      res.status(404).send(`Graph type "${req.params.graphType}" not defined`);
    }
  });

  app.get("/", async (_req, res) => {
    res.redirect("/graph/graphviz");
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

  return app;
}
