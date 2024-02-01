import { Graph } from "@viz-js/viz";

import { GraphData } from "./graph.js";

export type GraphMapFn<T> = (data: GraphData) => T;

export const graphMapper: Record<string, GraphMapFn<unknown>> = {
  graphviz(data: GraphData): Graph {
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
  },
  mermaid(data: GraphData) {
    return `
    graph LR
      ${data.edges
        .map(
          (edge) =>
            `${edge.from}[<a href='?task=${edge.from}'>${edge.from}</a>]-->${edge.to}[<a href='?task=${edge.to}'>${edge.to}</a>]`
        )
        .join("\n")}
  `;
  },
} as const;
