// vite.config.js
import { defineConfig } from "vite";
import path from "path";
import banner from "vite-plugin-banner";
import dts from "vite-plugin-dts";
import pkg from "./package.json";
import emojiData from "emoji-datasource-google" with { type: "json" };
import {
  cleanPlugin,
  copyImagesPlugin,
  copyStylesPlugin,
  dataURIPlugin,
  replaceEmojiListPlugin,
} from "./vite-plugins.mjs";

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
        entryFileNames: "emojify-browser.min.js",
      },
    },
    lib: {
      entry: ["./src/index.ts"],
      name: "emojify",
      formats: ["umd"],
    },
  },
  plugins: [
    // Clean the entire "dist" folder first.
    cleanPlugin(),
    // Copy emoji images (and their aliases) into dist/images/basic.
    copyImagesPlugin(),
    // Copy (and minify) CSS from src/css/basic into dist/css/basic.
    copyStylesPlugin(),
    // Generate CSS files with data URIs from selected emoji images.
    dataURIPlugin(),
    // Replace the placeholder token with the actual comma–separated emoji list.
    replaceEmojiListPlugin(),
    // Generate TypeScript declaration files into "dist" (like gulp’s tsResult.dts)
    dts({
      outDir: "../dist",
      tsConfigFilePath: path.resolve(__dirname, "tsconfig.json"),
    }),
    // Add a banner header (license) to the JS bundle.
    banner(`/*! ${pkg.name} - v${pkg.version} -
* Copyright (c) HackMD ${new Date().getFullYear()}
*/`),
  ],
});
