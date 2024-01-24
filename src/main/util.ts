import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ParsedQs } from "qs";

import { Graph, FsReader, WireitAnalyzer } from "../lib.js";

export async function analyzeTasks(tasks: string[]) {
  const analyzer = new WireitAnalyzer(new FsReader());
  const graph = new Graph(analyzer);

  await Promise.all(
    tasks.map((taskPath) => {
      const [packageDir, ...task] = taskPath.split(":");

      return graph.analyze({
        name: task.join(":"),
        packageDir,
      });
    })
  );

  return graph;
}

export function determineTasks(
  taskQuery?: string | ParsedQs | string[] | ParsedQs[] | undefined
) {
  let tasks: string[] = [];

  if (typeof taskQuery === "string") {
    tasks.push(taskQuery);
  } else if (Array.isArray(taskQuery)) {
    for (let task of taskQuery) {
      if (typeof task === "string") {
        tasks.push(task);
      }
    }
  } else if (!taskQuery) {
    // if not tasks are defined, find them in the root package.json
    const projectJson = JSON.parse(
      readFileSync(resolve("./package.json")).toString()
    );

    tasks = Object.keys(projectJson.wireit).map((task) => `./:${task}`);
  }

  return tasks;
}
