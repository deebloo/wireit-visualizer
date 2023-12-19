export interface Task {
  name: string;
  packageDir: string;
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
