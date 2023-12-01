import * as path from "path";

export type Node = string;
export type Edge = "-->";
export type Entry = [Node, Edge, Node];

export class MermaidGraph {
  #entries: Entry[];
  #type: string;

  constructor(type: string, entries: Entry[] = []) {
    this.#entries = entries;
    this.#type = type;
  }

  async analyze(task: { name: string; packageDir: string }, analyzer: any) {
    const { config } = await analyzer.analyze(task);

    for (let dep of config.value.dependencies) {
      this.addEntry([
        formatNode({
          name: task.name,
          packageDir: path.resolve(task.packageDir),
        }),
        "-->",
        formatNode({
          name: dep.config.name,
          packageDir: path.resolve(dep.config.packageDir),
        }),
      ]);

      await this.analyze(
        { name: dep.config.name, packageDir: dep.config.packageDir },
        analyzer
      );
    }

    return this;
  }

  addEntry(entry: Entry) {
    this.#entries.push(entry);
  }

  toString() {
    const dedupe = new Set(this.#entries.map((line) => "  " + line.join(" ")));

    console.log([this.#type, ...Array.from(dedupe)].join("\n"));

    return [this.#type, ...Array.from(dedupe)].join("\n");
  }
}

function formatNode({
  name,
  packageDir,
}: {
  name: string;
  packageDir: string;
}): string {
  const p = path.relative("./", packageDir);

  return `${p}:${name}`;
}
