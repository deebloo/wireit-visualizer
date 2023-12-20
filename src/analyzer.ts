import { resolve } from "node:path";

export interface Task {
  name: string;
  packageDir: string;
}

export interface WireitPackage {
  wireit: Record<string, TaskConfig>;
}

export interface TaskConfig {
  command?: string;
  dependencies?: string[];
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
            const parsed = dep.split(":");

            if (parsed.length === 1) {
              return {
                config: {
                  packageDir: task.packageDir,
                  name: dep,
                },
              };
            }

            const [packageDir, ...name] = parsed;

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
