import { defineConfig } from "vitest/config";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      name: "DoomReactiveState",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs", "umd"],
      fileName: 'doom-reactive-state',
    },
    target: 'esnext',
  },
  resolve: { alias: { src: resolve("src/") } },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      reporter: ["text", "html"],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
});
