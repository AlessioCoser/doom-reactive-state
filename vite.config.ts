import { defineConfig } from 'vitest/config'
import dts from "vite-plugin-dts"
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    // viteStaticCopy({
    //   targets: [
    //     { src: 'src/dom/jsx.d.ts', dest: 'dom' },
    //   ]
    // })
  ],
  build: {
    lib: {
      entry: './src',
      fileName: 'index',
      // formats: ['es', 'cjs']
    },
    // rollupOptions: {
    //   input: [
    //     './src/index.ts',
    //     './src/dom/jsx-dev-runtime.ts',
    //     './src/dom/jsx-runtime.ts',
    //   ],
    //   output: {
    //     preserveModules: false,
    //     inlineDynamicImports: false,
    //   }
    // }
  },
  test: {
    globals: true,
    environment: 'jsdom',
  }
})

