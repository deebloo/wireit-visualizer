const lib = import("mermaid").then((res) => res.default);

const data = fetch("/api/graph/mermaid" + window.location.search).then<string>(
  (res) => res.text()
);

const res = await Promise.all([lib, data]).then(([mermaid, data]) => {
  document.getElementById("mynetworkconfig")!.innerHTML = data;

  return mermaid.render("mermaid", data);
});

document.getElementById("mynetwork")!.innerHTML = res.svg;
