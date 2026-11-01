import { CARDS, CARD_BY_ID, REGIONS, RELICS, dailyInfo } from './data.js';
import { createRun, dispatch, allCards, costAvailable, enemyIntent, scoreRun, validRun } from './engine.js';
import { icon } from './icons.js';

const SAVE_KEY = 'xingwei.mobile.v1';
const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const defaultProfile = () => ({ coins: 0, wins: 0, records: [], skin: 'gold', tutorialSeen: false, settings: { sound: true, haptics: true, motion: true } });
let profile = defaultProfile(), run = null, page = 'home', modal = null, filter = '全部', recordFilter = 'all', selectedRegion = 'ring';
let storageWarning = '', locked = false, selected = [], sortOrder = [], audioContext, lastFocus, toastTimer, lastTick = Date.now();
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    if (saved.version !== 1 || !saved.profile || !Array.isArray(saved.profile.records)) throw new Error('存档格式不兼容');
    profile = { ...defaultProfile(), ...saved.profile, settings: { ...defaultProfile().settings, ...saved.profile.settings } };
    profile.records = profile.records.filter(r => r && Number.isFinite(r.score) && typeof r.region === 'string').slice(0, 40);
    if (saved.run) { if (!validRun(saved.run)) throw new Error('远征存档不完整'); run = saved.run; }
  }
} catch { storageWarning = '原存档无法读取。可以开始一次新的远征。'; run = null; }

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const art = name => `./assets/${name}.webp`;
const number = value => Number(value || 0).toLocaleString('zh-CN');
const time = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const recordDate = value => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const regionName = id => REGIONS.find(r => r.id === id)?.name || '星域远征';
const activeRun = () => run && ['battle', 'reward', 'supply'].includes(run.phase);
const btn = (action, label, style = 'primary', extra = '') => `<button class="btn ${style}" data-action="${action}" ${extra}>${label}</button>`;
const closeButton = () => `<button class="icon-button close-modal" data-action="close" aria-label="关闭">${icon('close')}</button>`;
const pageHeader = (eyebrow, title, right = '') => `<header class="page-header"><button class="icon-button" data-action="home" aria-label="返回大厅">${icon('back')}</button><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div>${right || `<button class="icon-button" data-action="help" aria-label="玩法说明">${icon('help')}</button>`}</header>`;

function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, profile, run })); }
  catch { if (!storageWarning) { storageWarning = '浏览器无法保存进度，请保持当前页面打开。'; toast(storageWarning); } }
}
function toast(text) {
  const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}
function sound(kind = 'tap') {
  if (!profile.settings.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    const now = audioContext.currentTime;
    const notes = kind === 'burst' ? [140, 210, 420, 840] : kind === 'win' ? [440, 554, 660, 880] : kind === 'deep' ? [180, 360] : kind === 'shallow' ? [520, 780] : [660];
    notes.forEach((frequency, i) => {
      const osc = audioContext.createOscillator(), gain = audioContext.createGain();
      osc.type = kind === 'burst' ? 'triangle' : 'sine'; osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + i * .06); gain.gain.linearRampToValueAtTime(.035, now + i * .06 + .015); gain.gain.exponentialRampToValueAtTime(.001, now + i * .06 + .22);
      osc.connect(gain); gain.connect(audioContext.destination); osc.start(now + i * .06); osc.stop(now + i * .06 + .25);
    });
  } catch { /* Audio is optional when a browser has no Web Audio support. */ }
}
function skin() {
  document.documentElement.dataset.skin = ['gold', 'violet', 'ice'].includes(profile.skin) ? profile.skin : 'gold';
  document.documentElement.classList.toggle('reduce-motion', !profile.settings.motion);
}
function nav(active = page) {
  return `<nav class="bottom-nav" aria-label="主导航">${[['home', 'rocket', '星舰'], ['regions', 'compass', '星图'], ['codex', 'cards', '图鉴'], ['records', 'trophy', '战绩']].map(([action, glyph, title]) => `<button data-action="${action}" class="${active === action ? 'active' : ''}">${icon(glyph)}<span>${title}</span>${active === action ? '<i></i>' : ''}</button>`).join('')}</nav>`;
}
function homeView() {
  return `<main class="home-page">
    <header class="home-header"><div class="pilot"><img src="${art('avatar')}" alt="星旅者头像"><div><strong>星旅者</strong><span><i class="status-light"></i> 航行待命</span></div></div><div class="wallet">${icon('diamond')}<b>${number(profile.coins)}</b><span>金币</span></div><button class="icon-button" data-action="settings" aria-label="设置">${icon('settings')}</button></header>
    <section class="home-universe" aria-label="星舰停泊在金色星轨前"><div class="logo-orbit"><span></span><i></i></div><div class="game-logo"><span class="tiny-label">一场关于位置的星际冒险</span><h1 aria-label="星位"><svg class="game-title" viewBox="0 0 260 90.28" aria-hidden="true" focusable="false"><defs><linearGradient id="title-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="18%" stop-color="#fff2d8"/><stop offset="61%" stop-color="#d6ad70"/><stop offset="73%" stop-color="#826a49"/><stop offset="100%" stop-color="#f6deb2"/></linearGradient></defs><text x="137" y="74" text-anchor="middle" fill="url(#title-gold)">星位</text></svg></h1><p>STAR POSITION</p><div class="logo-rule"><i></i>${icon('star')}<i></i></div></div><img class="flagship" src="${art('flagship')}" alt="银色星舰穿过蓝紫色星轨"><div class="flight-coordinate"><span>ORBIT / 01</span><i></i><span>驶向未知星海</span></div><div class="ship-caption"><span class="status-light"></span> 星舰「寻光者」<small>全系统就绪</small></div></section>
    <section class="launch-panel"><div class="launch-heading"><span class="eyebrow">${activeRun() ? 'JOURNEY IN PROGRESS' : 'YOUR NEXT EXPEDITION'}</span><span>${activeRun() ? `${run.node + 1} / 5 节点` : '短局 · 轻策略 · 自由构筑'}</span></div><h2>${activeRun() ? regionName(run.region) : '每一次归位，改写下一程'}</h2><p>${activeRun() ? `舰体 ${run.hull} · 星轨 ${run.track} · 随时继续你的航程` : '浅位掌握节奏，深位积蓄锋芒。'}</p>${btn(activeRun() ? 'continue' : 'regions', `<span class="launch-spark">${icon('star')}</span><span>${activeRun() ? '继续远征' : '开始远征'}<small>${activeRun() ? 'RESUME EXPEDITION' : 'START EXPEDITION'}</small></span>${icon('arrow')}`, 'primary launch-button')}${activeRun() ? '<button class="text-button new-run" data-action="regions">开启新的远征</button>' : ''}</section>
    <div class="home-shortcuts"><button data-action="daily"><span>${icon('compass')}</span><strong>每日挑战</strong><small>同日 · 同一起点</small></button><button data-action="skins"><span>${icon('orbit')}</span><strong>星轨外观</strong><small>选择你的星光</small></button><button data-action="help"><span>${icon('cards')}</span><strong>航行指南</strong><small>一分钟掌握玩法</small></button></div>${nav('home')}</main>`;
}
function resources() {
  return `<div class="resources">${[['fuel', 'flame', '燃素'], ['bio', 'leaf', '活质'], ['gold', 'diamond', '星金']].map(([key, glyph, title]) => `<div class="resource ${key}">${icon(glyph)}<span><small>${title}</small><b data-resource="${key}">${run.resources[key]}</b></span></div>`).join('')}</div>`;
}
function routeView() {
  return `<div class="route-progress"><span>${run.mode === 'daily' ? '今日挑战' : regionName(run.region)}</span><div class="route-dots" aria-label="第 ${run.node + 1} 个节点，共 5 个">${run.route.map((node, i) => `<i class="${i < run.node ? 'done' : i === run.node ? 'current' : ''}">${i < run.node ? '✓' : i === 4 ? '✦' : i + 1}</i>`).join('')}</div><b>${run.node + 1}<small>/ 5</small></b></div>`;
}
function cardView(c, detail = false) {
  const def = CARD_BY_ID[c.type];
  const insufficient = run && def.cost && !costAvailable(run, def);
  return `<article class="playing-card ${def.type === '项目' ? 'project-card' : ''} ${detail ? 'detail-card' : ''}" data-card="${def.id}"><div class="card-topline"><span>#${String(def.id).padStart(2, '0')}</span><span>${def.type} ${c.temporary ? '· 临时' : ''}</span>${icon(def.symbol)}</div><div class="card-illustration"><img src="${art(def.art)}" alt="${def.name}" draggable="false"><div class="illustration-shine"></div>${c.upgrade ? `<b class="upgrade-badge">强化 +${c.upgrade}</b>` : ''}</div><div class="card-copy"><h2>${def.name}</h2><p class="card-base">${def.base}</p><div class="card-effects"><p><span class="shallow-glyph">▲ 浅</span>${def.shallow}</p><p><span class="deep-glyph">▼ 深</span>${def.deep}</p></div>${def.cost && insufficient ? '<p class="cost-warning">资源不足时仅归位，暂缓建造</p>' : c.upgrade ? `<p class="card-note">强化加成：产出 +${c.upgrade} / 伤害 +${c.upgrade * 2}</p>` : ''}</div><div class="card-bottom-star">✦</div></article>`;
}
function battleView() {
  const intent = enemyIntent(run), boss = run.enemy.kind === 'BOSS';
  return `<main class="battle-page ${boss ? 'boss-battle' : ''}"><header class="battle-header"><button class="icon-button" data-action="pause" aria-label="暂停游戏">${icon('pause')}</button>${resources()}<button class="icon-button" data-action="help" aria-label="玩法说明">${icon('help')}</button></header>${routeView()}
    <section class="enemy-zone" aria-label="敌方状态"><div class="enemy-name"><div><span class="eyebrow">${run.enemy.kind === 'BOSS' ? `BOSS · 阶段 ${intent.phase} / 3` : run.enemy.subtitle}</span><h1>${run.enemy.name}</h1></div><div class="round-marker"><small>回合</small><b>${String(run.round).padStart(2, '0')}</b></div></div><img class="enemy-art" src="${art(run.enemy.art)}" alt="${run.enemy.name}" style="--enemy-hue:${run.enemy.hue || '0deg'}"><div class="enemy-vitals"><div class="enemy-hp"><span>${icon('crosshair')} 敌舰</span><b>${run.enemy.hp}<small> / ${run.enemy.maxHp}</small></b></div><div class="health-bar enemy-health" role="progressbar" aria-label="敌方生命" aria-valuenow="${run.enemy.hp}" aria-valuemax="${run.enemy.maxHp}"><i style="width:${run.enemy.hp / run.enemy.maxHp * 100}%"></i></div><div class="enemy-details"><span>${icon('shield')} 护盾 <b>${run.enemy.shield}</b></span><span class="enemy-intent">${icon(intent.type === 'shield' ? 'shield' : 'crosshair')}${intent.name} <b>${intent.value}</b><small>· ${Math.max(0, 3 - run.pressure)} 次行动后</small></span></div></div></section>
    <section class="card-stage" aria-label="当前卡牌"><div class="card-stage-caption"><span>当前卡牌</span><span>${run.freeActions ? '✦ 额外行动 · 不推进敌方倒计时' : run.combo >= 2 ? `浅位连击 ×${run.combo}` : '选择它的下一个星位'}</span></div>${cardView(run.current)}<div class="deck-shadow"></div></section>
    <div class="ship-and-burst"><div class="ship-vitals"><span>${icon('shield')} 寻光者 <b>${run.hull}<small> / 100</small></b></span><div class="health-bar"><i style="width:${run.hull}%"></i></div><small>护盾 ${run.shield} <i>·</i> 航行 <time data-clock>${time(run.elapsed)}</time></small></div><button class="burst-button ${run.track === 100 ? 'charged' : ''}" data-action="burst" aria-label="星轨爆发 ${run.track}/100" ${run.track < 100 ? 'disabled' : ''}><span class="burst-orbit" style="--charge:${run.track}%">${icon('orbit')}</span><span><strong>${run.track === 100 ? '释放星轨爆发' : '星轨蓄力中'}</strong><small>${run.track} / 100${run.track === 100 ? ' · 60+ 伤害' : ''}</small></span></button></div>
    <div class="return-controls"><button class="return-button shallow" data-action="play" data-depth="shallow"><span class="return-glyph">${icon('up')}</span><span><strong>浅位归位</strong><small>第 3 张回收 · 星轨 +5</small></span></button><button class="return-button deep" data-action="play" data-depth="deep"><span class="return-glyph">${icon('down')}</span><span><strong>深位归位</strong><small>沉入牌底 · 星轨 +12</small></span></button></div>
    <nav class="battle-tools" aria-label="战斗资料">${[['deck', 'cards', '牌库', run.deck.length], ['storage', 'box', '仓库', run.storage.length], ['projects', 'hex', '项目', run.stats.projects], ['logs', 'log', '日志', '']].map(([action, glyph, name, value]) => `<button data-action="${action}">${icon(glyph)}<span>${name} <b>${value}</b></span></button>`).join('')}</nav></main>`;
}
function rewardView() {
  return `<main class="reward-page">${pageHeader('ENCOUNTER COMPLETE', '战斗胜利')}<div class="victory-emblem">${icon('star')}<span></span></div><div class="section-title"><span class="eyebrow">THE STARS ARE YOURS</span><h2>下一程，由你构筑</h2><p>${run.enemy.name}已击破，选择一项远征奖励。</p></div><div class="reward-options">${run.rewards.map((reward, i) => `<button class="reward-option" data-action="reward" data-index="${i}"><img src="${art(reward.art)}" alt="${reward.name}"><div><span class="eyebrow">${reward.kind === 'card' ? 'NEW CARD / 新卡' : reward.kind === 'relic' ? 'RELIC / 遗物' : 'UPGRADE / 强化'}</span><h3>${reward.name}</h3><p>${reward.description}</p></div>${icon('chevron')}</button>`).join('')}</div><div class="reward-bottom"><span>${icon('diamond')} 本局金币 <b>${run.coins}</b></span><button class="text-button" data-action="refresh" ${run.rewardRefresh || run.coins < 30 ? 'disabled' : ''}>${icon('refresh')}${run.rewardRefresh ? '本次已刷新' : '刷新 · 30 金币'}</button></div><p class="quiet-note">选择后恢复 10 舰体，继续下一个节点</p></main>`;
}
function supplyView() {
  return `<main class="supply-page">${pageHeader('A QUIET MOMENT', '星间补给站')}${routeView()}<div class="supply-scene"><img src="${art('portal')}" alt="深空中的补给星门"><span>04 / THE LAST STOP</span></div><div class="section-title"><span class="eyebrow">BEFORE THE FINAL ORBIT</span><h2>暴风之前，片刻宁静</h2><p>前方就是深渊星核。选择一项免费补给。</p></div><div class="supply-status">舰体 <b>${run.hull}/100</b><span>星轨 <b>${run.track}/100</b></span></div><div class="supply-options">${[['repair', 'shield', '修复星舰', '恢复 40 舰体，获得 15 护盾'], ['resources', 'box', '装载资源', '燃素 +6 · 活质 +5 · 星金 +3'], ['charge', 'orbit', '星轨充能', '立即充满星轨，获得 8 护盾']].map(([choice, glyph, title, desc]) => `<button data-action="supply" data-choice="${choice}">${icon(glyph)}<span><strong>${title}</strong><small>${desc}</small></span>${icon('chevron')}</button>`).join('')}</div></main>`;
}
function finishRun() {
  if (!run || !['victory', 'defeat'].includes(run.phase) || run.recorded) return;
  const score = scoreRun(run);
  profile.records.unshift({ ...score, id: run.runId, date: new Date().toISOString(), mode: run.mode, challengeDate: run.date, region: run.region, elapsed: run.elapsed, combo: run.stats.combo, hit: run.stats.biggestHit, cards: run.stats.cards });
  profile.records = profile.records.slice(0, 40); profile.coins += run.coins; if (score.won) profile.wins++;
  run.recorded = true; save();
}
function resultView() {
  const result = scoreRun(run);
  return `<main class="result-page ${result.won ? '' : 'lost'}">${pageHeader(result.won ? 'EXPEDITION COMPLETE' : 'SIGNAL STILL SHINES', result.won ? '星域突破' : '航程暂止')}<div class="result-orbit">${icon(result.won ? 'trophy' : 'rocket')}<strong>${result.won ? result.grade : '再启航'}</strong><span>${result.won ? '群星见证你的航程' : '这片星海，依然等待着你'}</span></div><div class="result-score"><span>本次远征得分</span><b>${number(result.score)}</b><small>${regionName(run.region)}${run.mode === 'daily' ? ' · 每日挑战' : ''}</small></div><div class="result-stats">${[['clock', '航行时间', time(run.elapsed)], ['signal', '最高连击', `${run.stats.combo} 次`], ['sun', '最高单次伤害', run.stats.biggestHit], ['crosshair', '击破敌舰', `${run.stats.kills} / 4`]].map(([glyph, title, value]) => `<div>${icon(glyph)}<span>${title}</span><b>${value}</b></div>`).join('')}</div><div class="earned-coins">${icon('diamond')} 远征金币 <b>+${run.coins}</b><span>已收入星舰</span></div>${btn('retry', `再次启航 ${icon('arrow')}`)}<div class="result-actions">${btn('share', `${icon('log')} 复制战绩`, 'secondary')}${btn('home', '返回大厅', 'secondary')}</div><p class="quiet-note">${result.won ? '没有永远的最优解，只有属于你的下一条星轨。' : '试试保留星轨爆发，并在补给站修复舰体。'}</p></main>`;
}
function codexView() {
  const visible = CARDS.filter(c => filter === '全部' || c.type === filter);
  return `<main class="library-page">${pageHeader('THE CARD ARCHIVE', '卡牌图鉴')}<div class="library-heading"><p>17 张基础牌，无限种星轨</p><span>全部可在远征中使用</span></div><div class="filter-tabs" aria-label="卡牌类型">${['全部', '生产', '攻击', '调度', '项目', '工坊', '周期'].map(type => `<button data-action="filter" data-filter="${type}" class="${filter === type ? 'active' : ''}">${type}</button>`).join('')}</div><div class="codex-grid">${visible.map(c => `<button class="codex-card" data-action="card-detail" data-id="${c.id}"><div><span>#${String(c.id).padStart(2, '0')}</span>${icon(c.symbol)}</div><img src="${art(c.art)}" alt="${c.name}" loading="lazy"><strong>${c.name}</strong><small>${c.type}牌</small></button>`).join('')}</div>${nav('codex')}</main>`;
}
function recordsView() {
  const daily = dailyInfo();
  const records = profile.records.filter(r => recordFilter !== 'daily' || r.mode === 'daily' && r.challengeDate === daily.date).sort((a, b) => b.score - a.score);
  return `<main class="records-page">${pageHeader('YOUR JOURNEY, REMEMBERED', '航行战绩')}<div class="record-summary">${icon('trophy')}<div><span>已突破星域</span><b>${profile.wins}<small> 次</small></b></div><div><span>最佳远征</span><b>${number(Math.max(0, ...profile.records.map(r => r.score)))}</b></div></div><div class="filter-tabs"><button data-action="record-filter" data-filter="all" class="${recordFilter === 'all' ? 'active' : ''}">远征记录</button><button data-action="record-filter" data-filter="daily" class="${recordFilter === 'daily' ? 'active' : ''}">今日挑战</button></div><p class="local-record-note">${icon('log')} 本机战绩 · 保留最近 40 次航行</p><div class="records-list">${records.length ? records.map((r, i) => `<article class="record-row"><span class="rank">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(regionName(r.region))}${r.mode === 'daily' ? '<small class="daily-tag">每日</small>' : ''}</strong><span>${esc(recordDate(r.date))} · ${time(r.elapsed)} · ${r.combo} 连击</span></div><div><b>${number(r.score)}</b><small>${esc(r.grade)}</small></div></article>`).join('') : `<div class="empty-state">${icon('compass')}<h2>星图还在等待第一条航线</h2><p>完成一次${recordFilter === 'daily' ? '今日挑战' : '远征'}，你的战绩就会留在这里。</p>${btn(recordFilter === 'daily' ? 'daily' : 'regions', '出发，留下你的星轨')}</div>`}</div>${nav('records')}</main>`;
}
function render() {
  skin(); finishRun();
  app.innerHTML = `<div class="app-shell">${page === 'home' ? homeView() : page === 'codex' ? codexView() : page === 'records' ? recordsView() : run?.phase === 'reward' ? rewardView() : run?.phase === 'supply' ? supplyView() : ['victory', 'defeat'].includes(run?.phase) ? resultView() : run ? battleView() : homeView()}</div>`;
  document.body.classList.toggle('in-battle', page === 'battle' && run?.phase === 'battle');
  if (run?.pending && page === 'battle') {
    if (modal?.kind !== 'pending') { modal = { kind: 'pending' }; selected = []; sortOrder = [...(run.pending.candidates || [])]; }
  }
  renderModal();
}
function showModal(kind, options = {}) {
  lastFocus = document.activeElement; modal = { kind, ...options }; renderModal();
  requestAnimationFrame(() => modalRoot.querySelector('button:not([disabled])')?.focus({ preventScroll: true }));
}
function closeModal() {
  if (run?.pending && modal?.kind === 'pending') { run = dispatch(run, { type: 'cancel' }); save(); }
  modal = null; renderModal(); lastFocus?.isConnected && lastFocus.focus({ preventScroll: true });
}
function miniRow(c, suffix = '') {
  const def = CARD_BY_ID[c.type];
  return `<img src="${art(def.art)}" alt=""><div class="mini-card-copy"><small>#${String(def.id).padStart(2, '0')} · ${def.type}${c.temporary ? ' · 临时' : ''}</small><strong>${def.name}${c.upgrade ? ` <em>+${c.upgrade}</em>` : ''}</strong></div>${suffix}`;
}
function pendingContent() {
  const p = run.pending;
  const titles = { sort: '调度下一段星轨', probe: '选择探测目标', relay: '接回深位卡牌', upgrade: '强化你的生产线', store: '为关键时刻留一张牌' };
  let inner = '';
  if (p.kind === 'sort') {
    inner = `<p class="modal-intro">已选${p.depth === 'deep' ? '深位' : '浅位'} · 预览顶部 ${p.candidates.length} 张牌</p><div class="steps"><span>✓ 选择归位</span><b>2 预览排序</b><span>3 确认</span></div><p class="sort-hint">从上到下依次抽取。拖动手柄，或点箭头调整。</p><div class="sort-list">${sortOrder.map((uid, i) => { const c = run.deck.find(c => c.uid === uid); return `<div class="sort-row" data-sort-row="${uid}"><span class="sort-number">${i + 1}</span>${miniRow(c)}<div class="sort-arrows"><button data-action="sort-up" data-uid="${uid}" aria-label="上移${CARD_BY_ID[c.type].name}" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-action="sort-down" data-uid="${uid}" aria-label="下移${CARD_BY_ID[c.type].name}" ${i === sortOrder.length - 1 ? 'disabled' : ''}>${icon('down')}</button></div><span class="drag-handle" data-drag="${uid}" aria-hidden="true">${icon('grip')}</span></div>`; }).join('')}</div>${btn('confirm-pending', `确认顺序 ${icon('check')}`)}`;
  } else if (p.kind === 'probe') {
    inner = `<p class="modal-intro">探测器已锁定两条航线，选择一种收益。</p><div class="supply-options"><button data-action="probe" data-choice="fuel">${icon('flame')}<span><strong>采集燃素</strong><small>燃素 +2，下张牌额外行动</small></span>${icon('chevron')}</button><button data-action="probe" data-choice="attack">${icon('crosshair')}<span><strong>锁定弱点</strong><small>造成 6 伤害，下张牌额外行动</small></span>${icon('chevron')}</button></div>`;
  } else {
    inner = `<p class="modal-intro">${p.kind === 'relay' ? '从底部卡牌中选 1 张，它将成为下一张牌。' : p.kind === 'upgrade' ? `选择 ${p.min}～${p.max} 张生产牌，强化仅本局生效。` : `选择 ${p.min}～${p.max} 张牌暂存，随后从底栏「仓库」取出。`}</p><div class="select-card-list">${p.candidates.map(uid => { const c = run.deck.find(c => c.uid === uid); return `<button class="select-card ${selected.includes(uid) ? 'selected' : ''}" data-action="select-card" data-uid="${uid}" aria-pressed="${selected.includes(uid)}">${miniRow(c)}<span class="selection-circle">${selected.includes(uid) ? icon('check') : ''}</span></button>`; }).join('')}</div>${btn('confirm-pending', `确认选择 <small>${selected.length} / ${p.max}</small>`, 'primary', selected.length < p.min ? 'disabled' : '')}`;
  }
  return `<span class="eyebrow">CARD RESOLUTION</span><h2>${titles[p.kind]}</h2>${inner}`;
}
function modalContent() {
  const kind = modal.kind;
  if (kind === 'pending') return pendingContent();
  if (kind === 'regions') return `<span class="eyebrow">CHOOSE YOUR DESTINATION</span><h2>下一站，哪片星海</h2><p class="modal-intro">一次远征，五个节点。所有基础卡牌均可使用。</p><div class="region-list">${REGIONS.map(r => `<button class="region-option ${selectedRegion === r.id ? 'selected' : ''}" data-action="select-region" data-region="${r.id}" aria-pressed="${selectedRegion === r.id}"><img src="${art(r.art)}" alt=""><div><span>${r.english}</span><h3>${r.name}<small>${'✦'.repeat(r.stars)}</small></h3><p>${r.description}</p><small>${r.route}</small></div><i>${icon(selectedRegion === r.id ? 'check' : 'chevron')}</i></button>`).join('')}</div>${activeRun() ? '<p class="notice">开始新的远征会替换当前未完成的航程。</p>' : ''}${btn('start', `进入${regionName(selectedRegion)} ${icon('arrow')}`)}`;
  if (kind === 'daily') {
    const info = dailyInfo();
    const best = Math.max(0, ...profile.records.filter(r => r.mode === 'daily' && r.challengeDate === info.date).map(r => r.score));
    return `<span class="eyebrow">DAILY EXPEDITION / ${info.date}</span><h2>同一星空，全新挑战</h2><div class="daily-visual">${icon('compass')}<span>今日规则</span><h3>${info.rule.name}</h3><p>${info.rule.description}</p></div><div class="daily-details"><p><span>今日星域</span><strong>虚空矿带 · 五个节点</strong></p><p><span>公平种子</span><strong>SP-${info.date.replaceAll('-', '')}</strong></p><p><span>本机今日最佳</span><strong>${best ? number(best) : '等待你的第一次启航'}</strong></p></div><p class="modal-intro">同一天的初始牌序、敌人和奖励随机序列一致。每天北京时间 00:00 更新，可反复挑战。</p>${activeRun() ? '<p class="notice">开始挑战将替换当前未完成的远征。</p>' : ''}${btn('start-daily', `开始今日挑战 ${icon('arrow')}`)}`;
  }
  if (kind === 'help' || kind === 'tutorial') return `<span class="eyebrow">A NAVIGATOR'S FIELD GUIDE</span><h2>${kind === 'tutorial' ? '欢迎登舰，星旅者' : '掌握你的星位'}</h2><p class="modal-intro">每次使用一张牌，再决定它回到牌库的哪里。</p><div class="guide-list"><article><span class="guide-icon blue">${icon('up')}</span><div><h3>浅位归位 · 快速循环</h3><p>回到牌库第 3 张，星轨 +5。每连续 3 次浅位，追加 6 伤害。</p></div></article><article><span class="guide-icon gold">${icon('down')}</span><div><h3>深位归位 · 沉淀爆发</h3><p>回到牌库底部，星轨 +12。卡牌效果更强，但要更久才能再抽到。</p></div></article><article><span class="guide-icon violet">${icon('orbit')}</span><div><h3>星轨爆发 · 满能量释放</h3><p>100 星轨造成 60 基础伤害；自动消耗最多 3 燃素、2 星金，强化至 88 伤害。不推进敌方行动。</p></div></article><article><span class="guide-icon danger">${icon('crosshair')}</span><div><h3>观察敌人的下一步</h3><p>通常每 3 次出牌敌人行动一次。额外行动不推进倒计时；轨道周期额外推进 1 格。</p></div></article></div><div class="guide-footnote">项目卡消耗资源建造；资源不足可暂缓。调度牌可排序，仓库中的牌可随时取出。击败敌人后，选择只在本局生效的奖励。</div>${btn(kind === 'tutorial' ? 'tutorial-done' : 'close', kind === 'tutorial' ? '明白了，开始航行' : '回到星轨')}`;
  if (kind === 'settings') return `<span class="eyebrow">SHIP CONTROLS</span><h2>航行设置</h2><div class="settings-list">${[['sound', 'sound', '游戏音效', '出牌、爆发与胜利的声音'], ['haptics', 'signal', '触感反馈', '设备支持时，归位会轻微震动'], ['motion', 'orbit', '动态效果', '星轨流动、归位与爆发动画']].map(([key, glyph, title, desc]) => `<button data-action="toggle" data-setting="${key}" role="switch" aria-checked="${profile.settings[key]}">${icon(glyph)}<span><strong>${title}</strong><small>${desc}</small></span><i class="toggle ${profile.settings[key] ? 'on' : ''}"></i></button>`).join('')}</div><div class="settings-about"><span>星位 · STAR POSITION</span><p>浅位掌握节奏，深位积蓄锋芒。</p><small>进度自动保存在当前浏览器。</small></div>${btn('help', '查看航行指南', 'secondary')}`;
  if (kind === 'pause') return `<span class="eyebrow">FLIGHT PAUSED</span><h2>在星海中稍作停留</h2><p class="modal-intro">进度已保存，星舰在这里等你。</p><div class="pause-summary"><span>${regionName(run.region)}</span><b>${run.node + 1} / 5 节点</b><span>已航行 ${time(run.elapsed)}</span></div><div class="stack-buttons">${btn('close', `${icon('play')} 继续航行`)}${btn('settings', '航行设置', 'secondary')}${btn('home', '保存并返回大厅', 'secondary')}</div>`;
  if (kind === 'skins') return `<span class="eyebrow">THE LIGHT YOU LEAVE BEHIND</span><h2>选择你的星轨</h2><p class="modal-intro">外观只改变色彩与归位光效，三种星轨均可自由使用。</p><div class="skin-options">${[['gold', '黄金轨道', '恒星熔金，照亮前路'], ['violet', '深渊紫晶', '从黑暗中，唤醒微光'], ['ice', '量子蓝图', '精确计算，每一束星光']].map(([id, name, desc]) => `<button class="skin-option skin-${id} ${profile.skin === id ? 'selected' : ''}" data-action="skin" data-skin="${id}"><span class="skin-orbit">${icon('orbit')}</span><div><strong>${name}</strong><small>${desc}</small></div><span>${profile.skin === id ? icon('check') : '使用'}</span></button>`).join('')}</div>`;
  if (kind === 'deck') return `<span class="eyebrow">NEXT IN ORBIT</span><h2>牌库顺序 <small>${run.deck.length} 张</small></h2><p class="modal-intro">顶部先抽，底部后抽。浅位归位插入第 3 张。</p><div class="deck-list">${run.deck.map((c, i) => `<div class="mini-card-row"><span class="sort-number">${i + 1}</span>${miniRow(c)}</div>`).join('')}</div>`;
  if (kind === 'storage') return `<span class="eyebrow">COMPRESSED STORAGE</span><h2>压缩仓库 <small>${run.storage.length} / 2</small></h2><p class="modal-intro">取出的牌立即成为当前牌，并获得一次额外行动。原当前牌放回顶部。</p>${run.storage.length ? `<div class="select-card-list">${run.storage.map(c => `<button class="select-card" data-action="retrieve" data-uid="${c.uid}">${miniRow(c)}<span class="gold-text">取出</span></button>`).join('')}</div>` : `<div class="empty-state small">${icon('box')}<p>使用「压缩仓库」牌，暂存下一张关键牌。</p></div>`}`;
  if (kind === 'projects') return `<span class="eyebrow">BUILD WITHIN THE STARS</span><h2>项目与遗物</h2><div class="project-list">${CARDS.filter(c => c.type === '项目').map(c => `<div class="project-row">${icon(c.symbol)}<span><strong>${c.name}</strong><small>${c.base}</small></span><b>${run.projects[c.id] || 0} / ${c.stages || 1}</b></div>`).join('')}</div><h3 class="subheading">本局遗物</h3>${run.relics.length ? run.relics.map(key => `<div class="relic-info">${icon(RELICS[key].symbol)}<div><strong>${RELICS[key].name}</strong><p>${RELICS[key].description}</p></div></div>`).join('') : '<p class="modal-intro">击败敌人后，可选择星轨遗物作为奖励。</p>'}`;
  if (kind === 'logs') return `<span class="eyebrow">FLIGHT RECORDER</span><h2>行动日志</h2><ol class="action-log">${run.logs.map((text, i) => `<li><span>${i === 0 ? '刚刚' : String(i).padStart(2, '0')}</span><p>${esc(text)}</p></li>`).join('')}</ol>`;
  if (kind === 'card-detail') return `<span class="eyebrow">CARD ARCHIVE / ${String(modal.id).padStart(2, '0')}</span>${cardView({ type: modal.id, upgrade: 0 }, true)}<p class="card-lore">「${CARD_BY_ID[modal.id].intro}」</p>`;
  if (kind === 'share') return `<span class="eyebrow">EXPEDITION RECORD</span><h2>你的星轨战绩</h2><textarea class="share-text" readonly>${esc(modal.text)}</textarea><p class="modal-intro">长按选中文字，即可复制分享。</p>${btn('close', '完成')}`;
  return '';
}
function renderModal() {
  app.inert = !!modal;
  if (!modal) { modalRoot.innerHTML = ''; document.body.classList.remove('modal-open'); return; }
  document.body.classList.add('modal-open');
  modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop="true"><section class="modal-sheet ${modal.kind === 'card-detail' ? 'card-detail-sheet' : ''}" role="dialog" aria-modal="true" aria-label="${({ pending: '卡牌操作', regions: '选择星域', help: '航行指南', tutorial: '新手指引', settings: '航行设置', pause: '游戏暂停', daily: '每日挑战', deck: '牌库', storage: '仓库', projects: '项目与遗物', logs: '日志', skins: '星轨外观', 'card-detail': '卡牌详情', share: '战绩分享' })[modal.kind] || '星位'}"><div class="sheet-grip"></div>${closeButton()}${modalContent()}</section></div>`;
}
function effects(feedback, phaseBefore) {
  if (!feedback) return;
  sound(feedback.burst ? 'burst' : run.phase === 'reward' || run.phase === 'victory' ? 'win' : feedback.depth || 'tap');
  if (profile.settings.haptics && navigator.vibrate) navigator.vibrate(feedback.burst ? [30, 40, 60] : 12);
  if (feedback.burst && profile.settings.motion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const root = document.querySelector('#fx-root');
    root.innerHTML = `<div class="burst-fx"><div class="explosion-ring"></div><div class="explosion-ring second"></div><div class="burst-beam"></div><span>星轨爆发</span><b>${feedback.hit || ''}</b><small>STAR ORBIT UNLEASHED</small></div>`;
    setTimeout(() => { root.innerHTML = ''; }, 1100);
  } else if (feedback.hit && run.phase === 'battle') {
    const zone = document.querySelector('.enemy-zone');
    zone?.insertAdjacentHTML('beforeend', `<div class="damage-float">−${feedback.hit}<small>${feedback.broken ? '护盾击破' : feedback.combo ? `${feedback.combo} 连击` : feedback.depth === 'deep' ? '深位打击' : ''}</small></div>`);
    setTimeout(() => document.querySelector('.damage-float')?.remove(), 900);
  }
  if (run.phase === 'battle') document.querySelector('.playing-card')?.classList.add('card-arrive');
  if (feedback.hullHit) { document.querySelector('.app-shell')?.classList.add('hull-hit'); toast(`受到 ${feedback.hullHit} 舰体伤害`); }
  else if (feedback.title?.includes('资源不足') || feedback.title?.includes('仓库已满') || feedback.title?.includes('生产牌已满级')) toast(feedback.title);
}
function gameAction(action) {
  if (locked) return;
  const previousPhase = run.phase;
  try {
    const next = dispatch(run, action);
    locked = true; run = next; modal = null; save(); render(); effects(run.feedback, previousPhase);
    setTimeout(() => { locked = false; }, run.feedback?.burst ? 600 : 260);
  } catch (error) { toast(error.message); }
}
function start(mode = 'standard') {
  run = createRun({ mode, region: selectedRegion }); run.runId = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  storageWarning = ''; modal = null; page = 'battle'; lastTick = Date.now(); save(); render(); sound('win');
  if (!profile.tutorialSeen) showModal('tutorial');
}
async function copyScore() {
  const result = scoreRun(run);
  const text = `✦ 星位 · ${result.won ? '星域突破' : '星海远征'}\n${regionName(run.region)} · ${result.grade}\n得分 ${result.score} | 航行 ${time(run.elapsed)}\n最高连击 ${run.stats.combo} | 最高伤害 ${run.stats.biggestHit}\n浅位掌握节奏，深位积蓄锋芒。`;
  try { await navigator.clipboard.writeText(text); toast('战绩已复制'); }
  catch { showModal('share', { text }); }
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (['play', 'burst', 'confirm-pending', 'probe', 'reward', 'refresh', 'supply', 'retrieve'].includes(action) && locked) return;
  if (action === 'play') return gameAction({ type: 'play', depth: button.dataset.depth });
  if (action === 'burst') return gameAction({ type: 'burst' });
  if (action === 'reward') return gameAction({ type: 'reward', index: Number(button.dataset.index) });
  if (action === 'refresh') return gameAction({ type: 'refresh' });
  if (action === 'supply') return gameAction({ type: 'supply', choice: button.dataset.choice });
  if (action === 'retrieve') return gameAction({ type: 'retrieve', uid: button.dataset.uid });
  if (action === 'confirm-pending') return gameAction({ type: 'confirm', selection: run.pending.kind === 'sort' ? sortOrder : selected });
  if (action === 'probe') return gameAction({ type: 'confirm', selection: button.dataset.choice });
  sound();
  if (action === 'home') { modal = null; page = 'home'; save(); render(); }
  else if (action === 'continue') { page = 'battle'; modal = null; render(); }
  else if (action === 'close') closeModal();
  else if (action === 'regions') showModal('regions');
  else if (action === 'select-region') { selectedRegion = button.dataset.region; renderModal(); }
  else if (action === 'start') start();
  else if (action === 'start-daily') start('daily');
  else if (action === 'retry') { selectedRegion = run.region; start(run.mode); }
  else if (action === 'tutorial-done') { profile.tutorialSeen = true; save(); closeModal(); }
  else if (['help', 'settings', 'pause', 'daily', 'skins', 'deck', 'storage', 'projects', 'logs'].includes(action)) { if (action === 'pause') save(); showModal(action); }
  else if (action === 'codex' || action === 'records') { modal = null; page = action; render(); }
  else if (action === 'filter') { filter = button.dataset.filter; render(); }
  else if (action === 'record-filter') { recordFilter = button.dataset.filter; render(); }
  else if (action === 'card-detail') showModal('card-detail', { id: Number(button.dataset.id) });
  else if (action === 'toggle') { const key = button.dataset.setting; profile.settings[key] = !profile.settings[key]; skin(); save(); renderModal(); }
  else if (action === 'skin') { profile.skin = button.dataset.skin; skin(); save(); renderModal(); toast('星轨外观已装备'); }
  else if (action === 'sort-up' || action === 'sort-down') {
    const i = sortOrder.indexOf(button.dataset.uid), j = i + (action === 'sort-up' ? -1 : 1);
    if (j >= 0 && j < sortOrder.length) { [sortOrder[i], sortOrder[j]] = [sortOrder[j], sortOrder[i]]; renderModal(); }
  } else if (action === 'select-card') {
    const uid = button.dataset.uid;
    if (selected.includes(uid)) selected = selected.filter(id => id !== uid);
    else if (run.pending.max === 1) selected = [uid];
    else if (selected.length < run.pending.max) selected.push(uid);
    else toast(`最多选择 ${run.pending.max} 张牌`);
    renderModal();
  } else if (action === 'share') copyScore();
});

let drag = null;
document.addEventListener('pointerdown', event => {
  const handle = event.target.closest('[data-drag]');
  if (!handle || run?.pending?.kind !== 'sort') return;
  event.preventDefault();
  const row = handle.closest('[data-sort-row]');
  drag = { uid: handle.dataset.drag, over: handle.dataset.drag, startY: event.clientY, row, pointerId: event.pointerId };
  row.classList.add('dragging'); handle.setPointerCapture(event.pointerId);
});
document.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag.row.style.transform = `translateY(${event.clientY - drag.startY}px)`;
  const rows = [...modalRoot.querySelectorAll('[data-sort-row]')];
  const nearest = rows.filter(r => r !== drag.row).sort((a, b) => Math.abs(a.getBoundingClientRect().top + a.offsetHeight / 2 - event.clientY) - Math.abs(b.getBoundingClientRect().top + b.offsetHeight / 2 - event.clientY))[0];
  rows.forEach(r => r.classList.remove('drop-target'));
  if (nearest && Math.abs(event.clientY - drag.startY) > 20) { drag.over = nearest.dataset.sortRow; nearest.classList.add('drop-target'); } else drag.over = drag.uid;
});
document.addEventListener('pointerup', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const from = sortOrder.indexOf(drag.uid), to = sortOrder.indexOf(drag.over);
  if (from !== to && to >= 0) { const [uid] = sortOrder.splice(from, 1); sortOrder.splice(to, 0, uid); }
  drag = null; renderModal();
});
document.addEventListener('pointercancel', () => { if (drag) { drag = null; renderModal(); } });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal) closeModal();
  if (event.key === 'Tab' && modal) {
    const targets = [...modalRoot.querySelectorAll('button:not([disabled]),textarea')];
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && (document.activeElement === first || !modalRoot.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !modalRoot.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
  }
});
setInterval(() => {
  const now = Date.now(); const delta = Math.min(2, (now - lastTick) / 1000); lastTick = now;
  if (activeRun() && page === 'battle' && !document.hidden && (!modal || ['pending', 'deck', 'storage', 'projects', 'logs'].includes(modal.kind))) {
    const before = Math.floor(run.elapsed / 5); run.elapsed += delta;
    document.querySelectorAll('[data-clock]').forEach(el => { el.textContent = time(run.elapsed); });
    if (Math.floor(run.elapsed / 5) !== before) save();
  }
}, 1000);
document.addEventListener('visibilitychange', () => { lastTick = Date.now(); if (document.hidden) save(); });
window.addEventListener('pagehide', save);
render();
if (storageWarning) toast(storageWarning);
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('./sw.js').catch(() => {});
