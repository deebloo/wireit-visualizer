import { GraphData } from "../lib/graph.js";
import { renderTree } from "./file-tree.js";

const lib = import("mermaid").then((res) => res.default);

const data = fetch("/api/graph/mermaid" + window.location.search).then<{
  parsed: string;
  source: GraphData;
}>((res) => res.json());

const network = document.getElementById("mynetworkconfig")!;

Promise.all([lib, data]).then(async ([mermaid, data]) => {
  network.innerHTML = data.parsed;

  const res = await mermaid.render("mermaid", data.parsed);

  document.getElementById("mynetwork")!.innerHTML = res.svg;

  const drawer = document.querySelector("sl-drawer")!;

  document.addEventListener("contextmenu", (e) => {
    console.log(e.target);
    if (e.target instanceof HTMLAnchorElement) {
      e.preventDefault();
      e.stopPropagation();

      const href = e.target.getAttribute("href")!;
      const params = new URLSearchParams(href);

      const node = data.source.nodes.find((node) => {
        return node.id === params.get("task");
      });

      if (node) {
        drawer.setAttribute("label", node.id);

        renderTree(node, drawer);
      }

      drawer.show();
    }
  });
});
