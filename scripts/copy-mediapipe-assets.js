import { access, copyFile, mkdir } from 'node:fs/promises';

const packageRoot = 'node_modules/@mediapipe/tasks-vision';
const wasmFiles = [
  'vision_wasm_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_nosimd_internal.wasm',
];
await mkdir('mediapipe', { recursive: true });
await mkdir('wasm', { recursive: true });
await copyFile(`${packageRoot}/vision_bundle.mjs`, 'mediapipe/vision_bundle.mjs');
await copyFile(`${packageRoot}/vision_bundle.js`, 'mediapipe/vision_bundle.js');
for (const file of wasmFiles) await copyFile(`${packageRoot}/wasm/${file}`, `wasm/${file}`);
await access('models/pose_landmarker_lite.task');
console.log('Copied the official MediaPipe runtime and WASM files from node_modules.');
