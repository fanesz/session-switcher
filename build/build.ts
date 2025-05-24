import { $ } from "bun";
import path from "path";
import { readdir } from "fs/promises";

const rootDir = path.resolve(import.meta.dir, "..");
const popupSrc = path.join(rootDir, "src", "popup");
const assetsDir = path.join(rootDir, "src", "assets");

const distDir = path.join(rootDir, "dist");
const popupDist = path.join(distDir, "popup");

console.log("Building Session Switcher Extension...");

// Clean previous build
await $`rm -rf ${distDir}`;

// Create directory structure
await $`mkdir -p ${path.join(distDir, "background")}`;
await $`mkdir -p ${popupDist}`;

// Compile TypeScript
console.log("Compiling TypeScript...");
await $`bun ${path.join(rootDir, "esbuild.config.js")}`;

// Copy static files
console.log("Copying static files...");
await $`cp ${path.join(rootDir, "src/manifest.json")} ${distDir}/`;

// Copy popup/*.html and *.css manually
const popupFiles = await readdir(popupSrc);
for (const file of popupFiles) {
  if (file.endsWith(".html") || file.endsWith(".css")) {
    await $`cp ${path.join(popupSrc, file)} ${popupDist}/`;
  }
}

// Copy icons folder if it exists
try {
  await $`cp -R ${assetsDir} ${distDir}/`;
} catch {
  console.log("⚠️ No icons directory found");
}

console.log("✅ Build complete! Extension files are in ./dist/");
console.log("👉 To install: Load ./dist/ as unpacked extension in browser");
