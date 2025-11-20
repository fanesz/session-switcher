import { build } from "esbuild";

await build({
  bundle: true,
  outfile: "dist/background/index.js",
  platform: "browser",
  target: "firefox109",
  format: "iife",
  globalName: "SessionSwitcher",
  minify: false,
  sourcemap: false,
});

await build({
  entryPoints: ["src/popup/index.tsx"],
  bundle: true,
  outfile: "dist/popup/index.js",
  platform: "browser",
  target: "firefox109",
  format: "iife",
  minify: false,
  sourcemap: false,
  jsx: "automatic",
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
  },
});
