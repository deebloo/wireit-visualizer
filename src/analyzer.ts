import { resolve } from "node:path";

export interface Task {
  name: string;
  packageDir: string;
}

export type Dependency = string | { script: string; cascade?: boolean };

export interface TaskConfig {
  command?: string;
  service?: true;
  files?: string[];
  outputs?: string[];
  dependencies?: Dependency[];
}

export interface WireitPackage {
  wireit: Record<string, TaskConfig>;
}

export interface AnalyzerResult {
  dependencies: Task[];
}

export interface Analyzer {
  analyze(task: Task): Promise<AnalyzerResult>;
}

export interface WireitReader {
  read(path: string): Promise<WireitPackage>;
}

export class WireitAnalyzer implements Analyzer {
  #reader: WireitReader;

  constructor(reader: WireitReader) {
    this.#reader = reader;
  }

  async analyze(task: Task): Promise<AnalyzerResult> {
    const file: WireitPackage = await this.#reader.read(task.packageDir);

    const taskConfig = file.wireit[task.name];
    const taskDeps = taskConfig.dependencies || [];

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
