import { Graph } from "@viz-js/viz";

import { GraphData } from "../lib/graph.js";

const lib = import("@viz-js/viz").then((m) => m.instance());

const data = fetch("/api/graph/graphviz" + window.location.search).then<{
  parsed: Graph;
  source: GraphData;
}>((res) => res.json());

Promise.all([lib, data]).then(([viz, data]) => {
  const svg = viz.renderSVGElement(data.parsed);
  const str = viz.renderString(data.parsed);

  document.getElementById("mynetwork")!.appendChild(svg);
  document.getElementById("mynetworkconfig")!.innerHTML = str;

  const nodes = svg.querySelectorAll("a");

  const dialog = document.querySelector("sl-dialog") as HTMLDialogElement;
  const dialogFiles = document.getElementById(
    "dialog-files"
  ) as HTMLUListElement;

  const dialogOutputs = document.getElementById(
    "dialog-outputs"
  ) as HTMLUListElement;

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
        dialogFiles.innerHTML = "";
        dialogOutputs.innerHTML = "";

        for (let file of node.wireit.files) {
          const li = document.createElement("li");
          li.innerHTML = file;

          dialogFiles.append(li);
        }

        for (let output of node.wireit.outputs) {
          const li = document.createElement("li");
          li.innerHTML = output;

          dialogOutputs.append(li);
        }
      }

      dialog.show();
    });
  });
});
