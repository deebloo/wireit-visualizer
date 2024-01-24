import test from "ava";

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
            files: ["mock/common/**", "tsconfig.json"],
            output: ["mock/common/dist**"],
          },
        },
      };
    },
  });

  const res = await analyzer.analyze({ name: "tsc", packageDir: "./" });

  t.deepEqual(res, {
    dependencies: [],
    files: [
      {
        id: "Y29tbW9uLW1vY2s=",
        name: "common",
        parent: "bW9jaw==",
      },
      {
        id: "bW9jaw==",
        name: "mock",
      },
      {
        id: "dHNjb25maWcuanNvbg==",
        name: "tsconfig.json",
      },
      {
        id: "c3JjLWNvbW1vbi1tb2Nr",
        name: "src",
        parent: "Y29tbW9uLW1vY2s=",
      },
      {
        id: "cGFja2FnZS5qc29uLWNvbW1vbi1tb2Nr",
        name: "package.json",
        parent: "Y29tbW9uLW1vY2s=",
      },
      {
        id: "ZGlzdC1jb21tb24tbW9jaw==",
        name: "dist",
        parent: "Y29tbW9uLW1vY2s=",
      },
      {
        id: "bWFpbi50cy1zcmMtY29tbW9uLW1vY2s=",
        name: "main.ts",
        parent: "c3JjLWNvbW1vbi1tb2Nr",
      },
      {
        id: "bWFpbi1zcmMtY29tbW9uLW1vY2s=",
        name: "main",
        parent: "c3JjLWNvbW1vbi1tb2Nr",
      },
      {
        id: "bWFpbi5qcy1kaXN0LWNvbW1vbi1tb2Nr",
        name: "main.js",
        parent: "ZGlzdC1jb21tb24tbW9jaw==",
      },
      {
        id: "bWFpbi1kaXN0LWNvbW1vbi1tb2Nr",
        name: "main",
        parent: "ZGlzdC1jb21tb24tbW9jaw==",
      },
      {
        id: "Zm9vLnRzLW1haW4tc3JjLWNvbW1vbi1tb2Nr",
        name: "foo.ts",
        parent: "bWFpbi1zcmMtY29tbW9uLW1vY2s=",
      },
      {
        id: "YmFyLnRzLW1haW4tc3JjLWNvbW1vbi1tb2Nr",
        name: "bar.ts",
        parent: "bWFpbi1zcmMtY29tbW9uLW1vY2s=",
      },
      {
        id: "Zm9vLmpzLW1haW4tZGlzdC1jb21tb24tbW9jaw==",
        name: "foo.js",
        parent: "bWFpbi1kaXN0LWNvbW1vbi1tb2Nr",
      },
      {
        id: "YmFyLmpzLW1haW4tZGlzdC1jb21tb24tbW9jaw==",
        name: "bar.js",
        parent: "bWFpbi1kaXN0LWNvbW1vbi1tb2Nr",
      },
    ],
    output: [
      {
        id: "ZGlzdC1jb21tb24tbW9jaw==",
        name: "dist",
        parent: "Y29tbW9uLW1vY2s=",
      },
      {
        id: "Y29tbW9uLW1vY2s=",
        name: "common",
        parent: "bW9jaw==",
      },
      {
        id: "bW9jaw==",
        name: "mock",
      },
    ],
  });
});
