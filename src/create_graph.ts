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
    return this.#entries.map((line) => "  " + line.join(" ") + ";").join("\n");
  }
}
