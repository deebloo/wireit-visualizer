import { resolve } from "node:path";

import { WireitDependency, WireitPackage, WireitTask } from "./wireit.js";

export interface AnalyzerResult {
  dependencies: WireitTask[];
}

export interface Analyzer {
  analyze(task: WireitTask): Promise<AnalyzerResult>;
}

export interface WireitReader {
  read(path: string): Promise<WireitPackage>;
}

export class WireitAnalyzer implements Analyzer {
  #reader: WireitReader;

  constructor(reader: WireitReader) {
    this.#reader = reader;
  }

  async analyze(task: WireitTask): Promise<AnalyzerResult> {
    const file: WireitPackage = await this.#reader.read(task.packageDir);

    const taskConfig = file.wireit[task.name];

    let taskDeps: WireitDependency[] = [];

    if (taskConfig && taskConfig.dependencies) {
      taskDeps = taskConfig.dependencies;
    }

    return {
      dependencies: taskDeps.map((dep) => {
        const script = typeof dep === "string" ? dep : dep.script;

        // if the script is local use the current packageDir
        if (!script.startsWith(".")) {
          return {
            packageDir: task.packageDir,
            name: script,
          };
        }

        const [packageDir, ...name] = script.split(":");

        return {
          packageDir: resolve(task.packageDir, packageDir),
          name: name.join(":"),
        };
      }),
    };
  }
}

export class EsmReader implements WireitReader {
  async read(path: string): Promise<WireitPackage> {
    return import(resolve(path, "package.json"), {
      assert: { type: "json" },
    }).then((m) => m.default);
  }
}
