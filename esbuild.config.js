import { build } from 'esbuild';

await build({
  entryPoints: ['src/background/index.ts'],
  bundle: true,
  outfile: 'dist/background/index.js',
  platform: 'browser',
  target: 'firefox109',
  format: 'iife',
  globalName: 'SessionSwitcher',
  minify: false,
  sourcemap: false
});

await build({
  entryPoints: ['src/popup/index.ts'],
  bundle: true,
  outfile: 'dist/popup/index.js',
  platform: 'browser',
  target: 'firefox109',
  format: 'iife',
  minify: false,
  sourcemap: false
});
