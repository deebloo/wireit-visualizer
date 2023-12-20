import test from "ava";
import { WireitAnalyzer, WireitPackage } from "./analyzer.js";

test("should locate package json file", async (t) => {
  class Analyzer extends WireitAnalyzer {
    async readPackge(_: string): Promise<WireitPackage> {
      return {
        wireit: {
          build: {
            command: "build",
            dependencies: ["tsc"],
          },
          tsc: {
            command: "tsc",
          },
        },
      };
    }
  }

  const analyzer = new Analyzer();

  const res = await analyzer.analyze({ name: "build", packageDir: "./" });

  t.deepEqual(res, {
    config: {
      value: {
        dependencies: [
          {
            config: {
              name: "tsc",
              packageDir: "./",
            },
          },
        ],
      },
    },
  });
});
