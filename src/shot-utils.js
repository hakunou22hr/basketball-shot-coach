export function calculateRate(made, attempts) {
  if (!Number.isFinite(made) || !Number.isFinite(attempts) || attempts <= 0) return 0;
  return Math.round((made / attempts) * 100);
}

export function calculateStreak(sessions, now = new Date()) {
  const days = new Set(sessions.map(({ createdAt }) => new Date(createdAt).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function getCoachTip(session) {
  if (!session) return 'まずは10本。リングではなく、毎回同じフォームで打てたかに集中しよう。';
  const rate = calculateRate(session.made, session.attempts);
  if (rate >= 80) return 'ナイスシュート！ 好調な今こそ、足元からリリースまでのリズムを覚えておこう。';
  if (rate >= 60) return 'いいリズムです。フォロースルーを残して、次のセットも同じ軌道を狙おう。';
  return '結果は気にしなくて大丈夫。膝を柔らかく使い、リングの手前に集中してみよう。';
}
