import { parseArgs } from "node:util";

export const args = parseArgs({
  options: {
    port: {
      type: "string",
      short: "p",
    },
    open: {
      type: "boolean",
      short: "o",
    },
  },
});
