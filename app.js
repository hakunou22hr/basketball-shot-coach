import { calculateRate, calculateStreak, getCoachTip } from './src/shot-utils.js';

const STORAGE_KEY = 'basketball-shot-coach:sessions';
const form = document.querySelector('#shotForm');
const madeInput = document.querySelector('#madeInput');
const attemptInput = document.querySelector('#attemptInput');
const liveRate = document.querySelector('#liveRate');
const formError = document.querySelector('#formError');
const historyList = document.querySelector('#historyList');
const toast = document.querySelector('#toast');

let sessions = loadSessions();

function loadSessions() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function updateLiveRate() {
  const made = Number(madeInput.value);
  const attempts = Number(attemptInput.value);
  liveRate.textContent = attempts > 0 && made <= attempts ? `${calculateRate(made, attempts)}%` : '—';
}

function render() {
  const totalMade = sessions.reduce((sum, item) => sum + item.made, 0);
  const totalAttempts = sessions.reduce((sum, item) => sum + item.attempts, 0);
  const overallRate = totalAttempts ? calculateRate(totalMade, totalAttempts) : null;
  document.querySelector('#accuracyStat').textContent = overallRate === null ? '—' : `${overallRate}%`;
  document.querySelector('#attemptStat').innerHTML = `${totalAttempts} <small>本</small>`;
  document.querySelector('#streakStat').innerHTML = `${calculateStreak(sessions)} <small>日</small>`;
  document.querySelector('#accuracyDelta').textContent = sessions.length ? `${sessions.length}セットの平均` : '最初のセットを記録しよう';
  document.querySelector('#coachTip').textContent = getCoachTip(sessions[0]);
  renderTrend();
  renderHistory();
}

function renderTrend() {
  const recent = sessions.slice(0, 5).reverse();
  const chart = document.querySelector('#trendChart');
  const labels = document.querySelector('#chartLabels');
  if (!recent.length) {
    chart.innerHTML = '<p class="empty-chart">記録するとグラフが表示されます</p>';
    labels.innerHTML = '';
    document.querySelector('#trendRate').textContent = '—';
    return;
  }
  const rates = recent.map((item) => calculateRate(item.made, item.attempts));
  chart.innerHTML = rates.map((rate) => `<span class="bar" style="--height:${Math.max(rate, 6)}%"><i>${rate}%</i></span>`).join('');
  labels.innerHTML = recent.map((_, index) => `<span>${index + 1}</span>`).join('');
  document.querySelector('#trendRate').textContent = `${rates.at(-1)}%`;
}

function renderHistory() {
  if (!sessions.length) {
    historyList.innerHTML = '<div class="empty-state"><strong>まだ記録がありません</strong><span>最初のセットを入力して、今日の練習を始めよう。</span></div>';
    return;
  }
  historyList.innerHTML = sessions.slice(0, 6).map((item) => {
    const date = new Intl.DateTimeFormat('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt));
    return `<article class="history-item"><span class="history-rate">${calculateRate(item.made, item.attempts)}<small>%</small></span><div><strong>${item.zone}</strong><p>${item.made} / ${item.attempts}本 · ${item.feeling}${item.note ? ` · ${escapeHtml(item.note)}` : ''}</p></div><time>${date}</time></article>`;
  }).join('');
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const made = Number(madeInput.value);
  const attempts = Number(attemptInput.value);
  if (!Number.isInteger(made) || !Number.isInteger(attempts) || attempts < 1 || made < 0 || made > attempts) {
    formError.textContent = '成功数は、0以上かつ試投数以下で入力してください。';
    return;
  }
  formError.textContent = '';
  sessions.unshift({
    id: crypto.randomUUID(), made, attempts,
    zone: new FormData(form).get('zone'),
    feeling: new FormData(form).get('feeling'),
    note: document.querySelector('#noteInput').value.trim(),
    createdAt: new Date().toISOString(),
  });
  saveSessions();
  render();
  form.reset();
  madeInput.value = '7';
  attemptInput.value = '10';
  updateLiveRate();
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
});

[madeInput, attemptInput].forEach((input) => input.addEventListener('input', updateLiveRate));
document.querySelector('#clearButton').addEventListener('click', () => {
  if (sessions.length && window.confirm('すべての記録を削除しますか？')) {
    sessions = [];
    saveSessions();
    render();
  }
});
document.querySelector('#themeButton').addEventListener('click', () => document.body.classList.toggle('light'));

render();
