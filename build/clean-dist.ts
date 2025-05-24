import { $ } from "bun";
import path from "path";

// Root directory
const rootDir = path.resolve(import.meta.dir, "..");
const distDir = path.join(rootDir, "dist");

console.log("Clearing dist directory...");

// Clean previous build
await $`rm -rf ${distDir}`;

console.log("✅ Dist directory cleared!");