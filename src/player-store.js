export const LEGACY_STORE = 'shot-coach:sequence:v2';
export const PLAYER_STORE = 'shot-coach:players:v3';

export function createPlayer(input, id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`) {
  const name = String(input.name || '').trim();
  if (!name) throw new Error('名前またはニックネームを入力してください');
  return { id, name, nickname: String(input.nickname || '').trim(), dominantHand: input.dominantHand === 'left' ? 'left' : 'right', memo: String(input.memo || '').trim(), reference: null, history: [], createdAt: new Date().toISOString() };
}

export function migrateState(stored, legacy) {
  if (stored?.version === 3 && Array.isArray(stored.players)) return { ...stored, selectedPlayerId: stored.players.some(p => p.id === stored.selectedPlayerId) ? stored.selectedPlayerId : null };
  const hasLegacy = legacy && (legacy.reference || (Array.isArray(legacy.history) && legacy.history.length));
  const players = hasLegacy ? [{ ...createPlayer({ name: '既存データ', dominantHand: 'right', memo: '以前のデータから自動移行されました' }, 'player-legacy'), reference: legacy.reference || null, history: Array.isArray(legacy.history) ? legacy.history : [] }] : [];
  return { version: 3, players, selectedPlayerId: players[0]?.id || null, migratedAt: new Date().toISOString() };
}

export function loadPlayerState(storage = localStorage) {
  const parse = key => { try { return JSON.parse(storage.getItem(key)); } catch { return null; } };
  return migrateState(parse(PLAYER_STORE), parse(LEGACY_STORE));
}

export function savePlayerState(state, storage = localStorage) { storage.setItem(PLAYER_STORE, JSON.stringify(state)); }
export const selectedPlayer = state => state.players.find(player => player.id === state.selectedPlayerId) || null;
export function deletePlayer(state, id) { return { ...state, players: state.players.filter(p => p.id !== id), selectedPlayerId: state.selectedPlayerId === id ? null : state.selectedPlayerId }; }
