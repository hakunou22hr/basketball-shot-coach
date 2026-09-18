import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRate, calculateStreak, getCoachTip } from '../src/shot-utils.js';

test('calculateRate returns a rounded percentage', () => {
  assert.equal(calculateRate(7, 10), 70);
  assert.equal(calculateRate(2, 3), 67);
  assert.equal(calculateRate(0, 0), 0);
});

test('calculateStreak counts consecutive UTC practice days', () => {
  const sessions = [
    { createdAt: '2026-09-18T08:00:00.000Z' },
    { createdAt: '2026-09-17T08:00:00.000Z' },
    { createdAt: '2026-09-15T08:00:00.000Z' },
  ];
  assert.equal(calculateStreak(sessions, new Date('2026-09-18T12:00:00.000Z')), 2);
});

test('getCoachTip adjusts guidance to the latest result', () => {
  assert.match(getCoachTip({ made: 9, attempts: 10 }), /ナイスシュート/);
  assert.match(getCoachTip({ made: 4, attempts: 10 }), /結果は気にしなくて大丈夫/);
});
