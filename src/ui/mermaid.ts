import { GraphData } from "../graph.js";

const lib = import("mermaid").then((res) => res.default);

const data = fetch("/data" + window.location.search).then<GraphData>((res) =>
  res.json()
);

const res = await Promise.all([lib, data]).then(([mermaid, data]) => {
  const graph = `
    graph LR
      ${data.edges
        .map(
          (edge) =>
            `${edge.from}[<a href='?task=${edge.from}'>${edge.from}</a>]-->${edge.to}[<a href='?task=${edge.to}'>${edge.to}</a>]`
        )
        .join("\n")}
  `;

  document.getElementById("mynetworkconfig")!.innerHTML = graph;

  return mermaid.render("mermaid", graph);
});

document.getElementById("mynetwork")!.innerHTML = res.svg;
