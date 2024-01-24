import { TemplateResult, html, render } from "lit-html";

import { Node } from "../lib/graph.js";
import { AnalyzedFile } from "../lib/analyzer.js";

export function renderTree(node: Node, host: HTMLElement) {
  render(
    html`
      <div class="drawer-container">
        <div>
          <h2>Files</h2>
          <sl-tree>${createTreeItems(node.wireit.files, undefined)}</sl-tree>
        </div>

        <div>
          <h2>Output</h2>
          <sl-tree>${createTreeItems(node.wireit.output, undefined)}</sl-tree>
        </div>
      </div>
    `,
    host
  );
}

export function createTreeItems(
  source: AnalyzedFile[],
  current: string | undefined
): TemplateResult {
  const files = source.filter((file) => {
    return file.parent === current;
  });

  return html`
    ${files.map(
      (file) =>
        html`<sl-tree-item>
          ${file.name} ${createTreeItems(source, file.id)}
        </sl-tree-item>`
    )}
  `;
}
