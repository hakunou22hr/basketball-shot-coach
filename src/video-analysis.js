export const DESKTOP_ANALYSIS_FPS = 12;
export const IPAD_ANALYSIS_FPS = 8;
export const IPHONE_ANALYSIS_FPS = 6;
export const VIDEO_READY_TIMEOUT_MS = 10_000;
export const SEEK_TIMEOUT_MS = 4_000;

export function isAppleMobileDevice(navigatorLike = navigator) {
  const agent = navigatorLike.userAgent || '';
  return /iPhone|iPad|iPod/.test(agent) || (agent.includes('Macintosh') && Number(navigatorLike.maxTouchPoints) > 1);
}

export function deviceAnalysisFps(navigatorLike = navigator) {
  const agent = navigatorLike.userAgent || '';
  if (/iPhone|iPod/.test(agent)) return IPHONE_ANALYSIS_FPS;
  if (/iPad/.test(agent) || (agent.includes('Macintosh') && Number(navigatorLike.maxTouchPoints) > 1)) return IPAD_ANALYSIS_FPS;
  return DESKTOP_ANALYSIS_FPS;
}

function waitForEvent(target, successEvent, timeoutMs, errorMessage) {
  return new Promise((resolve, reject) => {
    let timer;
    const cleanup = () => { clearTimeout(timer); target.removeEventListener(successEvent, done); target.removeEventListener('error', failed); target.removeEventListener('abort', failed); };
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error(errorMessage)); };
    target.addEventListener(successEvent, done, { once: true });
    target.addEventListener('error', failed, { once: true });
    target.addEventListener('abort', failed, { once: true });
    timer = setTimeout(() => { cleanup(); reject(new Error(errorMessage)); }, timeoutMs);
  });
}

export async function waitForVideoReady(video, timeoutMs = VIDEO_READY_TIMEOUT_MS) {
  if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) return;
  await waitForEvent(video, 'loadedmetadata', timeoutMs, '動画の読み込みがタイムアウトしました。Safariを再起動するか、動画を選び直してください。');
  if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('動画の長さを取得できませんでした。動画を選び直してください。');
}

export async function seekVideo(video, time, timeoutMs = SEEK_TIMEOUT_MS) {
  const target = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.001));
  // Safari does not always emit `seeked` for zero or an unchanged currentTime.
  if (target <= 0.001 || Math.abs(video.currentTime - target) <= 0.001) { video.currentTime = target; return; }
  const pending = waitForEvent(video, 'seeked', timeoutMs, '動画位置の移動がタイムアウトしました。動画を選び直して再試行してください。');
  video.currentTime = target;
  await pending;
}
