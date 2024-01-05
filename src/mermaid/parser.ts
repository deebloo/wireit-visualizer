import { GraphParser } from "../lib/graph-parser.js";
import { GraphData } from "../lib/graph.js";

export class MermaidParser implements GraphParser<string> {
  parse(data: GraphData) {
    return `
    graph LR
    ${data.edges
      .map(
        (edge) =>
          `  ${edge.from}[<a href='?task=${edge.from}'>${edge.from}</a>]-->${edge.to}[<a href='?task=${edge.to}'>${edge.to}</a>]`
      )
      .join("\n")}
  `;
  }
}
