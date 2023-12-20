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
  config: {
    value: {
      dependencies: Array<{ config: Task }>;
    };
  };
}

export interface Analyzer {
  analyze(task: Task): Promise<AnalyzerResult>;
}

export class WireitAnalyzer implements Analyzer {
  async analyze(task: Task): Promise<AnalyzerResult> {
    const file: WireitPackage = await this.readPackge(task.packageDir);

    const taskConfig = file.wireit[task.name];
    const taskDeps = taskConfig.dependencies || [];

    return {
      config: {
        value: {
          dependencies: taskDeps.map((dep) => {
            const depScript =
              typeof dep === "string" ? dep.split(":") : dep.script.split(":");

            if (depScript.length === 1) {
              return {
                config: {
                  packageDir: task.packageDir,
                  name: depScript.join(":"),
                },
              };
            }

            const [packageDir, ...name] = depScript;

            return {
              config: {
                packageDir: resolve(task.packageDir, packageDir),
                name: name.join(":"),
              },
            };
          }),
        },
      },
    };
  }

  async readPackge(packageDir: string): Promise<WireitPackage> {
    return import(resolve(packageDir, "package.json"), {
      assert: { type: "json" },
    }).then((m) => m.default);
  }
}
