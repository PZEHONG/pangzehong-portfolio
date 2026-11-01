'use strict';
(() => {
const seasons=window.FARM_SEASONS;
// Shared capabilities are declared by content packs, never inferred from season numbers.
Object.assign(seasons[1],{baseCrop:'wheat',coverAsset:'rice',orderTitle:'从收成到产品',productions:[],extraHelp:''});
Object.assign(seasons[2],{baseCrop:'wheat',coverAsset:'s2/strawberry',orderTitle:'从收成到产品',productions:[{facility:'sheep',good:'honey',stat:'honey'},{facility:'pond',good:'crayfish',stat:'crayfish'}],extraHelp:'成熟的草莓和郁金香可卖出或入库。蜂箱与虾塘次日开始产出原料，第 8 天交付订单。',marketAsset:'s2/stall'});
const third={
 season:3,label:'第三季',title:'让田野相连',cover:['让田野','相连'],coverAsset:'s3/traveler',description:'从后陡门出发，让每一份好收成都被看见。',
 days:16,money:140,moneyGoal:900,harvestGoal:16,orderGoal:3,trustGoal:8,partnerGoal:2,baseCrop:'rice',
 initial:['rice','rice','rice','rice','empty','empty'],
 intro:'留守一片田，也走向更远的土地。去囊谦、去林口，让新农人的收成在后陡门相遇。',
 opening:'第三个秋天，熟练地抢收水稻。第 4 天建交流中心，派队连接乡村伙伴。',mapLabel:'后陡门 · 连接乡村的集散地',
 source:'https://www.iq.com/album/种地吧第3季-2025-1m6mg3fkjcd?lang=zh_cn',
 chapters:[{name:'第三个秋天',sub:'抢收水稻，筹备新的出发',label:'从熟悉的田野出发'},{name:'去更远的土地',sub:'走访囊谦、林口，结识乡村伙伴',label:'把远方，带回后陡门'},{name:'乡村合伙人',sub:'联销各地特产，共建交流中心',label:'好收成，值得被看见'},{name:'田野里的相遇',sub:'水培芹菜、稻田画与乡村联销',label:'让每一片田野相连'}],
 crops:{rice:{name:'水稻',asset:'rice',price:30,plant:6,kind:'grain'},celery:{name:'水培芹菜',asset:'s3/celery',price:48,plant:10,kind:'vegetable',needs:'greenhouse'}},
 goods:{rice:'稻米',celery:'芹菜',salt:'囊谦红盐',seabuckthorn:'林口沙棘'},productions:[],
 facilities:{greenhouse:{name:'水培大棚',asset:'greenhouse',description:'建成后解锁水培芹菜。稻米、芹菜成熟后可以直售或入库，联销订单会消耗库存。'},sheep:{name:'交流集散中心',asset:'s3/center',description:'建成后解锁乡村走访。每次派队耗费资金与 1 体力，次日返回特产并提升伙伴信誉。'},pond:{name:'稻田画园',asset:'s3/paddyart',description:'与伙伴共创稻田画。建成次日起每日伙伴信誉 +1；不自动增加资金或收获。'},canal:{name:'灌排水渠',asset:'rice',description:'维护稻田水位，恶劣天气造成的农场损耗减少 8。'}},
 routes:[{id:'nangqian',name:'青海 · 囊谦',good:'salt',asset:'s3/salt',price:35,quantity:2,description:'走访高原盐田，连接红盐产区。'},{id:'linkou',name:'黑龙江 · 林口',good:'seabuckthorn',asset:'s3/seabuckthorn',price:30,quantity:2,description:'走访沙棘产区，带回当地特产。'}],
 orders:[{id:'salt-rice',name:'红盐稻米联销',asset:'s3/salt',recipe:{salt:2,rice:1},price:210,unlock:8},{id:'berry',name:'沙棘特产联销',asset:'s3/seabuckthorn',recipe:{seabuckthorn:2},price:160,unlock:8},{id:'vegetable',name:'芹菜稻米鲜食包',asset:'s3/celery',recipe:{celery:2,rice:1},price:190,unlock:8}],
 orderTitle:'乡村联销台',marketAsset:'s2/stall',extraHelp:'稻米和芹菜可直售或入库。第 4 天建设交流集散中心后可走访，每天最多派一队、次日返回。须连接囊谦与林口两处伙伴；第 8 天起交付联销订单。稻田画园次日起每日信誉 +1；完成走访或订单也会增加信誉。',
 leaders:[1,3,5,6,7,8,9].map(i=>({...seasons[1].leaders[i]})),
 weather:[{name:'晴朗',icon:'☀',desc:'适合田间劳作',damage:0},{name:'润雨',icon:'☂',desc:'作物生长额外 +1',damage:0,growth:1},{name:'强降雨',icon:'☁',desc:'农场状态 −14',damage:14},{name:'寒潮',icon:'≋',desc:'农场状态 −10',damage:10}],
 perks:[
 {id:'s3-boots',name:'走向远方的靴子',tag:'劳作流',icon:'↟',desc:'每天体力上限 +2，立即恢复 2 点。',stat:'energy',value:2},
 {id:'s3-team',name:'乡村合伙人',tag:'协作流',icon:'∞',desc:'体力上限 +1，每日农场状态恢复 +3。',stat:'team',value:1},
 {id:'s3-care',name:'新一年的分工',tag:'劳作流',icon:'↟',desc:'每天体力上限 +1。',stat:'energy',value:1},
 {id:'s3-canal',name:'泡田的经验',tag:'基建流',icon:'≋',desc:'天气造成的农场损耗减少 10。',stat:'shield',value:10},
 {id:'s3-rice',name:'熟练的收割机手',tag:'粮食流',icon:'⌁',desc:'水稻直接卖出收入 +14。',stat:'grain',value:14},
 {id:'s3-celery',name:'水培收菜笔记',tag:'蔬菜流',icon:'♧',desc:'芹菜直接卖出收入 +20。',stat:'vegetable',value:20},
 {id:'s3-seed',name:'认真选好种苗',tag:'种植流',icon:'✦',desc:'所有作物播种费用减少 4。',stat:'discount',value:4},
 {id:'s3-growth',name:'育秧的耐心',tag:'种植流',icon:'♧',desc:'水稻播种后进入第 1 生长阶段。',stat:'growth',value:1},
 {id:'s3-market',name:'产销贯通',tag:'经营流',icon:'▥',desc:'所有作物直接卖出收入 +8。',stat:'sell',value:8},
 {id:'s3-order',name:'让特产被看见',tag:'联销流',icon:'◈',desc:'每份联销订单收入 +35。',stat:'order',value:35},
 {id:'s3-package',name:'乡村产品展台',tag:'联销流',icon:'▥',desc:'每份联销订单收入 +25。',stat:'order',value:25},
 {id:'s3-route',name:'熟悉的乡间路',tag:'走访流',icon:'↗',desc:'每次走访费用减少 10。',stat:'travelDiscount',value:10},
 {id:'s3-box',name:'一辆装得下的车',tag:'走访流',icon:'▣',desc:'每次走访返回的特产数量 +1。',stat:'travelGoods',value:1},
 {id:'s3-trust',name:'认真兑现承诺',tag:'伙伴流',icon:'♡',desc:'每次走访返回时，额外获得 1 点信誉。',stat:'trust',value:1},
 {id:'s3-paddy',name:'稻田画共创',tag:'文旅流',icon:'❀',desc:'建好稻田画园后，每日额外信誉 +1。',stat:'art',value:1},
 {id:'s3-meal',name:'插秧宴开席',tag:'守护流',icon:'◡',desc:'每日农场状态恢复 +6。',stat:'regen',value:6},
 {id:'s3-home',name:'少年之家的灯',tag:'守护流',icon:'♡',desc:'每日农场状态恢复 +4。',stat:'regen',value:4},
 {id:'s3-tool',name:'把工具修好',tag:'基建流',icon:'⚒',desc:'修缮费用减少 10，恢复状态额外 +10。',stat:'repair',value:10}
 ],
 events:[
 {title:'第三个秋天的收割',text:'熟悉的收割机再次开进田里。把粮食收好，再出发。',choices:[{text:'一起抢收',detail:'资金 +28，状态 −6',money:28,health:-6},{text:'检查农机',detail:'资金 −10，状态 +15',money:-10,health:15}]},
 {title:'囊谦大棚的心愿',text:'高原大棚里的新尝试，让大家开始讨论不同土地上的种植条件。',min:4,choices:[{text:'交流种植经验',detail:'状态 +12',health:12},{text:'准备一批工具',detail:'资金 −15，状态 +18',money:-15,health:18}]},
 {title:'林口的沙棘采收',text:'冰雪中的沙棘，也有属于自己的收获季。认真听当地伙伴讲经验。',min:4,choices:[{text:'协助整理特产',detail:'资金 +32，状态 −8',money:32,health:-8},{text:'给伙伴准备热饭',detail:'资金 −10，状态 +15',money:-10,health:15}]},
 {title:'乡村合伙人招募',text:'更多人带着自己的产品和想法，来到交流集散中心。',min:5,choices:[{text:'筹备交流会',detail:'资金 −15，状态 +18',money:-15,health:18},{text:'整理产品资料',detail:'资金 +25，状态 −5',money:25,health:-5}]},
 {title:'为伙伴搭一张展台',text:'产品背后，是一整季的劳动。把它介绍得清楚一些。',min:8,choices:[{text:'一起布展',detail:'资金 +35，状态 −8',money:35,health:-8},{text:'先修好工作台',detail:'资金 −15，状态 +18',money:-15,health:18}]},
 {title:'水培芹菜长高了',text:'大棚里又到了收菜的时候。拔菜、装箱、搬运，配合越来越熟练。',min:5,choices:[{text:'一起整理菜箱',detail:'资金 +28，状态 −6',money:28,health:-6},{text:'维护水培设施',detail:'资金 −12，状态 +16',money:-12,health:16}]},
 {title:'孩子们的稻田画',text:'不同颜色的秧苗，在田里慢慢拼成一幅画。',min:8,choices:[{text:'准备共创材料',detail:'资金 −18，状态 +20',money:-18,health:20},{text:'一起整理田埂',detail:'状态 +10',health:10}]},
 {title:'泡田前的一次巡查',text:'水流顺着沟渠进入稻田，大家仔细检查每一个堵塞处。',choices:[{text:'下田疏通',detail:'资金 +24，状态 −6',money:24,health:-6},{text:'补齐灌排物资',detail:'资金 −12，状态 +16',money:-12,health:16}]},
 {title:'插秧宴开席',text:'一天的劳作之后，和新老伙伴围坐在一起，好好吃顿饭。',min:10,choices:[{text:'大家一起吃',detail:'状态 +18',health:18},{text:'准备农场鲜食包',detail:'资金 +30，状态 −5',money:30,health:-5}]},
 {title:'为乡村伙伴做一次介绍',text:'在联销台上，讲清楚原产地、劳动和产品的故事。',min:10,choices:[{text:'认真准备展示',detail:'资金 +40，状态 −8',money:40,health:-8},{text:'邀请伙伴坐下来交流',detail:'状态 +15',health:15}]}
 ]
};
const roles=[['伙伴联络','走访返回额外获得 1 点信誉','trust'],['联销记录','每份联销订单收入额外 +20','order'],['水培种植','芹菜播种费用减少 4','vegetable'],['踏实劳作','每天体力上限 +1','energy'],['农机搭档','稻谷直接卖出收入额外 +8','grain'],['产区走访','走访带回的特产数量额外 +1','travelGoods'],['元气补给','每日农场状态恢复 +4','health']];
third.leaders.forEach((l,i)=>Object.assign(l,{role:roles[i][0],desc:roles[i][1],key:roles[i][2]}));
seasons[3]=third;
})();
