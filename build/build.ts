import { $ } from "bun";
import path from "path";
import { readdir } from "fs/promises";

const rootDir = path.resolve(import.meta.dir, "..");
const popupSrc = path.join(rootDir, "src", "popup");
const assetsDir = path.join(rootDir, "src", "assets");

const distDir = path.join(rootDir, "dist");
const popupDist = path.join(distDir, "popup");

const target = Bun.argv[2];
if (!["firefox", "chrome"].includes(target)) {
  console.error("❌ Please specify a target: 'firefox' or 'chrome'");
  process.exit(1);
}

console.log(`Building Session Switcher Extension for ${target}...`);

// Clean previous build
await $`rm -rf ${distDir}`;

// Create directory structure
await $`mkdir -p ${path.join(distDir, "background")}`;
await $`mkdir -p ${popupDist}`;

// Compile TypeScript
console.log("Compiling TypeScript...");
await $`bun ${path.join(rootDir, "esbuild.config.js")}`;

// Copy correct manifest file
console.log("Copying manifest...");
const manifestSrc =
  target === "firefox"
    ? path.join(rootDir, "src/manifest.firefox.json")
    : path.join(rootDir, "src/manifest.chrome.json");

await $`cp ${manifestSrc} ${path.join(distDir, "manifest.json")}`;

// Copy popup/*.html and *.css
console.log("Copying popup files...");
const popupFiles = await readdir(popupSrc);
for (const file of popupFiles) {
  if (file.endsWith(".html") || file.endsWith(".css")) {
    await $`cp ${path.join(popupSrc, file)} ${popupDist}/`;
  }
}

// Copy icons/assets folder if exists
try {
  await $`cp -R ${assetsDir} ${distDir}/`;
} catch {
  console.log("⚠️ No icons directory found");
}

console.log("✅ Build complete! Extension files are in ./dist/");
console.log("👉 To install: Load ./dist/ as unpacked extension in browser");
