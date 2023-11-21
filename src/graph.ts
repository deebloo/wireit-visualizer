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
