import { Graph } from "@viz-js/viz";

import { GraphData } from "../lib/graph.js";
import { GraphParser } from "../lib/graph-parser.js";

export class GraphvizParser implements GraphParser<Graph> {
  parse(data: GraphData): Graph {
    return {
      graphAttributes: {
        rankdir: "LR",
        ordering: "in",
      },
      nodeAttributes: {
        shape: "box",
      },
      edgeAttributes: {
        arrowsize: 0.5,
      },
      nodes: data.nodes.map((node) => {
        return {
          name: node.id,
          attributes: {
            tooltip: "test",
            href: `?task=${node.id}`,
          },
        };
      }),
      edges: data.edges.map((edge) => {
        return {
          head: edge.to,
          tail: edge.from,
        };
      }),
    };
  }
}
