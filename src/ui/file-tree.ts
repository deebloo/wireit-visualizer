import { html, render } from "lit-html";

import { Node } from "../lib/graph.js";
import { AnalyzedFile } from "../lib/analyzer.js";
import { SlTreeItem } from "@shoelace-style/shoelace";

export function renderTree(node: Node, host: HTMLElement) {
  render(
    html`
      <h2>Files</h2>
      <sl-tree>${createTreeItems(node.wireit.files, undefined)} </sl-tree>

      <h2>Output</h2>
      <sl-tree>${createTreeItems(node.wireit.output, undefined)}</sl-tree>
    `,
    host
  );
}

function createTreeItems(source: AnalyzedFile[], current: string | undefined) {
  const files = source.filter((file) => file.parent === current);

  return files.map((file) => {
    const treeItem = document.createElement("sl-tree-item");
    const icon = document.createElement("sl-icon");

    if (file.type === "folder") {
      treeItem.lazy = true;
      icon.name = "folder";
    } else {
      icon.name = "filetype-" + file.type;
    }

    treeItem.append(icon);
    treeItem.append(document.createTextNode(file.name));

    treeItem.addEventListener("sl-lazy-load", (e) => {
      e.stopPropagation();

      treeItem.append(...createTreeItems(source, file.id));
      treeItem.lazy = false;
    });

    return treeItem;
  });
}
