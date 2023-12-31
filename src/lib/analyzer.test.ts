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
  });
});
