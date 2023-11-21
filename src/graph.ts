export type Node = string;
export type Edge = "-->";
export type Entry = [Node, Edge, Node];

export class MermaidGraph {
  #entries: Entry[];
  #type: string;

  constructor(type: string, entries: Entry[]) {
    this.#entries = entries;
    this.#type = type;
  }

  async analyze(task: { name: string; packageDir: string }, analyzer: any) {
    const { config } = await analyzer.analyze(task);

    const task_json = JSON.parse(config.value.declaringFile.contents);

    for (let dep of config.value.dependencies) {
      const dep_json = JSON.parse(dep.config.declaringFile.contents);

      this.addEntry([
        formatNode(task_json.name, config.value.name),
        "-->",
        formatNode(dep_json.name, dep.config.name),
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
    const dedupe = new Set(
      this.#entries.map((line) => "  " + line.join(" ") + ";")
    );

    console.log([this.#type, ...Array.from(dedupe)].join("\n"));

    return [this.#type, ...Array.from(dedupe)].join("\n");
  }
}

function formatNode(name: string, task: string): string {
  return `${name.replaceAll("@", "")}:${task}[${name}:${task}]`;
}
