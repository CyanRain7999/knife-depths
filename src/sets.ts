import type {Effect,EquipmentDef,Mods,Tag} from './types';
export const FAMILY_BIAS=.15;
type Tier={pieces:number;desc:string;mods:Mods;effects:Effect[]};
type GearSet={id:string;name:string;color:string;tag:Tag;tiers:Tier[]};
const fx=(on:Effect['on'],op:Effect['op'],amount:number,extra:Partial<Effect>={}):Effect=>({on,op,amount,...extra});
const tier=(pieces:number,desc:string,mods:Mods={},effects:Effect[]=[]):Tier=>({pieces,desc,mods,effects});
export const SETS:GearSet[]=[
 {id:'gale',name:'逐风刃影',color:'#8eae6f',tag:'speed',tiers:[tier(2,'攻速 +10%，暴击率 +4%。',{speed:.1,crit:.04}),tier(3,'暴击追加飞刀，冷却 0.6 秒。',{},[fx('crit','shot',.6,{cooldown:.6})]),tier(4,'技能后攻速 +35%，持续 4 秒。',{},[fx('skill','overdrive',.35,{cooldown:5})])]},
 {id:'glacier',name:'霜城守誓',color:'#7ab7d3',tag:'shield',tiers:[tier(2,'护盾上限 +12。',{shieldMax:12}),tier(3,'冻结引发碎冰震波。',{},[fx('freeze','nova',.55,{radius:100,cooldown:.6})]),tier(4,'受伤补充 16 护盾，冷却 7 秒。',{},[fx('hurt','shield',16,{cooldown:7})])]},
 {id:'cinder',name:'余烬燎原',color:'#d49b71',tag:'fire',tiers:[tier(2,'范围 +15%，异常伤害 +12%。',{area:.15,statusPower:.12}),tier(3,'燃烧敌人死亡时爆炸。',{},[fx('kill','nova',.7,{condition:'burning',radius:120,cooldown:.35})]),tier(4,'技能向敌群播撒 4 层燃烧。',{},[fx('skill','fire',4,{radius:1000,cooldown:5})])]},
 {id:'briar',name:'荆棘秘药',color:'#90b575',tag:'poison',tiers:[tier(2,'异常时长 +20%，毒与流血伤害 +12%。',{duration:.2,statusPower:.12}),tier(3,'毒敌命中有 25% 概率束缚 1 秒。',{},[fx('hit','snare',1,{condition:'poisoned',chance:.25,cooldown:.4})]),tier(4,'束缚敌人死亡向邻近散播 4 层毒。',{},[fx('kill','poison',4,{condition:'snared',radius:180,cooldown:.4})])]},
 {id:'circuit',name:'雷鸣机巧',color:'#b6b06b',tag:'turret',tiers:[tier(2,'炮台伤害 +25%。',{turretPower:.25}),tier(3,'炮台命中引发连锁电弧。',{},[fx('hit','chain',.45,{condition:'turret',radius:180,cooldown:.5})]),tier(4,'技能部署 3 枚随行护刃。',{},[fx('skill','orbit',3,{cooldown:6})])]},
 {id:'lunar',name:'月相归途',color:'#a793c9',tag:'return',tiers:[tier(2,'返程伤害 +20%。',{returnPower:.2}),tier(3,'接住回旋武器补充 5 护盾。',{},[fx('return','shield',5,{cooldown:.8})]),tier(4,'接住回旋武器重奏首武器一轮，冷却 2 秒。',{},[fx('return','echo',1,{cooldown:2})])]},
 {id:'warborn',name:'铁血战歌',color:'#be8184',tag:'heavy',tiers:[tier(2,'生命上限 +18，伤害 +8%。',{maxHp:18,damage:.08}),tier(3,'重武器命中震退周围普通怪。',{},[fx('hit','repel',30,{condition:'heavy',radius:85,cooldown:.5})]),tier(4,'残血命中吸取 2 生命，冷却 0.7 秒。',{},[fx('hit','heal',2,{condition:'low',cooldown:.7})])]},
 {id:'fortune',name:'命运契约',color:'#c4a464',tag:'gold',tiers:[tier(2,'金币收益 +15%，幸运 +4%。',{goldBonus:.15,luck:.04}),tier(3,'击杀有 25% 概率获得 2 金币。',{},[fx('kill','gold',2,{chance:.25,cooldown:.3})]),tier(4,'每百持币增伤 +7%；残血技能召唤护刃。',{goldPower:.07},[fx('skill','orbit',2,{condition:'low',cooldown:5})])]}
];
const families:Record<Tag,string>={crit:'gale',speed:'gale',pierce:'gale',bounce:'lunar',return:'lunar',poison:'briar',control:'briar',ice:'glacier',shield:'glacier',fire:'cinder',explosion:'cinder',lightning:'circuit',turret:'circuit',summon:'circuit',heavy:'warborn',blood:'warborn',gold:'fortune',curse:'fortune',luck:'fortune'};
export const setForTag=(tag:Tag)=>families[tag];
export const setById=(id?:string)=>SETS.find(s=>s.id===id);
export function countSets(equipment:Record<string,{def:EquipmentDef}>){const result:Record<string,number>={};for(const gear of Object.values(equipment))if(gear.def.set)result[gear.def.set]=(result[gear.def.set]||0)+1;return result;}
const item=(set:string,suffix:string,name:string,slot:EquipmentDef['slot'],desc:string,mods:Mods,effects:Effect[]=[],cursed=false):EquipmentDef=>({id:`set-${set}-${suffix}`,set,name,slot,desc,mods,effects,cursed,tag:SETS.find(s=>s.id===set)!.tag});
export const SET_GEAR:EquipmentDef[]=[
 item('gale','head','风羽兜帽','head','暴击率 +5%；暴击使技能冷却缩短。',{crit:.05},[fx('crit','cooldown',.3,{cooldown:.5})]),
 item('gale','body','穿云短袍','body','穿透 +1，护甲 +1。',{pierce:1,armor:1}),
 item('gale','boots','追影轻靴','boots','移速 +15%；技能获得短暂加速攻击。',{move:.15},[fx('skill','overdrive',.18,{cooldown:6})]),
 item('gale','charm','飞羽指环','charm','连击专注：暴击额外发射一刃。',{speed:.05},[fx('crit','shot',.35,{cooldown:.7})]),
 item('glacier','head','冰镜面罩','head','冻结时给目标附加易伤。',{shieldMax:5},[fx('freeze','mark',.12,{cooldown:.5})]),
 item('glacier','body','霜城胸甲','body','护甲 +3，护盾上限 +8，移速 -5%。',{armor:3,shieldMax:8,move:-.05}),
 item('glacier','boots','雪脉战靴','boots','受伤时冻结附近敌人。',{move:.08},[fx('hurt','ice',4,{radius:150,cooldown:6})]),
 item('glacier','charm','守誓冰晶','charm','技能补充 8 护盾。',{},[fx('skill','shield',8,{cooldown:4})]),
 item('cinder','head','炭火冠','head','燃烧目标命中有概率追加燃烧。',{statusPower:.08},[fx('hit','fire',1,{condition:'burning',chance:.22,cooldown:.3})]),
 item('cinder','body','引焰围裙','body','爆炸范围 +12%，护甲 +2。',{area:.12,armor:2}),
 item('cinder','boots','灰烬踏靴','boots','技能击退近身敌人。',{move:.1},[fx('skill','repel',65,{radius:190,cooldown:4})]),
 item('cinder','charm','焦土火种','charm','燃烧敌人死亡时延烧邻近目标。',{},[fx('kill','fire',2,{condition:'burning',radius:110,cooldown:.5})]),
 item('briar','head','花毒面纱','head','攻击被束缚目标时叠毒。',{duration:.1},[fx('hit','poison',1,{condition:'snared',chance:.4,cooldown:.4})]),
 item('briar','body','藤蔓长衣','body','生命上限 +12，毒敌击杀回血。',{maxHp:12},[fx('kill','heal',1,{condition:'poisoned',cooldown:.5})]),
 item('briar','boots','扎根草鞋','boots','底线近身敌人周期束缚。',{move:-.05},[fx('second','snare',.8,{radius:160,cooldown:3})]),
 item('briar','charm','秘药试管','charm','命中毒敌将 1 层毒转为火。',{statusPower:.1},[fx('hit','transmute',1,{condition:'poisoned',chance:.25,cooldown:.6})]),
 item('circuit','head','导流头盔','head','炮台命中目标附加标记。',{turretPower:.1},[fx('hit','mark',.1,{condition:'turret',cooldown:.8})]),
 item('circuit','body','机巧护衣','body','护盾上限 +8，技能后加速攻击。',{shieldMax:8},[fx('skill','overdrive',.15,{cooldown:6})]),
 item('circuit','boots','蓄电短靴','boots','每 4 秒补充 3 护盾。',{move:.1},[fx('second','shield',3,{cooldown:4})]),
 item('circuit','charm','小型发条','charm','每 8 秒部署一枚随行护刃。',{},[fx('second','orbit',1,{cooldown:8})]),
 item('lunar','head','望月兜帽','head','返程命中目标易伤。',{crit:.03},[fx('hit','mark',.1,{condition:'return',cooldown:.5})]),
 item('lunar','body','折月斗篷','body','接住回旋武器回复 1 生命。',{armor:1},[fx('return','heal',1,{cooldown:.6})]),
 item('lunar','boots','归潮步履','boots','移速 +12%，返程伤害 +12%。',{move:.12,returnPower:.12}),
 item('lunar','charm','月食吊坠','charm','接住回旋武器缩短技能冷却。',{},[fx('return','cooldown',.5,{cooldown:.7})]),
 item('warborn','head','战歌铁盔','head','重武器命中叠加流血。',{armor:2},[fx('hit','bleed',1,{condition:'heavy',chance:.3,cooldown:.5})]),
 item('warborn','body','逆血战甲','body','生命上限 +20，残血伤害 +15%。',{maxHp:20,lowDamage:.15}),
 item('warborn','boots','破阵重靴','boots','移速 -10%，伤害 +12%；受伤后攻速提升。',{move:-.1,damage:.12},[fx('hurt','overdrive',.2,{cooldown:8})]),
 item('warborn','charm','血誓徽记','charm','携带增加 2 诅咒；残血暴击引发命运印记。',{crit:.04},[fx('crit','doom',.7,{condition:'low',cooldown:1})],true),
 item('fortune','head','点金礼帽','head','持币时暴击可获得 1 金币。',{luck:.04},[fx('crit','gold',1,{condition:'rich',cooldown:.6})]),
 item('fortune','body','契约商袍','body','携带增加 2 诅咒；金币收益 +25%。',{goldBonus:.25},[],true),
 item('fortune','boots','拾遗软靴','boots','拾取半径 +30，移速 +10%。',{magnet:30,move:.1}),
 item('fortune','charm','命运筹码','charm','技能清除敌弹，冷却 10 秒。',{luck:.03},[fx('skill','cleanse',1,{cooldown:10})])
];
