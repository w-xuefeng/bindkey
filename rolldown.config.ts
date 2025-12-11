import { defineConfig } from "rolldown";

export default defineConfig([
  {
    input: "src/index.ts",
    external: [],
    output: [
      {
        dir: "lib",
        format: "esm",
        entryFileNames: "[name].esm.js",
        minify: true,
      },
      {
        dir: "lib",
        format: "cjs",
        entryFileNames: "[name].cjs.js",
        minify: true,
      },
    ],
  },
]);
