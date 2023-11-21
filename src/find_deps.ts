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

export async function find_deps(
  task: { name: string; packageDir: string },
  analyzer: any,
  graph: MermaidGraph
) {
  const { config } = await analyzer.analyze(task);

  const task_json = JSON.parse(config.value.declaringFile.contents);

  for (let dep of config.value.dependencies) {
    const dep_json = JSON.parse(dep.config.declaringFile.contents);

    graph.addEntry([
      `${task_json.name}:${config.value.name}`,
      "-->",
      `${dep_json.name}:${dep.config.name}`,
    ]);

    console.log(config);

    find_deps(
      { name: dep.config.name, packageDir: dep.config.packageDir },
      analyzer,
      graph
    );
  }

  return graph;
}
