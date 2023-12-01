import test from "ava";
import { MermaidGraph, Task, AnalyzerResult, Analyzer } from "./graph.js";

test("should create graph", (t) => {
  const graph = new MermaidGraph("flowchart LR");

  graph.connect("a", "b");
  graph.connect("b", "c");
  graph.connect("c", "a");

  t.is(
    graph.toString().replaceAll("\n", ""),
    `flowchart LR  a --> b  b --> c  c --> a`
  );
});

test("should create graph from analyzer", async (t) => {
  const graph = new MermaidGraph("flowchart LR");

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

  t.is(graph.toString().replaceAll("\n", ""), `flowchart LR  :a --> :b`);
});
