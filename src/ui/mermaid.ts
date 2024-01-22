import { GraphData } from "../lib/graph.js";

const lib = import("mermaid").then((res) => res.default);

const data = fetch("/api/graph/mermaid" + window.location.search).then<{
  parsed: string;
  source: GraphData;
}>((res) => res.json());

const res = await Promise.all([lib, data]).then(([mermaid, data]) => {
  document.getElementById("mynetworkconfig")!.innerHTML = data.parsed;

  return mermaid.render("mermaid", data.parsed);
});

document.getElementById("mynetwork")!.innerHTML = res.svg;
