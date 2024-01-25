import { Graph } from "@viz-js/viz";

import { GraphData } from "../lib/graph.js";
import { renderTree } from "./file-tree.js";

const lib = import("@viz-js/viz").then((m) => m.instance());

const data = fetch("/api/graph/graphviz" + window.location.search).then<{
  parsed: Graph;
  source: GraphData;
}>((res) => res.json());

Promise.all([lib, data]).then(([viz, data]) => {
  const svg = viz.renderSVGElement(data.parsed);
  const str = viz.renderString(data.parsed);

  const network = document.getElementById("mynetwork")!;

  network.appendChild(svg);
  document.getElementById("mynetworkconfig")!.innerHTML = str;

  const nodes = svg.querySelectorAll("a");
  const drawer = document.querySelector("sl-drawer")!;

  nodes.forEach((node) => {
    node.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      const target = e.target as SVGElement;
      const anchor = target.closest("a") as HTMLAnchorElement;
      const href = anchor.getAttribute("xlink:href")!;
      const params = new URLSearchParams(href);

      const node = data.source.nodes.find((node) => {
        return node.id === params.get("task");
      });

      if (node) {
        drawer.setAttribute("label", node.id);

        renderTree(node, drawer);
      }

      drawer.show();
    });
  });
});
