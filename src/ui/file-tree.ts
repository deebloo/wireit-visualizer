import { html, render } from "lit-html";

import { Node } from "../lib/graph.js";
import { AnalyzedFile } from "../lib/analyzer.js";
import { SlTreeItem } from "@shoelace-style/shoelace";

export function renderTree(node: Node, host: HTMLElement) {
  render(
    html`
      <h2>Files</h2>
      <sl-tree>${createTreeItems(node.wireit.files, undefined)}</sl-tree>

      <h2>Output</h2>
      <sl-tree>${createTreeItems(node.wireit.output, undefined)}</sl-tree>
    `,
    host
  );
}

function createTreeItems(source: AnalyzedFile[], current: string | undefined) {
  const files = source.filter((file) => file.parent === current);

  return files.map((file) => {
    const isFolder = file.name.split(".").length <= 1;

    const treeItem = document.createElement("sl-tree-item");

    if (isFolder) {
      treeItem.lazy = true;

      const icon = document.createElement("sl-icon");
      icon.name = "folder";

      treeItem.append(icon);
    }

    treeItem.append(document.createTextNode(file.name));

    treeItem.addEventListener("sl-lazy-load", () => {
      treeItem.append(...createTreeItems(source, file.id));
    });

    return treeItem;
  });
}
