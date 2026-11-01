'use strict';
(() => {
const S=window.FARM_SEASONS;
S[4]={
 season:4,label:'第四季',title:'雨林与沙海',cover:['雨林','与沙海'],coverAsset:'s4/rail',description:'路通向丰收，水流向花开。把劳动带到更远的土地。',
 days:16,money:160,moneyGoal:1000,harvestGoal:18,orderGoal:3,baseCrop:'banana',
 initial:['banana','banana','banana','banana','empty','empty',...Array(6).fill('empty')],
 intro:'从墨脱雨林到和田沙地，砍蕉、种石斛、栽玫瑰。修一条运输轨道，铺一片滴灌管网，让好收成走出山谷，让花在沙地扎根。',
 opening:'抵达墨脱，先采收香蕉筹集工程资金。第 4 日修轨道，第 8 日开启和田产区。',mapLabel:'墨脱 · 雨林驻地',
 source:'https://www.iq.com/album/种地吧第4季-2026-vnn1du4wil?lang=zh_cn',
 chapters:[{name:'雨林里的第一步',sub:'采收香蕉，准备种苗',label:'先认识脚下的土地'},{name:'让香蕉走出山谷',sub:'种石斛，建运输轨道',label:'把丰收的路修出来'},{name:'在沙地种花',sub:'和田栽玫瑰，铺设滴灌',label:'让水抵达每一株花'},{name:'两地的收成',sub:'工程交付，特产联销',label:'路通了，花也开了'}],
 regions:[{name:'墨脱 · 雨林',baseCrop:'banana',unlock:1},{name:'和田 · 沙海',baseCrop:'rose',unlock:8}],
 regionGoal:6,
 projects:[{id:'rail',name:'香蕉运输轨道',region:0,unlock:4,asset:'s4/rail',stages:['勘测与立柱','安装运输轨道','试车与交付'],price:25,facility:'sheep',effect:'完工后香蕉直售额外 +15 资金。'},{id:'drip',name:'光伏滴灌工程',region:1,unlock:8,asset:'s4/irrigation',stages:['铺设滴灌管网','连接水源与光伏','通水与验收'],price:25,facility:'pond',effect:'完工次日起，和田玫瑰每日生长额外 +1。'}],
 crops:{banana:{name:'香蕉',asset:'s4/banana',price:40,plant:7,kind:'tropical',region:0},dendrobium:{name:'石斛',asset:'s4/dendrobium',price:65,plant:12,kind:'orchid',region:0,needs:'greenhouse'},rose:{name:'食用玫瑰',asset:'s4/rose',price:55,plant:9,kind:'rose',region:1}},
 goods:{banana:'香蕉',dendrobium:'石斛',rose:'食用玫瑰'},productions:[],
 facilities:{greenhouse:{name:'石斛种植园',asset:'s4/dendrobium',description:'第 4 日建成后，墨脱空地可以种植石斛。'},sheep:{name:'香蕉运输轨道',asset:'s4/rail',project:'rail',description:'返回工程面板，分三次施工。完工提升香蕉直售收益。'},pond:{name:'光伏滴灌工程',asset:'s4/irrigation',project:'drip',description:'第 8 日进入和田，分三次施工。完工加快玫瑰生长。'},canal:{name:'驻地防护沟',asset:'s4/station',description:'天气造成的农场损耗减少 8。'}},
 orders:[{id:'banana-box',name:'山谷香蕉直达箱',asset:'s4/banana',recipe:{banana:2},price:170,unlock:8},{id:'rose-box',name:'和田玫瑰鲜花箱',asset:'s4/rose',recipe:{rose:2},price:190,unlock:8},{id:'forest-box',name:'墨脱特产组合',asset:'s4/dendrobium',recipe:{dendrobium:2,banana:1},price:260,unlock:8}],
 orderTitle:'两地产区联销',extraHelp:'第 8 日解锁和田。切换产区不耗体力，两地各有六块独立田地，会同时生长。两项工程各施工三次，每次耗 1 体力与 25 资金。两地各收获至少 6 块且两项工程全部完工，才满足季末的额外目标。',
 leaders:S[1].leaders.map(l=>({...l})),weather:S[3].weather,
 perks:[
 ['boots','翻山越岭','劳作流','↟','每天体力上限 +2。','energy',2],['team','两地同心','协作流','∞','每天体力上限 +1，状态恢复 +3。','team',1],['care','熟练的分工','劳作流','↟','每天体力上限 +1。','energy',1],
 ['banana','砍蕉的手感','雨林流','♧','香蕉直售收入 +18。','tropical',18],['orchid','绑好每段石斛','雨林流','✦','石斛直售收入 +25。','orchid',25],['rose','沙地花开','沙海流','❀','食用玫瑰直售收入 +20。','rose',20],
 ['seed','选好种苗','种植流','♧','所有播种费用减少 4。','discount',4],['growth','扎根的力量','种植流','↟','香蕉和玫瑰播种后进入第 1 阶段。','growth',1],['market','产地直达','经营流','▥','所有作物直售收入 +10。','sell',10],
 ['order','把特产讲清楚','联销流','◈','每份订单收入 +35。','order',35],['box','认真装好每箱','联销流','▣','每份订单收入 +25。','order',25],['tools','工程工具箱','工程流','⚒','每阶段工程费用减少 10。','engineeringDiscount',10],
 ['water','风雨里的巡查','守护流','≋','天气损耗减少 10。','shield',10],['meal','驻地热饭','守护流','◡','每日状态恢复 +6。','regen',6],['home','远方的灯','守护流','♡','每日状态恢复 +4。','regen',4],
 ['repair','修好工具再出发','工程流','⚒','修缮费用减少 10，恢复额外 +10。','repair',10],['shade','遮阴与防风','守护流','☂','天气损耗减少 6。','shield',6],['sale','产区推介会','经营流','↗','所有作物直售收入 +8。','sell',8]
 ].map(([id,name,tag,icon,desc,stat,value])=>({id:'s4-'+id,name,tag,icon,desc,stat,value})),
 events:[
 ['砍蕉初体验','香蕉沉甸甸，配合着抬下山才能少走弯路。',0,1],['给石斛找个家','一段段种苗绑上木头，学习雨林中的种植经验。',0,4],['轨道上的第一车香蕉','检查立柱和轨道，让运输走得更稳。',0,4],['雨林产区推介会','把当地作物和种植者的故事介绍给更多人。',0,8],
 ['在和田种下玫瑰','沙地里的花，需要水，也需要耐心。',1,8],['风沙中的滴灌管','仔细检查每个接口，别让辛苦引来的水白白流失。',1,8],['钻井与光伏','为驻地整理供水和发电设施的施工记录。',1,8],['策勒红枣的味道','学习当地红枣产品的加工思路，为特产寻找新可能。',1,10],
 ['远方的一顿热饭','劳作结束，大家围坐下来分享今天的见闻。',null,1],['劳动记录本','记下种苗、工具和每一笔支出，下次会更熟练。',null,1]
 ].map(([title,text,region,min])=>({title,text,region,min,choices:[{text:'一起动手整理',detail:'资金 +30，状态 −6',money:30,health:-6},{text:'补给与休整',detail:'资金 −10，状态 +18',money:-10,health:18}]}))
};
const roles=[['工程搭档','设施建设费用减少 10；修缮额外恢复 12 状态','build'],['产地联销','每份订单收入额外 +20','order'],['鲜花种植','玫瑰直售收入额外 +18','rose'],['踏实劳作','每天体力上限 +1','energy'],['产区经营','所有作物直售收入额外 +5','sell'],['元气补给','每日状态恢复 +4','health']];
S[4].leaders.forEach((l,i)=>{const r=roles[i%roles.length];Object.assign(l,{role:r[0],desc:r[1],key:r[2]});});
})();
