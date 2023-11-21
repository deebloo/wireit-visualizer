import express from "express";
import nunjucks from "nunjucks";
import { readFileSync } from "fs";
import { Analyzer } from "wireit/lib/analyzer.js";

import { MermaidGraph } from "./graph.js";

var app = express();

app.use(express.static("node_modules"));

const PORT = 4300;

nunjucks.configure("views", {
  autoescape: true,
});

app.get("/", async function (req, res) {
  const analyzer = new Analyzer("npm");
  const mermaid = new MermaidGraph("flowchart TD;", []);
  const projectJson = JSON.parse(readFileSync("./package.json").toString());

  console.log(req.query);

  if (req.query.task) {
    await mermaid.analyze(
      {
        name: req.query.task as string,
        packageDir: "./",
      },
      analyzer
    );
  } else {
    await Promise.all(
      Object.keys(projectJson.wireit).map((task) =>
        mermaid.analyze(
          {
            name: task,
            packageDir: "./",
          },
          analyzer
        )
      )
    );
  }

  res.send(
    nunjucks.render("index.html", {
      graph: mermaid.toString(),
    })
  );
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
