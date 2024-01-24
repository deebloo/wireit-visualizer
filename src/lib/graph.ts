import * as path from "path";

import { AnalyzedFile, Analyzer } from "./analyzer.js";
import { WireitTask } from "./wireit.js";

export interface Node {
  id: string;
  wireit: {
    files: AnalyzedFile[];
    output: AnalyzedFile[];
  };
}

export interface Edge {
  id: string;
  from: string;
  to: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export class Graph {
  #graph: GraphData = {
    nodes: [],
    edges: [],
  };

  // keep track of all nodes so we don't duplicate
  #nodes = new Set<string>();
  #analyzer: Analyzer;

  constructor(analyzer: Analyzer) {
    this.#analyzer = analyzer;
  }

  get graph() {
    return this.#graph;
  }

  async analyze(task: WireitTask) {
    const { dependencies, files, output } = await this.#analyzer.analyze(task);

    const nodeId = this.createNodeId({
      name: task.name,
      packageDir: path.resolve(task.packageDir),
    });

    this.addNode({
      id: nodeId,
      wireit: {
        files,
        output,
      },
    });

    for (let dep of dependencies) {
      const depNodeId = this.createNodeId({
        name: dep.name,
        packageDir: path.resolve(dep.packageDir),
      });

      this.connect(nodeId, depNodeId);

      await this.analyze({ name: dep.name, packageDir: dep.packageDir });
    }

    return this;
  }

  addNode(node: Node) {
    if (!this.#nodes.has(node.id)) {
      this.#nodes.add(node.id);
      this.#graph.nodes.push(node);
    }
  }

  addEdge(edge: Edge) {
    if (!this.#nodes.has(edge.id)) {
      this.#nodes.add(edge.id);
      this.#graph.edges.push(edge);
    }
  }

  connect(from: string, to: string) {
    this.addEdge({
      id: `${from}-->${to}`,
      from,
      to,
    });
  }

  createNodeId({
    name,
    packageDir,
  }: {
    name: string;
    packageDir: string;
  }): string {
    const p = path.relative("./", packageDir);

    return `${p}:${name}`;
  }
}
