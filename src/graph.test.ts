import test from "ava";
import { Graph } from "./graph.js";
import { Analyzer, AnalyzerResult, Task } from "./analyzer.js";

test("should create graph", (t) => {
  const graph = new Graph();

  graph.addNode({ id: "a" });
  graph.addNode({ id: "b" });
  graph.addNode({ id: "c" });

  graph.connect("a", "b");
  graph.connect("b", "c");
  graph.connect("c", "a");

  t.deepEqual(graph.graph, {
    nodes: [{ id: "a" }, { id: "b" }, { id: "c" }],
    edges: [
      { id: "a-->b", from: "a", to: "b" },
      { id: "b-->c", from: "b", to: "c" },
      { id: "c-->a", from: "c", to: "a" },
    ],
  });
});

test("should create graph from analyzer", async (t) => {
  const graph = new Graph();

  const buildConfig: Record<string, AnalyzerResult> = {
    "./:a": {
      config: {
        value: {
          dependencies: [{ config: { name: "b", packageDir: "./" } }],
        },
      },
    },
    "./:b": {
      config: {
        value: {
          dependencies: [],
        },
      },
    },
  };

  class TestAnalyzer implements Analyzer {
    async analyze({ name, packageDir }: Task) {
      return buildConfig[`${packageDir}:${name}`];
    }
  }

  await graph.analyze({ name: "a", packageDir: "./" }, new TestAnalyzer());

  t.deepEqual(graph.graph, {
    nodes: [{ id: ":a" }, { id: ":b" }],
    edges: [{ id: ":a-->:b", from: ":a", to: ":b" }],
  });
});
