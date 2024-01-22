import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { glob } from "glob";

import { WireitDependency, WireitPackage, WireitTask } from "./wireit.js";

export interface AnalyzerResult {
  files: string[];
  output: string[];
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
    let taskFiles: string[] = [];
    let taskOutputs: string[] = [];

    if (taskConfig) {
      if (taskConfig.dependencies) {
        taskDeps = taskConfig.dependencies;
      }

      if (taskConfig.files) {
        taskFiles = await glob(taskConfig.files);
      }

      if (taskConfig.output) {
        taskOutputs = await glob(taskConfig.output);
      }
    }

    return {
      files: taskFiles,
      output: taskOutputs,
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

export class FsReader implements WireitReader {
  async read(path: string): Promise<WireitPackage> {
    return readFile(resolve(path, "package.json")).then<WireitPackage>(
      (res) => {
        return JSON.parse(res.toString());
      }
    );
  }
}

export class EsmReader implements WireitReader {
  async read(path: string): Promise<WireitPackage> {
    return import(resolve(path, "package.json"), {
      assert: { type: "json" },
    }).then((m) => m.default);
  }
}
