import { readFileSync } from "fs";
import { join } from "path";

import { MermaidGraph } from "./graph.js";

export interface WireitTasks {
  [key: string]: Task;
}

export interface WireitPackageJson {
  name: string;
  wireit: WireitTasks;
}

export interface Task {
  command: string;
  dependencies?: Dependency[];
}

export type Dependency =
  | string
  | {
      script: string;
      cascades: boolean;
    };

export function find_deps(path: string, graph: MermaidGraph) {
  const pkg: WireitPackageJson = JSON.parse(readFileSync(path).toString());

  for (let name in pkg.wireit) {
    const task = pkg.wireit[name];

    if (task.dependencies) {
      for (let dep of task.dependencies) {
        const dep_name = typeof dep === "string" ? dep : dep.script;

        if (dep_name.startsWith(".")) {
          const parsed_name = dep_name.split(":");
          const parsed_path = parsed_name[0].split("/");

          graph.addEntry([
            pkg.name + ":" + name,
            "-->",
            parsed_path[parsed_path.length - 1] + ":" + parsed_name[1],
          ]);

          find_deps(join(path, "../", parsed_name[0], "package.json"), graph);
        } else {
          graph.addEntry([
            pkg.name + ":" + name,
            "-->",
            pkg.name + ":" + dep_name,
          ]);
        }
      }
    }
  }

  return graph;
}
