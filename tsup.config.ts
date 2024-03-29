import { defineConfig } from "tsup";

export default defineConfig([
  {
    entryPoints: { "index": "src/index.ts" },
    target: "es2020",
    format: ["cjs", "esm"],
    splitting: false,
    sourcemap: true,
    clean: true,
    minify: true,
    dts: true,
    treeshake: true,
    outDir: "dist",
  },
  {
    entryPoints: { "doom-reactive-state": "src/index.ts" },
    target: "es2020",
    format: ["iife"],
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: true,
    dts: false,
    treeshake: true,
    outDir: "cdn",
    globalName: "doom",
  },
]);
