import { resolve } from "node:path";
import { readFile, lstat } from "node:fs/promises";
import { glob } from "glob";

import { WireitDependency, WireitPackage, WireitTask } from "./wireit.js";

export interface AnalyzedFile {
  id: string;
  name: string;
  type: "file" | "folder";
  parent?: string;
}

export interface AnalyzerResult {
  files: AnalyzedFile[];
  output: AnalyzedFile[];
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
    let taskFiles: AnalyzedFile[] = [];
    let taskOutput: AnalyzedFile[] = [];

    if (taskConfig) {
      if (taskConfig.dependencies) {
        taskDeps = taskConfig.dependencies;
      }

      if (taskConfig.files) {
        const files = await glob(taskConfig.files);
        const ids = new Set<string>();
        const res: AnalyzedFile[] = [];

        for (let file of files) {
          const parsed = file.split("/").reverse();

          while (parsed.length) {
            const id = btoa(parsed.join("-"));
            const name = parsed.shift();

            if (name && !ids.has(id)) {
              const newFile: AnalyzedFile = {
                type: (await lstat(file)).isDirectory() ? "folder" : "file",
                id,
                name,
              };

              if (parsed.length) {
                newFile.parent = btoa(parsed.join("-"));
              }

              res.push(newFile);

              ids.add(id);
            }
          }
        }

        taskFiles = res;
      }

      if (taskConfig.output) {
        const files = await glob(taskConfig.output);
        const ids = new Set<string>();
        const res: AnalyzedFile[] = [];

        for (let file of files) {
          const parsed = file.split("/").reverse();

          while (parsed.length) {
            const id = btoa(parsed.join("-"));
            const name = parsed.shift();

            if (name && !ids.has(id)) {
              const newFile: AnalyzedFile = {
                type: (await lstat(file)).isDirectory() ? "folder" : "file",
                id,
                name,
              };

              if (parsed.length) {
                newFile.parent = btoa(parsed.join("-"));
              }

              res.push(newFile);

              ids.add(id);
            }
          }
        }

        taskOutput = res;
      }
    }

    return {
      files: taskFiles,
      output: taskOutput,
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
