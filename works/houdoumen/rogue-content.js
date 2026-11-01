'use strict';
window.FARM_ROGUE={
 starts:[
 {name:'轻装快种',desc:'资金 −30；每天体力 +1',money:-30,energy:1,health:0},
 {name:'满车物资',desc:'资金 +70；起始状态 −20',money:70,energy:0,health:-20},
 {name:'好苗开局',desc:'空地预种基础作物，生长 1；资金 −20',money:-20,energy:0,health:0,seeded:true},
 {name:'修整出发',desc:'起始状态 +15；初始重抽次数 +1',money:0,energy:0,health:15,reroll:1}
 ],
 cards:[
 {id:'r-replant',name:'循环播种',tag:'连作 · 核心',icon:'↻',desc:'每次收获后自动播下当前产区基础作物，照常扣播种资金、不耗额外体力；资金不足留空。',stat:'replant',value:1},
 {id:'r-sprout',name:'快速出苗',tag:'连作 · 组合',icon:'♧',desc:'基础作物播种时生长 +1；自动补种也生效。',stat:'growth',value:1},
 {id:'r-care',name:'精细照料',tag:'照料 · 核心',icon:'✦',desc:'照料一次生长 +2；照料过的作物直售额外 +15。',stat:'care',value:1},
 {id:'r-chain',name:'收割接力',tag:'连收 · 核心',icon:'⌁',desc:'每天第 3、6、9…次收获各返还 1 体力。入库也算收获。',stat:'chain',value:1},
 {id:'r-fragile',name:'轻装冲刺',tag:'风险 · 劳作',icon:'ϟ',desc:'每天体力 +2，但每日状态额外损失 6。',stat:'energy',value:2,drain:6},
 {id:'r-premium',name:'精品直售',tag:'风险 · 经营',icon:'◈',desc:'所有作物直售 +30；所有播种费用 +6。',stat:'sell',value:30,plantTax:6},
 {id:'r-compost',name:'收获回养',tag:'守护 · 连收',icon:'♡',desc:'每次收获恢复 3 状态；所有作物直售收入 −5。',stat:'regenHarvest',value:3,saleTax:5},
 {id:'r-contract',name:'订单回流',tag:'订单 · 核心',icon:'▣',desc:'交付订单恢复 1 体力，每日最多触发 2 次。',stat:'orderEnergy',value:1,orders:true},
 {id:'r-reserve',name:'整箱分拣',tag:'仓储 · 核心',icon:'▥',desc:'每日首次收获入库额外获得 1 份原料；所有直售收入 −8。',stat:'reserveExtra',value:1,saleTax:8,orders:true},
 {id:'r-engineer',name:'施工余料',tag:'基建 · 核心',icon:'⚒',desc:'每次建设设施或完成工程阶段，恢复 8 状态并使一块未成熟作物生长 +1。',stat:'buildCare',value:1},
 {id:'r-travel',name:'回程补给',tag:'走访 · 核心',icon:'↗',desc:'每次走访返回时恢复 12 状态，额外获得 1 点信誉。',stat:'returnCare',value:1,routes:true}
 ],
 jobs:[
 {id:'tend',name:'田间照料',desc:'选中一块未成熟田，使其生长 +1',special:'精细照料：生长 +2'},
 {id:'repair',name:'驻地补给',desc:'恢复 10 状态',special:'补给专长：恢复 18 状态'},
 {id:'trade',name:'整理货物',desc:'获得 15 资金',special:'经营专长：获得 25 资金'}
 ],
 challenges:{
 1:[{id:'harvest',name:'抢收窗口',metric:'harvest',target:5},{id:'plant',name:'复种试验',metric:'plant',target:5}],
 2:[{id:'reserve',name:'备货冲刺',metric:'reserve',target:4},{id:'order',name:'展销冲刺',metric:'order',target:2,min:8},{id:'harvest',name:'鲜货抢收',metric:'harvest',target:5}],
 3:[{id:'trip',name:'产区接力',metric:'trip',target:2,min:4},{id:'order',name:'联销冲刺',metric:'order',target:2,min:8},{id:'plant',name:'试种行动',metric:'plant',target:5}],
 4:[{id:'build',name:'工程会战',metric:'build',target:2,min:4},{id:'rose',name:'沙地收成',metric:'rose',target:4,min:8},{id:'harvest',name:'雨林采收',metric:'harvest',target:5}]
 },
 metricNames:{harvest:'收获',plant:'播种',reserve:'入库收获',order:'订单',trip:'派队',build:'建设阶段',rose:'和田收获'}
};
for(const pack of Object.values(window.FARM_SEASONS))pack.perks.push(...window.FARM_ROGUE.cards.filter(p=>(!p.orders||pack.orders.length)&&(!p.routes||pack.routes)).map(p=>({...p})));
