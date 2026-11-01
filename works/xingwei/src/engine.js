import { CARD_BY_ID, REGIONS, ENEMIES, RELICS, dailyInfo } from './data.js';

export const SAVE_VERSION = 1;
const copy = value => structuredClone(value);
const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
function random(s) { s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0; return s.rng / 4294967296; }
function shuffle(s, array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(random(s) * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
function card(s, type, extra = {}) { return { uid: `c${s.nextUid++}`, type, upgrade: 0, ...extra }; }
function log(s, text) { s.logs.unshift(text); s.logs = s.logs.slice(0, 40); }
function track(s, amount) { s.track = clamp(s.track + amount, 0, 100); }
function shield(s, amount) { s.shield = clamp(s.shield + amount, 0, 99); }
function heal(s, amount) { s.hull = clamp(s.hull + amount, 0, s.maxHull); }
function gain(s, kind, amount) {
  s.resources[kind] = Math.min(99, s.resources[kind] + amount);
  if (kind === 'gold') s.goldCollected += amount;
}
export function allCards(s) { return [...s.deck, ...s.storage, ...(s.current ? [s.current] : [])]; }
export function projectDone(s, id) { return (s.projects[id] || 0) >= (CARD_BY_ID[id].stages || 1); }
export function costAvailable(s, def) {
  if (!def.cost) return true;
  const resources = { ...s.resources };
  for (const kind of ['fuel', 'bio', 'gold']) {
    resources[kind] -= def.cost[kind] || 0;
    if (resources[kind] < 0) return false;
  }
  return Object.values(resources).reduce((a, b) => a + b, 0) >= (def.cost.any || 0);
}
function pay(s, def) {
  for (const kind of ['fuel', 'bio', 'gold']) s.resources[kind] -= def.cost[kind] || 0;
  let any = def.cost.any || 0;
  for (const kind of ['fuel', 'bio', 'gold']) { const used = Math.min(s.resources[kind], any); s.resources[kind] -= used; any -= used; }
}
export function enemyIntent(s) {
  const phase = s.enemy.kind === 'BOSS' ? (s.enemy.hp <= s.enemy.maxHp / 3 ? 3 : s.enemy.hp <= s.enemy.maxHp * 2 / 3 ? 2 : 1) : 1;
  const power = s.enemy.power + (phase - 1) * 3;
  const cycle = s.enemy.actions % 4;
  if (cycle === 1) return { type: 'shield', name: '重构护盾', value: 12 + phase * 3, phase };
  if (cycle === 2) return { type: 'drain', name: '引力脉冲', value: Math.round(power * .7), phase };
  return { type: 'attack', name: cycle === 3 ? '蓄力重炮' : '脉冲射击', value: cycle === 3 ? Math.round(power * 1.5) : power, phase };
}
function damage(s, amount) {
  const absorbed = Math.min(s.enemy.shield, amount);
  const oldShield = s.enemy.shield;
  s.enemy.shield -= absorbed;
  const hpDamage = Math.min(s.enemy.hp, amount - absorbed);
  s.enemy.hp -= hpDamage;
  const actual = absorbed + hpDamage;
  s.stats.damage += actual;
  s.stats.biggestHit = Math.max(s.stats.biggestHit, amount);
  s.feedback.hit = (s.feedback.hit || 0) + amount;
  if (oldShield > 0 && s.enemy.shield === 0) {
    track(s, 8); s.stats.breaks++; s.feedback.broken = true; log(s, '敌方护盾击破 · 星轨 +8');
  }
}
function enemyAct(s, intent) {
  if (intent.type === 'shield') {
    s.enemy.shield += intent.value; log(s, `${s.enemy.name}重构护盾 +${intent.value}`);
  } else {
    const absorbed = Math.min(s.shield, intent.value);
    s.shield -= absorbed; s.hull = Math.max(0, s.hull - (intent.value - absorbed));
    if (intent.type === 'drain') s.resources.fuel = Math.max(0, s.resources.fuel - 1);
    s.feedback.hullHit = intent.value - absorbed;
    log(s, `${intent.name} ${intent.value} · 护盾抵挡 ${absorbed}${intent.type === 'drain' ? ' · 燃素 -1' : ''}`);
  }
  s.enemy.actions++; s.pressure = 0; s.history = []; s.round++;
}
function draw(s) {
  if (!s.deck.length && s.storage.length) s.deck.push(s.storage.shift());
  if (!s.deck.length) throw new Error('牌库已空，无法继续远征。');
  s.current = s.deck.shift();
}
function startBattle(s) {
  const region = REGIONS.find(r => r.id === s.region);
  const index = s.route[s.node];
  const base = ENEMIES[index];
  s.enemy = { ...base, hp: Math.round(base.hp * region.hp), maxHp: Math.round(base.hp * region.hp), shield: Math.round(base.shield * region.shield), power: Math.round(base.power * region.attack), actions: 0 };
  s.phase = 'battle'; s.pressure = 0; s.round = 1; s.combo = 0; s.freeActions = 0; s.history = []; s.compassUsed = false; s.pending = null;
  log(s, `抵达节点 ${s.node + 1} · ${s.enemy.name}`);
  draw(s);
}
export function createRun({ seed = Date.now() >>> 0, mode = 'standard', region = 'ring', date } = {}) {
  if (!REGIONS.some(r => r.id === region)) throw new Error('未知星域');
  const daily = dailyInfo(date);
  if (mode === 'daily') { seed = daily.seed; region = 'void'; }
  const s = {
    version: SAVE_VERSION, seed, rng: seed >>> 0, mode, region, date: mode === 'daily' ? daily.date : null,
    rule: mode === 'daily' ? daily.rule.id : null, phase: 'battle', node: 0, route: [], nextUid: 1,
    hull: 100, maxHull: 100, shield: 12, resources: { fuel: 3, bio: 2, gold: 1 }, track: 0,
    deck: [], storage: [], current: null, projects: {}, relics: [], goldCollected: 0,
    pressure: 0, round: 1, combo: 0, freeActions: 0, history: [], pending: null, coins: 0,
    logs: [], elapsed: 0, rewardRefresh: false, feedback: null,
    stats: { cards: 0, damage: 0, biggestHit: 0, combo: 0, kills: 0, bursts: 0, shallow: 0, deep: 0, breaks: 0, projects: 0 },
  };
  s.route = [0, random(s) < .5 ? 1 : 2, 3, 'supply', 4];
  const types = [1, 4, 2, 7, ...shuffle(s, [3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])];
  s.deck = types.map(type => card(s, type));
  startBattle(s);
  return s;
}
function makeRewards(s) {
  const newType = shuffle(s, [4, 5, 6, 3, 1, 8])[0];
  const available = Object.keys(RELICS).filter(key => !s.relics.includes(key));
  const relic = available.length ? available[Math.floor(random(s) * available.length)] : null;
  return [
    { kind: 'card', type: newType, name: CARD_BY_ID[newType].name, description: '获得一张新卡，加入本局牌库。', art: CARD_BY_ID[newType].art },
    relic ? { kind: 'relic', key: relic, ...RELICS[relic] } : { kind: 'blessing', name: '恒星祝福', description: '星轨值立即充满，并恢复 15 舰体。', art: 'relic' },
    { kind: 'upgrade', name: '核心强化', description: '所有生产牌强化 +1，恢复 12 舰体。', art: 'upgrade' },
  ];
}
function checkEnd(s) {
  if (s.enemy.hp <= 0) {
    s.stats.kills++; s.coins += s.enemy.kind === 'BOSS' ? 150 : s.enemy.kind === '精英' ? 80 : 45;
    s.pending = null;
    if (s.enemy.kind === 'BOSS') { s.phase = 'victory'; log(s, '深渊星核击破 · 星域突破'); }
    else { s.phase = 'reward'; s.rewards = makeRewards(s); s.rewardRefresh = false; log(s, `${s.enemy.name}已击败 · 选择一项奖励`); }
    return true;
  }
  if (s.hull <= 0) { s.phase = 'defeat'; s.pending = null; log(s, '舰体受损 · 本次远征结束'); return true; }
  return false;
}
function selectedCards(s, ids, candidates, min, max) {
  if (!Array.isArray(ids) || ids.length < min || ids.length > max || new Set(ids).size !== ids.length || ids.some(id => !candidates.includes(id))) throw new Error('请选择有效的卡牌。');
  return ids.map(id => allCards(s).find(c => c.uid === id));
}
function prepare(s, depth) {
  if (depth !== 'shallow' && depth !== 'deep') throw new Error('归位方向无效。');
  const type = s.current.type;
  if (type === 7) {
    const bonus = s.relics.includes('compass') && !s.compassUsed ? 1 : 0;
    const count = Math.min(s.deck.length, (depth === 'shallow' ? 4 : 5) + bonus);
    return { kind: 'sort', depth, candidates: s.deck.slice(0, count).map(c => c.uid) };
  }
  if (type === 6 && depth === 'shallow') return { kind: 'probe', depth };
  if (type === 9 && depth === 'deep') return { kind: 'relay', depth, candidates: s.deck.slice(-2).map(c => c.uid), min: 1, max: 1 };
  if (type === 15) {
    const candidates = s.deck.filter(c => c.type <= 3 && c.upgrade < 5).map(c => c.uid);
    if (candidates.length) return { kind: 'upgrade', depth, candidates, min: 1, max: Math.min(candidates.length, depth === 'deep' ? 3 : 1) };
  }
  if (type === 16 && s.storage.length < 2) {
    const candidates = s.deck.slice(0, 5).map(c => c.uid);
    if (candidates.length) return { kind: 'store', depth, candidates, min: 1, max: Math.min(candidates.length, 2 - s.storage.length, depth === 'shallow' ? 2 : 1) };
  }
  return null;
}
function resolveCard(s, depth, selection) {
  const c = s.current; const def = CARD_BY_ID[c.type]; const deep = depth === 'deep';
  const advertisedIntent = enemyIntent(s);
  const power = c.upgrade * 2 + (def.type === '攻击' && s.relics.includes('echo') ? Math.floor(s.goldCollected / 3) * 2 : 0);
  const upgraded = amount => amount + c.upgrade;
  const hit = amount => damage(s, amount + power);
  let grantFree = 0; let removeCard = !!c.temporary;
  let title = `${def.name} · ${deep ? '深位' : '浅位'}`;
  s.feedback = { depth, title };
  const hadFree = s.freeActions > 0;
  if (hadFree) s.freeActions--;
  if (def.cost && !costAvailable(s, def)) {
    title = `${def.name} · 资源不足，暂缓建造`;
  } else {
    if (def.cost) {
      if (projectDone(s, c.type)) throw new Error('这个项目已完成。');
      pay(s, def); s.projects[c.type] = (s.projects[c.type] || 0) + 1; s.stats.projects++;
      removeCard = projectDone(s, c.type);
    }
    switch (c.type) {
      case 1: gain(s, 'fuel', upgraded(deep ? 5 : 3)); if (deep) track(s, 10); else hit(2); break;
      case 2: gain(s, 'bio', upgraded(deep ? 5 : 3)); if (deep) s.deck.push(card(s, 1, { temporary: true, upgrade: c.upgrade })); else shield(s, upgraded(6)); break;
      case 3: gain(s, 'gold', upgraded(deep ? 3 : 1)); if (deep) hit(8); else gain(s, 'fuel', 1); break;
      case 4: hit(deep ? 18 : 12); break;
      case 5: hit(deep ? 12 : 5); gain(s, 'fuel', 1); if (deep) gain(s, 'gold', 1); else grantFree++; break;
      case 6:
        if (deep) { hit(10); gain(s, 'gold', 1); }
        else { if (selection === 'fuel') gain(s, 'fuel', 2); else if (selection === 'attack') hit(6); else throw new Error('请选择探测结果。'); grantFree++; }
        break;
      case 7: {
        const candidates = s.pending.candidates;
        selectedCards(s, selection, candidates, candidates.length, candidates.length);
        const map = new Map(s.deck.map(item => [item.uid, item]));
        s.deck.splice(0, candidates.length, ...selection.map(uid => map.get(uid)));
        s.compassUsed = true; break;
      }
      case 8: if (deep) s.deck.unshift(s.deck.pop()); else s.deck.push(...s.deck.splice(0, 2)); break;
      case 9: {
        let chosen = s.deck.at(-1);
        if (deep) chosen = selectedCards(s, selection, s.pending.candidates, 1, 1)[0];
        s.deck.splice(s.deck.findIndex(item => item.uid === chosen.uid), 1); s.deck.unshift(chosen); grantFree++; break;
      }
      case 10: {
        const available = s.history.filter(item => s.deck.some(card => card.uid === item.uid));
        if (deep) {
          const ids = [...new Set(available.filter(item => item.depth === 'shallow').map(item => item.uid))];
          for (const uid of ids) { const i = s.deck.findIndex(item => item.uid === uid); s.deck.push(...s.deck.splice(i, 1)); }
          track(s, ids.length * 8); title += ` · 调度 ${ids.length} 张`;
        } else {
          if (available.length) { const i = s.deck.findIndex(item => item.uid === available.at(-1).uid); s.deck.unshift(...s.deck.splice(i, 1)); }
          shield(s, 4);
        }
        break;
      }
      case 11: hit(deep ? 36 : 24); shield(s, deep ? 24 : 18); break;
      case 12: track(s, deep ? 40 : 25); if (deep) hit(15); else grantFree++; break;
      case 13: heal(s, deep ? 40 : 28); shield(s, deep ? 20 : 12); break;
      case 14: hit(deep ? 65 : 45); track(s, deep ? 45 : 25); break;
      case 15:
        if (s.pending) for (const item of selectedCards(s, selection, s.pending.candidates, s.pending.min, s.pending.max)) item.upgrade = Math.min(5, item.upgrade + (deep ? 1 : 2));
        else { shield(s, 8); title += ' · 生产牌已满级，转为 8 护盾'; }
        break;
      case 16:
        if (s.pending) {
          const cards = selectedCards(s, selection, s.pending.candidates, s.pending.min, s.pending.max);
          for (const item of cards) { s.deck.splice(s.deck.findIndex(d => d.uid === item.uid), 1); if (deep) item.upgrade = Math.min(5, item.upgrade + 1); s.storage.push(item); }
        } else { shield(s, 5); title += ' · 仓库已满，转为 5 护盾'; }
        break;
      case 17: if (deep) { gain(s, 'gold', 1); track(s, 15); } else { gain(s, 'fuel', 2); shield(s, 5); } break;
      default: throw new Error('卡牌尚未实现。');
    }
    if (s.rule === 'gold' && def.type === '生产') gain(s, 'gold', 1);
  }
  s.stats.cards++; s.stats[depth]++;
  track(s, deep ? 12 : 5);
  if (deep) {
    s.combo = 0;
    if (s.relics.includes('crucible')) track(s, 5);
    if (s.rule === 'deep') track(s, 6);
  } else {
    s.combo++; s.stats.combo = Math.max(s.stats.combo, s.combo);
    if (s.combo % 3 === 0) { damage(s, s.relics.includes('lens') ? 16 : 6); s.feedback.combo = s.combo; }
    if (s.rule === 'quick') damage(s, 3);
  }
  if (!removeCard) {
    if (deep) s.deck.push(c); else s.deck.splice(Math.min(2, s.deck.length), 0, c);
    s.history.push({ uid: c.uid, depth });
  }
  s.current = null; s.pending = null;
  log(s, `${title}${s.feedback.hit ? ` · 伤害 ${s.feedback.hit}` : ''}`);
  s.feedback.title = title;
  if (checkEnd(s)) return;
  s.pressure += (hadFree ? 0 : 1) + (c.type === 17 ? 1 : 0);
  if (s.pressure >= 3) enemyAct(s, advertisedIntent);
  s.freeActions = Math.min(2, s.freeActions + grantFree);
  if (!checkEnd(s)) draw(s);
}
export function scoreRun(s) {
  const won = s.phase === 'victory';
  const score = Math.max(0, Math.round(s.stats.kills * 350 + s.stats.damage * 2 + s.stats.combo * 40 + s.stats.projects * 100 + (won ? 1000 + s.hull * 10 : 0) - s.stats.cards * 5));
  return { score, grade: !won ? '未突破' : score >= 5000 ? 'SSS' : score >= 3900 ? 'SS' : score >= 3000 ? 'S' : 'A', won };
}
export function dispatch(original, action) {
  const s = copy(original);
  if (!action || typeof action.type !== 'string') throw new Error('无效操作');
  s.feedback = null;
  if (action.type === 'reward' || action.type === 'refresh') {
    if (s.phase !== 'reward') throw new Error('当前不能领取奖励。');
    if (action.type === 'refresh') {
      if (s.rewardRefresh || s.coins < 30) throw new Error('刷新需要 30 金币，每次奖励限一次。');
      s.coins -= 30; s.rewardRefresh = true; s.rewards = makeRewards(s); return s;
    }
    const reward = s.rewards[action.index];
    if (!reward || !Number.isInteger(action.index)) throw new Error('请选择有效奖励。');
    if (reward.kind === 'card') {
      if (CARD_BY_ID[reward.type].cost && projectDone(s, reward.type)) { heal(s, 20); track(s, 30); log(s, '项目已完成 · 改为修复 20 舰体、30 星轨'); }
      else s.deck.push(card(s, reward.type));
    } else if (reward.kind === 'relic') s.relics.push(reward.key);
    else if (reward.kind === 'blessing') { track(s, 100); heal(s, 15); }
    else { for (const item of allCards(s)) if (item.type <= 3) item.upgrade = Math.min(5, item.upgrade + 1); heal(s, 12); }
    log(s, `获得奖励 · ${reward.name}`); s.rewards = null; heal(s, 10); s.node++;
    if (s.route[s.node] === 'supply') { s.phase = 'supply'; s.supplyUsed = false; s.current = null; }
    else startBattle(s);
    return s;
  }
  if (action.type === 'supply') {
    if (s.phase !== 'supply') throw new Error('当前不在补给节点。');
    if (action.choice === 'repair') { heal(s, 40); shield(s, 15); }
    else if (action.choice === 'resources') { gain(s, 'fuel', 6); gain(s, 'bio', 5); gain(s, 'gold', 3); }
    else if (action.choice === 'charge') { track(s, 100); shield(s, 8); }
    else throw new Error('请选择一种补给。');
    log(s, `补给完成 · ${action.choice === 'repair' ? '星舰修复' : action.choice === 'resources' ? '资源装载' : '星轨充能'}`);
    s.node++; startBattle(s); return s;
  }
  if (s.phase !== 'battle') throw new Error('战斗已经结束。');
  if (action.type === 'cancel') { s.pending = null; return s; }
  if (action.type === 'confirm') {
    if (!s.pending) throw new Error('没有待确认的操作。');
    resolveCard(s, s.pending.depth, action.selection); return s;
  }
  if (s.pending) throw new Error('请先完成当前卡牌选择。');
  if (action.type === 'play') {
    s.pending = prepare(s, action.depth);
    if (!s.pending) resolveCard(s, action.depth);
  } else if (action.type === 'burst') {
    if (s.track < 100) throw new Error('星轨值尚未充满。');
    const fuel = Math.min(3, s.resources.fuel), gold = Math.min(2, s.resources.gold);
    s.track = 0; s.resources.fuel -= fuel; s.resources.gold -= gold;
    s.feedback = { burst: true, title: '星轨爆发 · 黄金轨道' };
    damage(s, 60 + fuel * 4 + gold * 8); s.stats.bursts++; log(s, `星轨爆发 · ${60 + fuel * 4 + gold * 8} 伤害`);
    if (s.enemy.hp <= 0) { s.deck.unshift(s.current); s.current = null; }
    checkEnd(s);
  } else if (action.type === 'retrieve') {
    const index = s.storage.findIndex(c => c.uid === action.uid);
    if (index < 0) throw new Error('仓库中没有这张牌。');
    const c = s.storage.splice(index, 1)[0]; s.deck.unshift(s.current); s.current = c; s.freeActions = Math.min(2, s.freeActions + 1);
    log(s, `从仓库取出 ${CARD_BY_ID[c.type].name} · 额外行动`);
  } else throw new Error('未知操作。');
  return s;
}
export function validRun(s) {
  if (!s || s.version !== SAVE_VERSION || !['battle', 'reward', 'supply', 'victory', 'defeat'].includes(s.phase)) return false;
  if (!Array.isArray(s.deck) || !Array.isArray(s.storage) || !s.resources || !s.stats || !s.projects || !Array.isArray(s.relics) || !Array.isArray(s.route) || !Array.isArray(s.logs)) return false;
  if (!REGIONS.some(r => r.id === s.region) || !Number.isInteger(s.node) || s.node < 0 || s.node > 4 || !Number.isFinite(s.hull) || !Number.isFinite(s.elapsed) || !Number.isFinite(s.track) || !Number.isFinite(s.nextUid)) return false;
  if (s.phase === 'battle' && (!s.current || !s.enemy || !Number.isFinite(s.enemy.hp))) return false;
  if (s.phase === 'reward' && (!Array.isArray(s.rewards) || s.rewards.length !== 3)) return false;
  const cards = allCards(s);
  return cards.length > 0 && cards.every(c => c && CARD_BY_ID[c.type] && typeof c.uid === 'string' && Number.isFinite(c.upgrade)) && new Set(cards.map(c => c.uid)).size === cards.length && ['fuel', 'bio', 'gold'].every(k => Number.isFinite(s.resources[k]) && s.resources[k] >= 0);
}
