export const CARDS = [
  { id: 1, name: '燃料采集船', type: '生产', art: 'fuelship', symbol: 'flame', intro: '穿过星云，收集下一次跃迁的燃料。', base: '采集燃素，为大型项目储备能源。', shallow: '+3 燃素，造成 2 伤害', deep: '+5 燃素，额外 +10 星轨' },
  { id: 2, name: '活质培育舱', type: '生产', art: 'biopod', symbol: 'leaf', intro: '在寂静的深空里，生命仍然生长。', base: '培育活质，维持星舰与护盾。', shallow: '+3 活质，获得 6 护盾', deep: '+5 活质，复制一张临时采集船' },
  { id: 3, name: '星金提炼厂', type: '生产', art: 'relic', symbol: 'diamond', intro: '恒星的余烬，凝成纯粹的力量。', base: '提炼星金，供项目与星轨爆发使用。', shallow: '+1 星金，+1 燃素', deep: '+3 星金，造成 8 伤害' },
  { id: 4, name: '星矛齐射', type: '攻击', art: 'lances', symbol: 'crosshair', intro: '瞄准。让星光成为你的锋刃。', base: '向敌舰发射一轮星矛。', shallow: '造成 12 伤害', deep: '造成 18 伤害' },
  { id: 5, name: '恒星收集器', type: '攻击', art: 'collector', symbol: 'sun', intro: '借一颗恒星的光，照亮前路。', base: '造成伤害，同时回收燃料。', shallow: '5 伤害，+1 燃素，下张牌额外行动', deep: '12 伤害，+1 燃素，+1 星金' },
  { id: 6, name: '深空探测器', type: '攻击', art: 'cruiser', symbol: 'radar', intro: '未知并非空无，只是尚未抵达。', base: '探测资源，或锁定敌方坐标。', shallow: '选择 +2 燃素或 6 伤害；额外行动', deep: '造成 10 伤害，+1 星金' },
  { id: 7, name: '轨道计算器', type: '调度', art: 'computer', symbol: 'orbit', intro: '每一次精确归位，都在改写未来。', base: '查看牌库顶部，自由调整抽牌顺序。', shallow: '查看并重排顶部 4 张牌', deep: '查看并重排顶部 5 张牌' },
  { id: 8, name: '引力弹弓', type: '调度', art: 'planet', symbol: 'orbit', intro: '借引力转向，向下一片星空加速。', base: '在牌库顶部与底部之间移动卡牌。', shallow: '将顶部 2 张牌送往底部', deep: '将底部 1 张牌提到顶部' },
  { id: 9, name: '中继站', type: '调度', art: 'portal', symbol: 'signal', intro: '遥远星域的信号，终于在此相遇。', base: '从深位接回一张牌，下张牌额外行动。', shallow: '将底部 1 张牌提到顶部', deep: '从底部 2 张牌中选 1 张置顶' },
  { id: 10, name: '紧急信号', type: '调度', art: 'computer', symbol: 'signal', intro: '重新分配航线，还来得及。', base: '调度最近归位的卡牌。', shallow: '召回最近一张归位牌，获得 4 护盾', deep: '将近期浅位牌沉底，每张 +8 星轨' },
  { id: 11, name: '空间站核心', type: '项目', art: 'portal', symbol: 'hex', cost: { fuel: 4, bio: 3 }, once: true, intro: '点亮核心，建立你的深空据点。', base: '消耗 4 燃素、3 活质；本局建造一次。', shallow: '造成 24 伤害，获得 18 护盾', deep: '造成 36 伤害，获得 24 护盾' },
  { id: 12, name: '跃迁引擎', type: '项目', art: 'fuelship', symbol: 'rocket', cost: { bio: 3, gold: 2 }, stages: 3, intro: '跨过引力的边界，跃入下一片星海。', base: '每阶段消耗 3 活质、2 星金，最多 3 阶段。', shallow: '推进 1 阶段，+25 星轨，额外行动', deep: '推进 1 阶段，+40 星轨，造成 15 伤害' },
  { id: 13, name: '生态穹顶', type: '项目', art: 'biopod', symbol: 'shield', cost: { fuel: 5, bio: 2 }, once: true, intro: '给漂泊的旅人，一片可呼吸的天空。', base: '消耗 5 燃素、2 活质；本局建造一次。', shallow: '恢复 28 舰体，获得 12 护盾', deep: '恢复 40 舰体，获得 20 护盾' },
  { id: 14, name: '戴森球蓝图', type: '项目', art: 'dyson', symbol: 'sun', cost: { gold: 2, any: 3 }, once: true, intro: '将整颗恒星，握在你的掌心。', base: '消耗 2 星金及 3 任意资源；本局建造一次。', shallow: '造成 45 伤害，+25 星轨', deep: '造成 65 伤害，+45 星轨' },
  { id: 15, name: '升级模块', type: '工坊', art: 'upgrade', symbol: 'hex', intro: '微小的改进，让长途航行成为可能。', base: '提升生产牌产出，仅在本次远征生效。', shallow: '选择 1 张生产牌，强化 +2', deep: '选择最多 3 张生产牌，各强化 +1' },
  { id: 16, name: '压缩仓库', type: '工坊', art: 'dyson', symbol: 'box', intro: '把最重要的东西，留给关键的时刻。', base: '暂存牌库中的牌，可从底栏取出使用。', shallow: '暂存 1～2 张牌，仓库最多 2 张', deep: '暂存 1 张牌，并强化 +1' },
  { id: 17, name: '轨道周期', type: '周期', art: 'planet', symbol: 'clock', intro: '星体永不停转。决策，也需要代价。', base: '敌方行动倒计时额外推进 1 格。', shallow: '+2 燃素，获得 5 护盾', deep: '+1 星金，额外 +15 星轨' },
];
export const CARD_BY_ID = Object.fromEntries(CARDS.map(card => [card.id, card]));
export const REGIONS = [
  { id: 'ring', name: '新手星环', english: 'THE FIRST ORBIT', difficulty: '标准', stars: 1, hp: .82, attack: .85, shield: 1, art: 'flagship', description: '从这里启航。熟悉浅位循环与深位爆发。', route: '均衡构筑 · 5 个节点' },
  { id: 'void', name: '虚空矿带', english: 'THE VOID BELT', difficulty: '进阶', stars: 2, hp: 1, attack: 1, shield: 1.4, art: 'computer', description: '穿越矿带，击破层层护盾，回收星金。', route: '资源调度 · 5 个节点' },
  { id: 'abyss', name: '深渊星域', english: 'INTO THE ABYSS', difficulty: '困难', stars: 3, hp: 1.22, attack: 1.15, shield: 1.3, art: 'abyss', description: '引力正在坍缩。为星核的最后一击蓄力。', route: '深位爆发 · 5 个节点' },
];
export const ENEMIES = [
  { name: '虚空哨卫', subtitle: 'VOID SENTINEL', hp: 72, shield: 10, power: 9, art: 'sentinel', kind: '遭遇' },
  { name: '游荡掠夺者', subtitle: 'STAR MARAUDER', hp: 96, shield: 12, power: 11, art: 'sentinel', kind: '遭遇', hue: '35deg' },
  { name: '失控采掘机', subtitle: 'ROGUE EXTRACTOR', hp: 88, shield: 24, power: 10, art: 'sentinel', kind: '遭遇', hue: '280deg' },
  { name: '引力执政官', subtitle: 'GRAVITY ARCHON', hp: 154, shield: 28, power: 15, art: 'abyss', kind: '精英' },
  { name: '深渊星核', subtitle: 'THE ABYSS CORE', hp: 320, shield: 42, power: 19, art: 'abyss', kind: 'BOSS' },
];
export const RELICS = {
  lens: { name: '浅轨透镜', description: '每连续 3 次浅位归位，连击追加伤害从 6 提高到 16。', symbol: 'radar', art: 'computer' },
  crucible: { name: '深空坩埚', description: '每次深位归位，额外获得 5 星轨。', symbol: 'hex', art: 'relic' },
  echo: { name: '星金回响', description: '每累计获得 3 星金，攻击牌永久 +2 伤害，本局有效。', symbol: 'diamond', art: 'relic' },
  compass: { name: '引力指南针', description: '每场战斗的第一次轨道计算器，额外预览 1 张牌。', symbol: 'compass', art: 'computer' },
};
export const DAILY_RULES = [
  { id: 'deep', name: '深空回响', description: '每次深位归位，额外获得 6 星轨。' },
  { id: 'quick', name: '快速通道', description: '每次浅位归位，追加 3 伤害。' },
  { id: 'gold', name: '星金狂潮', description: '每次使用生产牌，额外获得 1 星金。' },
];
export function dateKey() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
export function hashSeed(text) {
  let seed = 2166136261;
  for (const char of String(text)) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return seed >>> 0;
}
export function dailyInfo(date = dateKey()) {
  const seed = hashSeed(`xingwei-${date}`);
  return { date, seed, rule: DAILY_RULES[seed % DAILY_RULES.length] };
}
