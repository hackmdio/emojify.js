import { defineConfig } from "vite";
import banner from "vite-plugin-banner";
import pkg from "./package.json";
import { replaceEmojiListPlugin } from "./vite-plugins.mjs";

export default defineConfig({
  // We set the root to our source folder.
  root: "./src",
  build: {
    // We output bundled JS into dist/js (mimicking your gulp dest)
    outDir: "../dist/js",
    // We disable emptying the outDir because our plugins create files in other parts of "dist"
    emptyOutDir: false,
    rollupOptions: {
      input: "./src/index.ts",
      output: {
        // Append ".min" suffix to the generated JS file.
        entryFileNames: "[name].min.js",
      },
    },
    ssr: true,
    minify: "esbuild",
    lib: {
      entry: ["./src/index.ts"],
      name: "emojify",
      formats: ["umd"],
    },
  },
  plugins: [
    // Replace the placeholder token with the actual comma–separated emoji list.
    replaceEmojiListPlugin(),
    // Add a banner header (license) to the JS bundle.
    banner(`/*! ${pkg.name} - v${pkg.version} -
* Copyright (c) HackMD ${new Date().getFullYear()}
*/`),
  ],
});
