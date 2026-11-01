'use strict';
window.FARM_CONTENT = {
  season: 1, title: '从泥地到丰收', days: 12, moneyGoal: 360, harvestGoal: 12,
  chapters: [
    {name:'抢收水稻',sub:'先在泥地里站稳脚跟',label:'初来后陡门'},
    {name:'扎根过冬',sub:'开沟、播麦，建起自己的家',label:'把希望种下去'},
    {name:'各自耕耘',sub:'玫瑰、羊舍，忙碌的春天',label:'春天有了回信'},
    {name:'麦田回响',sub:'收割小麦，奔赴农夫集市',label:'等到了这一片金黄'}
  ],
  leaders: [
    {name:'蒋敦豪',role:'养殖守护',desc:'羊舍每日收入额外 +8',key:'sheep'},
    {name:'鹭卓',role:'玫瑰匠人',desc:'每次玫瑰收获额外 +18',key:'rose'},
    {name:'李耕耘',role:'基建能手',desc:'修缮恢复额外 +12，基建便宜 10',key:'build'},
    {name:'李昊',role:'经营记录',desc:'每次收获额外 +5',key:'sell'},
    {name:'赵一博',role:'流程优化',desc:'每天体力上限 +1',key:'energy'},
    {name:'卓沅',role:'种植专长',desc:'播种小麦费用从 6 降至 2',key:'plant'},
    {name:'赵小童',role:'踏实劳作',desc:'每天体力上限 +1',key:'energy'},
    {name:'何浩楠',role:'农机搭档',desc:'稻谷与小麦收获额外 +8',key:'grain'},
    {name:'陈少熙',role:'水产探索',desc:'建好水塘后每日收入额外 +8',key:'pond'},
    {name:'王一珩',role:'元气补给',desc:'每天农场状态恢复 +4',key:'health'}
  ],
  perks: [
    {id:'sickle',name:'磨亮的镰刀',tag:'收获流',icon:'⌁',desc:'所有稻谷、小麦收获收入 +12。',stat:'grain',value:12},
    {id:'boots',name:'不怕泥的靴子',tag:'劳作流',icon:'↟',desc:'每天体力上限 +2，立即恢复 2 点。',stat:'energy',value:2},
    {id:'rose',name:'玫瑰养护笔记',tag:'花卉流',icon:'❀',desc:'玫瑰每次收获收入 +25。',stat:'rose',value:25},
    {id:'feed',name:'科学配比饲料',tag:'养殖流',icon:'♧',desc:'羊舍每天收入 +12。',stat:'sheep',value:12},
    {id:'channel',name:'排水沟的智慧',tag:'基建流',icon:'≋',desc:'恶劣天气造成的农场损耗减少 10。',stat:'shield',value:10},
    {id:'stall',name:'我们的摊位',tag:'经营流',icon:'▥',desc:'所有作物每次收获收入 +8。',stat:'sell',value:8},
    {id:'seed',name:'一袋好种子',tag:'种植流',icon:'✦',desc:'小麦和玫瑰播种费用减少 4。',stat:'discount',value:4},
    {id:'meal',name:'热腾腾的一餐',tag:'守护流',icon:'◡',desc:'每天农场状态恢复 +6。',stat:'regen',value:6},
    {id:'pond',name:'水塘增氧机',tag:'水产流',icon:'≈',desc:'水塘每天收入 +12。',stat:'pond',value:12},
    {id:'fertilizer',name:'雨夜搬来的肥',tag:'种植流',icon:'♧',desc:'小麦播种后直接进入生长期。',stat:'growth',value:1},
    {id:'tools',name:'修修补补工具箱',tag:'基建流',icon:'⚒',desc:'修缮费用减少 10，恢复状态额外 +10。',stat:'repair',value:10},
    {id:'friends',name:'十个人一条心',tag:'劳作流',icon:'∞',desc:'体力上限 +1；每日农场状态恢复 +3。',stat:'team',value:1}
  ],
  events: [
    {title:'雨夜的三十吨肥料',text:'有机肥运到门口。灯亮着，大家还在等你的决定。',choices:[{text:'一起扛！',detail:'状态 −8，资金 +30',health:-8,money:30},{text:'租一辆搬运车',detail:'资金 −15，状态 +8',money:-15,health:8}]},
    {title:'拖拉机陷进了泥里',text:'轮胎越转越深。先救机器，还是先抢这一片稻？',choices:[{text:'垫木板一起推',detail:'状态 −10，资金 +25',health:-10,money:25},{text:'请老师傅帮忙',detail:'资金 −12，状态 +5',money:-12,health:5}]},
    {title:'田埂上的一碗热面',text:'忙完半天，厨房里飘出了香味。坐下来，好好吃一顿。',choices:[{text:'大家一起吃',detail:'状态 +16',health:16},{text:'打包送去集市',detail:'资金 +22',money:22}]},
    {title:'玫瑰开出了第一朵',text:'大棚里的花有了颜色，也有人来问能不能预订。',min:4,choices:[{text:'接下这笔订单',detail:'资金 +32，状态 −6',money:32,health:-6},{text:'留给院子里的晚饭',detail:'状态 +14',health:14}]},
    {title:'羊棚传来咩咩声',text:'今晚需要多一双眼睛照看小羊。谁都不想错过新生命。',min:4,choices:[{text:'轮流守夜',detail:'状态 −8，资金 +28',health:-8,money:28},{text:'完善保温设施',detail:'资金 −15，状态 +10',money:-15,health:10}]},
    {title:'农夫集市发来邀请',text:'把自己的收成摆上摊位，和来往的人讲讲这块地。',min:7,choices:[{text:'带上最好的收成',detail:'资金 +38，状态 −8',money:38,health:-8},{text:'先把农场照顾好',detail:'状态 +12',health:12}]},
    {title:'邻居送来经验',text:'老师傅沿着田埂走了一圈，指了指排水沟。',choices:[{text:'边学边整修',detail:'资金 −10，状态 +18',money:-10,health:18},{text:'帮邻居收一垄菜',detail:'资金 +18，状态 +3',money:18,health:3}]},
    {title:'院子里的小小音乐会',text:'天黑下来，工具放在墙边。有人抱起了吉他。',choices:[{text:'今晚一起唱',detail:'状态 +15',health:15},{text:'整理收成再加入',detail:'资金 +16，状态 +5',money:16,health:5}]}
  ],
  weather: [{name:'晴朗',icon:'☀',desc:'适合下地',damage:0},{name:'微雨',icon:'☂',desc:'雨润作物 · 生长 +1',damage:0,growth:1},{name:'连阴雨',icon:'☁',desc:'农场状态 −12',damage:12},{name:'大风',icon:'≋',desc:'农场状态 −8',damage:8}],
};
