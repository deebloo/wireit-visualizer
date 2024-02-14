import test from "node:test";
import assert from "node:assert";

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

  graph.addNode({ id: "a", wireit: { files: [], output: [] } });
  graph.addNode({ id: "b", wireit: { files: [], output: [] } });
  graph.addNode({ id: "c", wireit: { files: [], output: [] } });

  graph.connect("a", "b");
  graph.connect("b", "c");
  graph.connect("c", "a");

  assert.deepEqual(graph.graph, {
    nodes: [
      {
        id: "a",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: "b",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: "c",
        wireit: {
          files: [],
          output: [],
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

test("should create graph from analyzer", async () => {
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

  assert.deepEqual(graph.graph, {
    nodes: [
      {
        id: ":a",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: ":b",
        wireit: {
          files: [],
          output: [],
        },
      },
    ],
    edges: [{ id: ":a-->:b", from: ":a", to: ":b" }],
  });
});

test("should display immediate parents of task", async () => {
  const buildConfig: Record<string, AnalyzerResult> = {
    "./:1": {
      files: [],
      output: [],
      dependencies: [
        { name: "a", packageDir: "./" },
        { name: "b", packageDir: "./" },
      ],
    },
    "./:2": {
      files: [],
      output: [],
      dependencies: [
        { name: "a", packageDir: "./" },
        { name: "b", packageDir: "./" },
      ],
    },
    "./:3": {
      files: [],
      output: [],
      dependencies: [
        { name: "a", packageDir: "./" },
        { name: "b", packageDir: "./" },
      ],
    },
    "./:a": {
      files: [],
      output: [],
      dependencies: [{ name: "c", packageDir: "./" }],
    },
    "./:b": {
      files: [],
      output: [],
      dependencies: [],
    },
    "./:c": {
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
  await graph.analyze({ name: "b", packageDir: "./" });
  await graph.analyze({ name: "c", packageDir: "./" });
  await graph.analyze({ name: "1", packageDir: "./" });
  await graph.analyze({ name: "2", packageDir: "./" });
  await graph.analyze({ name: "3", packageDir: "./" });

  assert.deepEqual(graph.graphFor({ name: "a", packageDir: "./" }), {
    nodes: [
      {
        id: ":a",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: ":c",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: ":1",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: ":2",
        wireit: {
          files: [],
          output: [],
        },
      },
      {
        id: ":3",
        wireit: {
          files: [],
          output: [],
        },
      },
    ],
    edges: [
      {
        from: ":a",
        id: ":a-->:c",
        to: ":c",
      },
      {
        from: ":1",
        id: ":1-->:a",
        to: ":a",
      },
      {
        from: ":2",
        id: ":2-->:a",
        to: ":a",
      },
      {
        from: ":3",
        id: ":3-->:a",
        to: ":a",
      },
    ],
  });
});
