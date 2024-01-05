import { Graph } from "@viz-js/viz";

const lib = import("@viz-js/viz").then((m) => m.instance());

const data = fetch("/api/graph/graphviz" + window.location.search).then<Graph>(
  (res) => res.json()
);

Promise.all([lib, data]).then(([viz, data]) => {
  const svg = viz.renderSVGElement(data);
  const str = viz.renderString(data);

  document.getElementById("mynetwork")!.appendChild(svg);
  document.getElementById("mynetworkconfig")!.innerHTML = str;
});
