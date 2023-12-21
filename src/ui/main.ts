import { Graph } from "@viz-js/viz";
import { GraphData } from "../graph.js";

const lib = import("@viz-js/viz").then((m) => m.instance());

const data = fetch("/data" + window.location.search).then<GraphData>((res) =>
  res.json()
);

Promise.all([lib, data]).then(([viz, data]) => {
  const config: Graph = {
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

  const svg = viz.renderSVGElement(config);
  const str = viz.renderString(config);

  document.getElementById("mynetwork")!.appendChild(svg);
});
