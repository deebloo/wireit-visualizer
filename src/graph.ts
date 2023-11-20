export type Node = string;
export type Edge = "-->";
export type Entry = [Node, Edge, Node];

export class Graph {
  #entries: Entry[];

  constructor(entries: Entry[]) {
    this.#entries = entries;
  }

  addEntry(entry: Entry) {
    this.#entries.push(entry);
  }

  toString() {
    const dedupe = new Set(
      this.#entries.map((line) => "  " + line.join(" ") + ";")
    );

    console.log(Array.from(dedupe).join("\n"));

    return Array.from(dedupe).join("\n");
  }
}
