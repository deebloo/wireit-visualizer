import { GraphData } from "./graph.js";

export interface GraphParser<T> {
  parse(data: GraphData): T;
}
