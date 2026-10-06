import type {Save,HomeSave,Mods} from './types';
export const BUILDINGS=[
 {id:'lodge',name:'冒险者小屋',icon:'⌂',desc:'每级开局生命上限 +4。',x:25,y:24},
 {id:'garden',name:'药草花园',icon:'♧',desc:'每级每秒回复 +0.04；开放药包补给。',x:75,y:24},
 {id:'smith',name:'家园铁匠铺',icon:'⚒',desc:'每级伤害 +1%；三级起，初始武器自带一锻。',x:23,y:50},
 {id:'observatory',name:'观星塔',icon:'✦',desc:'每级幸运 +1%；二、四级各增加一次重选。',x:77,y:50},
 {id:'vault',name:'补给仓库',icon:'▣',desc:'每级开局金币 +4；开放钱袋补给。',x:25,y:76},
 {id:'shrine',name:'守护祭台',icon:'◇',desc:'每级护盾上限 +3；开放护符补给。',x:75,y:76}
] as const;
export const SUPPLIES=[
 {id:'medicine' as const,name:'暖心药包',desc:'下一局生命上限 +10。',building:'garden',cost:3,mods:{maxHp:10} as Mods,gold:0,shield:0},
 {id:'coins' as const,name:'旅途钱袋',desc:'下一局开局金币 +20。',building:'vault',cost:3,mods:{} as Mods,gold:20,shield:0},
 {id:'ward' as const,name:'守护小符',desc:'下一局初始护盾额外 +10。',building:'shrine',cost:3,mods:{} as Mods,gold:0,shield:10}
];
export const COMMISSIONS=[
 {id:'first-return',name:'第一次归来',stat:'runs' as const,goal:1,reward:12},
 {id:'hundred',name:'地牢清扫队',stat:'kills' as const,goal:100,reward:20},
 {id:'first-warden',name:'守层者的证明',stat:'bosses' as const,goal:1,reward:25},
 {id:'fourth',name:'穿过四层',stat:'bestFloor' as const,goal:4,reward:35},
 {id:'veteran',name:'十次远征',stat:'runs' as const,goal:10,reward:45},
 {id:'conqueror',name:'远征凯旋',stat:'wins' as const,goal:1,reward:80}
];
export const freshHome=():HomeSave=>({timber:14,buildings:Object.fromEntries(BUILDINGS.map(b=>[b.id,0])),claimed:[],packed:'none'});
export function buildingCost(level:number){return{timber:10+level*12+level*level*3,essence:level===0?0:level*8+Math.max(0,level-1)*6};}
export function buildHome(save:Save,id:string){if(!BUILDINGS.some(b=>b.id===id))return false;const level=save.home.buildings[id]||0,cost=buildingCost(level);if(level>=5||save.home.timber<cost.timber||save.essence<cost.essence)return false;save.home.timber-=cost.timber;save.essence-=cost.essence;save.home.buildings[id]=level+1;return true;}
export function homeBonuses(home:HomeSave){const b=home.buildings,supply=SUPPLIES.find(s=>s.id===home.packed);const mods:Mods={maxHp:(b.lodge||0)*4,regen:(b.garden||0)*.04,damage:(b.smith||0)*.01,luck:(b.observatory||0)*.01,shieldMax:(b.shrine||0)*3};for(const[key,value]of Object.entries(supply?.mods||{}))mods[key as keyof Mods]=(mods[key as keyof Mods]||0)+value;return{mods,gold:(b.vault||0)*4+(supply?.gold||0),shield:supply?.shield||0,rerolls:Math.floor((b.observatory||0)/2),forged:(b.smith||0)>=3?1:0};}
export function packSupply(save:Save,id:string){if(save.home.packed!=='none')return false;const supply=SUPPLIES.find(s=>s.id===id);if(!supply||!save.home.buildings[supply.building]||save.home.timber<supply.cost)return false;save.home.timber-=supply.cost;save.home.packed=supply.id;return true;}
export function unpackSupply(save:Save){const supply=SUPPLIES.find(s=>s.id===save.home.packed);if(!supply)return false;save.home.timber+=supply.cost;save.home.packed='none';return true;}
export function claimCommission(save:Save,id:string){const c=COMMISSIONS.find(c=>c.id===id);if(!c||save.home.claimed.includes(id)||save.stats[c.stat]<c.goal)return false;save.home.timber+=c.reward;save.home.claimed.push(id);return true;}
export function expeditionTimber(floor:number,kills:number,bosses:number){return Math.max(0,Math.floor(kills/6)+bosses*5+Math.max(0,floor-1)*2);}
