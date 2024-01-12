const dropdown = document.querySelector("sl-dropdown")!;

const commands: Record<string, Function> = {
  graphviz(e: CustomEvent) {
    window.location.href =
      "/graph/" + e.detail.item.value + window.location.search;
  },
  mermaid(e: CustomEvent) {
    window.location.href =
      "/graph/" + e.detail.item.value + window.location.search;
  },
  async copy() {
    const configEl = document.getElementById("mynetworkconfig")!;

    if (configEl.textContent) {
      await navigator.clipboard.writeText(configEl.textContent);

      alert("Copied!");
    }
  },
} as const;

dropdown.addEventListener("sl-select", (e) => {
  const command = commands[(e as CustomEvent).detail.item.value];

  if (command) {
    command(e);
  }
});
