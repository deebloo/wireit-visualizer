export interface WireitTask {
  name: string;
  packageDir: string;
}

export type WireitDependency = string | { script: string; cascade?: boolean };

export interface WireitTaskConfig {
  command?: string;
  service?: true;
  files?: string[];
  outputs?: string[];
  dependencies?: WireitDependency[];
}

export interface WireitPackage {
  scripts: Record<string, string>;
  wireit: Record<string, WireitTaskConfig>;
}
