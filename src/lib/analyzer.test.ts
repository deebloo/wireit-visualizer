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
    dependencies: [],
    files: [
      {
        id: "c3Jj",
        name: "src",
        type: "folder",
      },
      {
        id: "dHNjb25maWcuanNvbg==",
        name: "tsconfig.json",
        type: "json",
      },
      {
        id: "bWFpbi50cy1zcmM=",
        name: "main.ts",
        parent: "c3Jj",
        type: "ts",
      },
      {
        id: "bWFpbi1zcmM=",
        name: "main",
        parent: "c3Jj",
        type: "folder",
      },
      {
        id: "Zm9vLnRzLW1haW4tc3Jj",
        name: "foo.ts",
        parent: "bWFpbi1zcmM=",
        type: "ts",
      },
      {
        id: "YmFyLnRzLW1haW4tc3Jj",
        name: "bar.ts",
        parent: "bWFpbi1zcmM=",
        type: "ts",
      },
    ],
    output: [
      {
        id: "ZGlzdA==",
        name: "dist",
        type: "folder",
      },
      {
        id: "bWFpbi5qcy1kaXN0",
        name: "main.js",
        parent: "ZGlzdA==",
        type: "js",
      },
      {
        id: "bWFpbi5kLnRzLWRpc3Q=",
        name: "main.d.ts",
        parent: "ZGlzdA==",
        type: "ts",
      },
      {
        id: "bWFpbi1kaXN0",
        name: "main",
        parent: "ZGlzdA==",
        type: "folder",
      },
      {
        id: "Zm9vLmpzLW1haW4tZGlzdA==",
        name: "foo.js",
        parent: "bWFpbi1kaXN0",
        type: "js",
      },
      {
        id: "Zm9vLmQudHMtbWFpbi1kaXN0",
        name: "foo.d.ts",
        parent: "bWFpbi1kaXN0",
        type: "ts",
      },
      {
        id: "YmFyLmpzLW1haW4tZGlzdA==",
        name: "bar.js",
        parent: "bWFpbi1kaXN0",
        type: "js",
      },
      {
        id: "YmFyLmQudHMtbWFpbi1kaXN0",
        name: "bar.d.ts",
        parent: "bWFpbi1kaXN0",
        type: "ts",
      },
    ],
  });
});
