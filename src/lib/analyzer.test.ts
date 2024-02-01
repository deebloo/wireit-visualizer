import test from "ava";
import path from "node:path";

import { WireitAnalyzer } from "./analyzer.js";

test("should locate package json file", async (t) => {
  const analyzer = new WireitAnalyzer({
    async read() {
      return {
        scripts: {},
        wireit: {
          build: {
            dependencies: ["tsc", { script: "css" }],
          },
          tsc: {
            command: "tsc",
          },
          css: {
            command: "css",
          },
        },
      };
    },
  });

  const res = await analyzer.analyze({ name: "build", packageDir: "./" });

  t.deepEqual(res, {
    dependencies: [
      {
        name: "tsc",
        packageDir: "./",
      },
      {
        name: "css",
        packageDir: "./",
      },
    ],
    files: [],
    output: [],
  });
});

test("should use standard script if no wireit config", async (t) => {
  const analyzer = new WireitAnalyzer({
    async read() {
      return {
        scripts: {
          tsc: "tsc",
        },
        wireit: {
          build: {
            command: "build",
            dependencies: ["tsc", "css"],
          },
          css: {
            command: "css",
          },
        },
      };
    },
  });

  const res = await analyzer.analyze({ name: "tsc", packageDir: "./" });

  t.deepEqual(res, {
    dependencies: [],
    files: [],
    output: [],
  });
});

test("analyzer: should flatten lists of files", async (t) => {
  const analyzer = new WireitAnalyzer({
    async read() {
      return {
        scripts: {
          tsc: "wireit",
        },
        wireit: {
          tsc: {
            command: "tsc --build --pretty",
            clean: "if-file-deleted",
            files: ["src/**", "tsconfig.json"],
            output: ["dist/**"],
          },
        },
      };
    },
  });

  const res = await analyzer.analyze({
    name: "tsc",
    packageDir: path.resolve("./mock/common"),
  });

  t.deepEqual(res, {
    files: [
      { type: "folder", id: "src", name: "src" },
      { type: "json", id: "tsconfig.json", name: "tsconfig.json" },
      { type: "ts", id: "main.ts/src", name: "main.ts", parent: "src" },
      { type: "folder", id: "main/src", name: "main", parent: "src" },
      { type: "ts", id: "foo.ts/main/src", name: "foo.ts", parent: "main/src" },
      { type: "ts", id: "bar.ts/main/src", name: "bar.ts", parent: "main/src" },
    ],
    output: [
      { type: "folder", id: "dist", name: "dist" },
      { type: "js", id: "main.js/dist", name: "main.js", parent: "dist" },
      { type: "ts", id: "main.d.ts/dist", name: "main.d.ts", parent: "dist" },
      { type: "folder", id: "main/dist", name: "main", parent: "dist" },
      {
        type: "js",
        id: "foo.js/main/dist",
        name: "foo.js",
        parent: "main/dist",
      },
      {
        type: "ts",
        id: "foo.d.ts/main/dist",
        name: "foo.d.ts",
        parent: "main/dist",
      },
      {
        type: "js",
        id: "bar.js/main/dist",
        name: "bar.js",
        parent: "main/dist",
      },
      {
        type: "ts",
        id: "bar.d.ts/main/dist",
        name: "bar.d.ts",
        parent: "main/dist",
      },
    ],
    dependencies: [],
  });
});
