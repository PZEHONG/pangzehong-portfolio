'use strict';
// Season-specific data; the shared engine selects exactly one content pack per run.
(() => {
const first=window.FARM_CONTENT;
Object.assign(first,{
 label:'第一季', cover:['从泥地','到丰收'], description:'把日子种进土里，等一场属于我们的麦浪。',
 source:'https://www.iq.com/album/1w4tnn48280',
 crops:{rice:{name:'水稻',asset:'rice',price:25,plant:null,kind:'grain'},wheat:{name:'小麦',asset:'wheat',price:32,plant:6,kind:'grain'},rose:{name:'玫瑰',asset:'rose',price:55,plant:14,kind:'rose',needs:'greenhouse'}},
 initial:['rice','rice','rice','rice','empty','empty'], money:80, intro:'从抢收水稻到麦浪翻涌，在随机的天气里，种出自己的答案。',
 opening:'到了后陡门。先把四块稻田收下来。', mapLabel:'后陡门 · 142.8 亩的故事',
 facilities:{greenhouse:{name:'玫瑰大棚',asset:'greenhouse',description:'搭好大棚后，所有空地解锁玫瑰种植。玫瑰基础收获收入 55。'},sheep:{name:'羊舍',asset:'sheep'},pond:{name:'水塘',asset:'greenhouse'},canal:{name:'排水沟',asset:'wheat',description:'开沟排水，恶劣天气造成的农场状态损耗减少 8。'}}, orders:[]
});
const second={
 season:2,label:'第二季',title:'把田野做大',cover:['把田野','做大'],description:'从一份收成，到一份自己的产品。',
 days:16,moneyGoal:600,harvestGoal:16,orderGoal:2,money:120,
 source:'https://www.iq.com/album/种地吧第2季-2024-1ob6ur0upnl?lang=zh_cn',
 intro:'草莓红了，郁金香开了。养蜂、养虾，把田里的收成做成自己的产品。',
 opening:'回到后陡门。先收成熟的小麦，第 4 天建设大棚、蜂箱和虾塘。',
 mapLabel:'后陡门 · 新产业，新一季',initial:['wheat','wheat','wheat','wheat','empty','empty'],
 chapters:[{name:'重返后陡门',sub:'整地播种，筹备新产业',label:'这一次，把田野做大'},{name:'花果与虾塘',sub:'草莓、郁金香与小龙虾',label:'田野里，有了新颜色'},{name:'从收成到产品',sub:'摇蜜、加工，准备自己的产品',label:'让收成有新的模样'},{name:'爱侬日开市',sub:'完成订单，把好产品带出田野',label:'把这一季，交到你手里'}],
 crops:{wheat:{name:'小麦',asset:'wheat',price:32,plant:6,kind:'grain'},strawberry:{name:'草莓',asset:'s2/strawberry',price:48,plant:12,kind:'fruit',needs:'greenhouse'},tulip:{name:'郁金香',asset:'s2/tulip',price:52,plant:16,kind:'flower',needs:'greenhouse'}},
 facilities:{greenhouse:{name:'花果大棚',asset:'greenhouse',description:'建成后解锁草莓与郁金香。成熟后可卖出，或留作订单原料。'},sheep:{name:'蜂箱',asset:'s2/beehive',description:'建成次日起每天收集 1 份蜂蜜；草莓酱订单需要蜂蜜。蜂蜜不会自动换成资金。'},pond:{name:'小龙虾塘',asset:'s2/crayfish',description:'建成次日起每天收集 1 份小龙虾；积攒 2 份可做鲜虾订单。原料不会自动换成资金。'},canal:{name:'排水防逃沟',asset:'s2/crayfish',description:'开沟排水与防逃维护，恶劣天气损耗减少 8。'}},
 leaders:first.leaders.map(l=>({...l})),
 weather:[{name:'晴朗',icon:'☀',desc:'适合下地',damage:0},{name:'春雨',icon:'☂',desc:'雨润作物 · 生长 +1',damage:0,growth:1},{name:'雷雨',icon:'☁',desc:'农场状态 −14',damage:14},{name:'闷热',icon:'≋',desc:'农场状态 −10',damage:10}],
 orders:[{id:'jam',name:'草莓酱试制订单',asset:'s2/jam',recipe:{strawberry:2,honey:1},price:220,unlock:8},{id:'bouquet',name:'郁金香花束订单',asset:'s2/tulip',recipe:{tulip:2},price:180,unlock:8},{id:'crayfish',name:'鲜活小龙虾订单',asset:'s2/crayfish',recipe:{crayfish:2},price:150,unlock:8}],
 goods:{wheat:'小麦',strawberry:'草莓',tulip:'郁金香',honey:'蜂蜜',crayfish:'小龙虾'},
 perks:[
 {id:'s2-boots',name:'新一季的工装',tag:'劳作流',icon:'↟',desc:'每天体力上限 +2，立即恢复 2 点。',stat:'energy',value:2},
 {id:'s2-fruit',name:'草莓养护笔记',tag:'果园流',icon:'♧',desc:'草莓直接卖出的收入 +20。',stat:'fruit',value:20},
 {id:'s2-flower',name:'鲜花包装课',tag:'花卉流',icon:'❀',desc:'郁金香直接卖出的收入 +22。',stat:'flower',value:22},
 {id:'s2-bees',name:'摇蜜初体验',tag:'养蜂流',icon:'✦',desc:'蜂箱每日额外产出 1 份蜂蜜。',stat:'honey',value:1},
 {id:'s2-cray',name:'水草养护笔记',tag:'水产流',icon:'≈',desc:'虾塘每日额外产出 1 份小龙虾。',stat:'crayfish',value:1},
 {id:'s2-net',name:'防逃网加固',tag:'基建流',icon:'≋',desc:'恶劣天气的农场损耗减少 10。',stat:'shield',value:10},
 {id:'s2-jam',name:'草莓酱试吃会',tag:'加工流',icon:'◈',desc:'每个加工订单收入额外 +40。',stat:'order',value:40},
 {id:'s2-brand',name:'自己的产品包装',tag:'经营流',icon:'▥',desc:'每个加工订单收入额外 +25。',stat:'order',value:25},
 {id:'s2-seed',name:'一起挑好种苗',tag:'种植流',icon:'♧',desc:'所有作物播种费用减少 4。',stat:'discount',value:4},
 {id:'s2-meal',name:'大棚里的聚餐',tag:'守护流',icon:'◡',desc:'每天农场状态恢复 +6。',stat:'regen',value:6},
 {id:'s2-tools',name:'自制撒肥工具',tag:'种植流',icon:'⚒',desc:'小麦播种后直接进入生长期。',stat:'growth',value:1},
 {id:'s2-market',name:'卖菜练出的口才',tag:'经营流',icon:'▥',desc:'所有作物直接卖出的收入 +8。',stat:'sell',value:8},
 {id:'s2-team',name:'新农人，一起走',tag:'劳作流',icon:'∞',desc:'每天体力上限 +1，状态恢复 +3。',stat:'team',value:1},
 {id:'s2-repair',name:'工具间扩建',tag:'基建流',icon:'⚒',desc:'修缮便宜 10，恢复状态额外 +10。',stat:'repair',value:10},
 {id:'s2-grain',name:'熟练的收割手',tag:'收获流',icon:'⌁',desc:'小麦直接卖出的收入 +12。',stat:'grain',value:12},
 {id:'s2-care',name:'精细分工表',tag:'劳作流',icon:'↟',desc:'每天体力上限 +1，立即恢复 1 点。',stat:'energy',value:1},
 {id:'s2-regrow',name:'给土地的耐心',tag:'守护流',icon:'♡',desc:'每天农场状态恢复 +4。',stat:'regen',value:4},
 {id:'s2-live',name:'爱侬日直播台',tag:'经营流',icon:'✦',desc:'每个加工订单收入额外 +30。',stat:'order',value:30}
 ],
 events:[
 {title:'新产业的第一张清单',text:'回到后陡门，大家把这一季要做的事情写满了纸。',choices:[{text:'留出周转资金',detail:'资金 +25，状态 −6',money:25,health:-6},{text:'先整理工具间',detail:'状态 +12',health:12}]},
 {title:'郁金香包装流水线',text:'花开了，花束也要稳稳当当地送出去。',min:4,choices:[{text:'一起练习包装',detail:'状态 −8，资金 +35',health:-8,money:35},{text:'请有经验的人指导',detail:'资金 −15，状态 +12',money:-15,health:12}]},
 {title:'草莓苗需要修剪',text:'摘掉老叶，让阳光透进来。细致的工作也需要耐心。',min:4,choices:[{text:'分组仔细修剪',detail:'状态 −6，资金 +28',health:-6,money:28},{text:'补齐养护用品',detail:'资金 −12，状态 +14',money:-12,health:14}]},
 {title:'雷雨夜，搬蜂箱',text:'雨点落在屋檐上。大家给新来的蜂箱找一处稳妥的位置。',min:4,choices:[{text:'一起安置蜂箱',detail:'状态 −10，资金 +40',health:-10,money:40},{text:'先搭遮雨棚',detail:'资金 −20，状态 +16',money:-20,health:16}]},
 {title:'小龙虾的防逃网',text:'沿着塘边再巡一遍，别让辛苦养大的小龙虾溜走。',min:4,choices:[{text:'一起加固围边',detail:'状态 −8，资金 +32',health:-8,money:32},{text:'换一批新材料',detail:'资金 −18，状态 +15',money:-18,health:15}]},
 {title:'沙漠种树的约定',text:'田野之外，还有另一片土地等待绿色。把互助的经验带回来。',min:5,choices:[{text:'支持种树行动',detail:'资金 −20，状态 +20',money:-20,health:20},{text:'留守照料农场',detail:'状态 +10',health:10}]},
 {title:'草莓酱第一次试吃',text:'从成熟果实到一瓶果酱，口味和包装都值得认真讨论。',min:8,choices:[{text:'调整口味再试',detail:'资金 −15，状态 +16',money:-15,health:16},{text:'接下一份试吃合作',detail:'资金 +30，状态 −6',money:30,health:-6}]},
 {title:'爱侬日的直播彩排',text:'讲清楚产品背后的劳作，把这一季的故事带到更多人面前。',min:12,choices:[{text:'再排练一遍',detail:'资金 +45，状态 −10',money:45,health:-10},{text:'早点休息，明天开市',detail:'状态 +16',health:16}]}
 ]
};
Object.assign(second.leaders[0],{role:'养蜂守护',desc:'蜂箱每日额外产出 1 份蜂蜜',key:'honey'});
Object.assign(second.leaders[1],{role:'鲜花经营',desc:'郁金香直接卖出收入额外 +18',key:'flower'});
Object.assign(second.leaders[5],{role:'草莓种植',desc:'草莓播种费用从 12 降至 6',key:'fruit'});
Object.assign(second.leaders[7],{role:'虾塘搭档',desc:'虾塘每日额外产出 1 份小龙虾',key:'crayfish'});
Object.assign(second.leaders[8],{role:'产品探索',desc:'每份加工订单收入额外 +20',key:'order'});
window.FARM_SEASONS={1:first,2:second};
})();
