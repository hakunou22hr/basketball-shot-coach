import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('player navigation, editor, and explicit delete confirmation are present',async()=>{const html=await readFile(new URL('../index.html',import.meta.url),'utf8');assert.match(html,/data-tab="players">個人別/);assert.match(html,/＋ 選手を追加/);assert.match(html,/成功フォーム・解析履歴もすべて削除されます/);assert.match(html,/キャンセル/);assert.match(html,/削除する/)});
test('offline cache contains the player data module',async()=>{const worker=await readFile(new URL('../sw.js',import.meta.url),'utf8');assert.match(worker,/\.\/src\/player-store\.js/)});
