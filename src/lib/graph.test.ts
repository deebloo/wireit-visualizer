import test from "ava";

import { Graph } from "./graph.js";
import { AnalyzerResult } from "./analyzer.js";
import { WireitTask } from "./wireit.js";

test("should create graph", (t) => {
  const graph = new Graph({
    async analyze(_: WireitTask) {
      return {
        files: [],
        output: [],
        dependencies: [],
      };
    },
  });

  graph.addNode({ id: "a", wireit: { files: [], outputs: [] } });
  graph.addNode({ id: "b", wireit: { files: [], outputs: [] } });
  graph.addNode({ id: "c", wireit: { files: [], outputs: [] } });

  graph.connect("a", "b");
  graph.connect("b", "c");
  graph.connect("c", "a");

  t.deepEqual(graph.graph, {
    nodes: [
      {
        id: "a",
        wireit: {
          files: [],
          outputs: [],
        },
      },
      {
        id: "b",
        wireit: {
          files: [],
          outputs: [],
        },
      },
      {
        id: "c",
        wireit: {
          files: [],
          outputs: [],
        },
      },
    ],
    edges: [
      { id: "a-->b", from: "a", to: "b" },
      { id: "b-->c", from: "b", to: "c" },
      { id: "c-->a", from: "c", to: "a" },
    ],
  });
});

test("should create graph from analyzer", async (t) => {
  const buildConfig: Record<string, AnalyzerResult> = {
    "./:a": {
      files: [],
      output: [],
      dependencies: [{ name: "b", packageDir: "./" }],
    },
    "./:b": {
      files: [],
      output: [],
      dependencies: [],
    },
  };

  const graph = new Graph({
    async analyze({ name, packageDir }: WireitTask) {
      return buildConfig[`${packageDir}:${name}`];
    },
  });

  await graph.analyze({ name: "a", packageDir: "./" });

  t.deepEqual(graph.graph, {
    nodes: [
      {
        id: ":a",
        wireit: {
          files: [],
          outputs: [],
        },
      },
      {
        id: ":b",
        wireit: {
          files: [],
          outputs: [],
        },
      },
    ],
    edges: [{ id: ":a-->:b", from: ":a", to: ":b" }],
  });
});
