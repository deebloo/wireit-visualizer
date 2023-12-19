import * as path from "path";
import { Analyzer } from "./analyzer.js";

export interface Node {
  id: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
}

export class Graph {
  #graph: {
    nodes: Node[];
    edges: Edge[];
  } = {
    nodes: [],
    edges: [],
  };

  // keep track of all nodes so we don't duplicate
  #nodes = new Set<string>();

  get graph() {
    return this.#graph;
  }

  async analyze(
    task: { name: string; packageDir: string },
    analyzer: Analyzer
  ) {
    const { config } = await analyzer.analyze(task);

    const nodeId = createNodeId({
      name: task.name,
      packageDir: path.resolve(task.packageDir),
    });

    this.addNode({
      id: nodeId,
    });

    for (let dep of config.value.dependencies) {
      const depNodeId = createNodeId({
        name: dep.config.name,
        packageDir: path.resolve(dep.config.packageDir),
      });

      this.connect(nodeId, depNodeId);

      await this.analyze(
        { name: dep.config.name, packageDir: dep.config.packageDir },
        analyzer
      );
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
}

function createNodeId({
  name,
  packageDir,
}: {
  name: string;
  packageDir: string;
}): string {
  const p = path.relative("./", packageDir);

  return `${p}:${name}`;
}
