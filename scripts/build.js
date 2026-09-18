import { cp, mkdir, readFile, rm, stat } from 'node:fs/promises';

const required = new Map([
  ['mediapipe/vision_bundle.mjs', 10_000],
  ['wasm/vision_wasm_internal.js', 1_000],
  ['wasm/vision_wasm_internal.wasm', 1_000_000],
  ['wasm/vision_wasm_nosimd_internal.js', 1_000],
  ['wasm/vision_wasm_nosimd_internal.wasm', 1_000_000],
  ['models/pose_landmarker_lite.task', 1_000_000],
]);
const appFiles = ['index.html', 'styles.css', 'app.js', 'sw.js', 'manifest.webmanifest', 'src/shot-utils.js', 'icons/icon.svg'];
for (const [file, minimumBytes] of required) {
  const { size } = await stat(file);
  if (size < minimumBytes) throw new Error(`${file} is missing, empty, or unexpectedly small (${size} bytes)`);
  console.log(`${file}: ${size} bytes`);
}
JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
const appSource = await readFile('app.js', 'utf8');
if (/https?:\/\//.test(appSource)) throw new Error('Runtime external URL found in app.js');
await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
await mkdir('dist/icons', { recursive: true });
for (const file of appFiles) await cp(file, `dist/${file}`, { recursive: true });
for (const directory of ['mediapipe', 'wasm', 'models']) await cp(directory, `dist/${directory}`, { recursive: true });
console.log('GitHub Pages artifact created in dist/.');
