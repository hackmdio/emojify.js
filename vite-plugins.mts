import path from "path";
import fs from "fs";
import fsExtra from "fs-extra";
import { glob } from "glob";
import CleanCSS from "clean-css";
import imageDataURI from "image-data-uri";
import emojiData from "emoji-datasource-google" with { type: "json" };

/**
 * Plugin to clean the entire dist folder before build.
 */
export function cleanPlugin() {
  return {
    name: "clean",
    buildStart() {
      const distPath = path.resolve(__dirname, "dist");
      fsExtra.removeSync(distPath);
    },
  };
}

/**
 * Plugin to copy and rename emoji images from emoji-datasource-google.
 */
export function copyImagesPlugin() {
  return {
    name: "copy-images",
    async buildStart() {
      const imageDest = path.resolve(__dirname, "dist/images/basic");
      await fsExtra.remove(imageDest);
      await fsExtra.ensureDir(imageDest);

      // Build a map where key = original image filename, value = emoji info
      const emojiMap = emojiData.reduce((acc, emoji) => {
        acc[emoji.image] = emoji;
        return acc;
      }, {});
      const availableFiles = Object.keys(emojiMap);
      const srcDir = path.resolve(
        __dirname,
        "node_modules/emoji-datasource-google/img/google/64",
      );

      // Copy primary emoji file (renaming to its short_name)
      const files = glob.sync(`${srcDir}/*.png`);
      for (const file of files) {
        const base = path.basename(file);
        if (availableFiles.includes(base)) {
          const emoji = emojiMap[base];
          const destFile = path.resolve(imageDest, `${emoji.short_name}.png`);
          await fsExtra.copy(file, destFile);
        }
      }
      // Copy extra aliases (if any)
      for (const base of availableFiles) {
        const emoji = emojiMap[base];
        const aliases = emoji.short_names.filter((n) => n !== emoji.short_name);
        const srcFile = path.resolve(srcDir, base);
        if (aliases.length > 0 && fs.existsSync(srcFile)) {
          for (const alias of aliases) {
            const destFile = path.resolve(imageDest, `${alias}.png`);
            await fsExtra.copy(srcFile, destFile);
          }
        }
      }
    },
  };
}

/**
 * Plugin to copy CSS files from src/css/basic to dist/css/basic and minify them.
 */
export function copyStylesPlugin() {
  return {
    name: "copy-styles",
    async buildStart() {
      const srcStylesDir = path.resolve(__dirname, "src/css/basic");
      const destStylesDir = path.resolve(__dirname, "dist/css/basic");
      await fsExtra.ensureDir(destStylesDir);
      const files = glob.sync(`${srcStylesDir}/*.css`);
      for (const file of files) {
        const destFile = path.resolve(destStylesDir, path.basename(file));
        await fsExtra.copy(file, destFile);
        // Minify the CSS
        const css = fs.readFileSync(file, "utf8");
        const minified = new CleanCSS().minify(css).styles;
        const minFile = path.resolve(
          destStylesDir,
          path.basename(file, ".css") + ".min.css",
        );
        fs.writeFileSync(minFile, minified, "utf8");
      }
    },
  };
}

/**
 * Plugin to generate CSS with data URIs for a set of emoticons.
 */
export function dataURIPlugin() {
  return {
    name: "generate-data-uri-css",
    async closeBundle() {
      const imageDir = path.resolve(__dirname, "dist/images/basic");
      const cssDataURIPath = path.resolve(__dirname, "dist/css/data-uri");
      await fsExtra.ensureDir(cssDataURIPath);
      const files = glob.sync(`${imageDir}/*.png`);
      // Emoticon list (as in your gulpfile)
      const emoticons = [
        "smile",
        "scream",
        "smirk",
        "grinning",
        "stuck_out_tongue_closed_eyes",
        "stuck_out_tongue_winking_eye",
        "rage",
        "frowning",
        "sob",
        "kissing_heart",
        "wink",
        "pensive",
        "confounded",
        "flushed",
        "relaxed",
        "mask",
        "heart",
        "broken_heart",
      ];
      let cssContent = "";
      let emoticonsContent = "";
      // For each image that is in the emoticon list, generate a CSS rule with its data URI.
      for (const file of files) {
        const name = path.basename(file, ".png");
        const dataUri = await imageDataURI.encodeFromFile(file, "PNG");
        const str = `.emoji-${name === "+1" ? "plus1" : name} { background-image: url("${dataUri}"); }\n`;
        cssContent += str;
        if (emoticons.includes(name)) emoticonsContent += str;
      }
      // Write unminified CSS file
      fs.writeFileSync(
        path.resolve(cssDataURIPath, "emojify.css"),
        cssContent,
        "utf8",
      );
      // Write minified version
      fs.writeFileSync(
        path.resolve(cssDataURIPath, "emojify.min.css"),
        new CleanCSS().minify(cssContent).styles,
        "utf8",
      );

      const cssFile = path.resolve(cssDataURIPath, "emojify-emoticons.css");
      fs.writeFileSync(
        path.resolve(cssDataURIPath, "emojify-emoticons.css"),
        emoticonsContent,
        "utf8",
      );
      fs.writeFileSync(
        path.resolve(cssDataURIPath, "emojify-emoticons.min.css"),
        new CleanCSS().minify(emoticonsContent).styles,
        "utf8",
      );
    },
  };
}

/**
 * Plugin to replace the token "\/*##EMOJILIST*\/\n'';" with a string
 * built from the names of the emoji images that were copied.
 */
export function replaceEmojiListPlugin() {
  return {
    name: "replace-emoji-list",
    generateBundle(options, bundle) {
      const imageDir = path.resolve(__dirname, "dist/images/basic");
      let emojiString = "";
      if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir);
        emojiString = files
          .filter((f) => f.endsWith(".png"))
          .map((f) => path.basename(f, ".png"))
          .join(",");
      }
      // For each JS chunk in the bundle, do the replacement.
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === "chunk") {
          chunk.code = chunk.code.replace(/#EMOJILIST#/, `${emojiString}`);
        }
      }
    },
  };
}
