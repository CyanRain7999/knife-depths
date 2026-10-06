import { HEROES, WEAPONS, PASSIVES, EQUIPMENT, ENEMIES, BOSSES, EVENTS } from './data';
import type { Save } from './types';
const KEY='knife-depths.save.v1';
export const freshSave=():Save=>({version:1,essence:0,unlocked:HEROES.filter(h=>h.cost===0).map(h=>h.id),seen:[],stats:{runs:0,kills:0,bosses:0,bestFloor:0,wins:0,gold:0},upgrades:{vitality:0,fortune:0,supply:0},settings:{sound:true,shake:true,numbers:true,particles:true}});
const int=(x:unknown,max=1e9)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(max,Math.floor(x))):0;
export function validateSave(raw:unknown):Save{
 if(!raw||typeof raw!=='object')throw new Error('存档格式不正确');const obj=raw as Partial<Save>;if(obj.version!==1)throw new Error('不支持此存档版本');
 const save=freshSave();save.essence=int(obj.essence);const validIds=new Set([...HEROES,...WEAPONS,...PASSIVES,...EQUIPMENT,...ENEMIES,...BOSSES].map(x=>x.id));for(const e of EVENTS)validIds.add(`event:${e.id}`);
 if(Array.isArray(obj.unlocked))save.unlocked=[...new Set([...save.unlocked,...obj.unlocked.filter(id=>typeof id==='string'&&HEROES.some(h=>h.id===id))])];
 if(Array.isArray(obj.seen))save.seen=[...new Set(obj.seen.filter(id=>typeof id==='string'&&validIds.has(id)))];
 for(const key of Object.keys(save.stats) as (keyof Save['stats'])[])save.stats[key]=int(obj.stats?.[key]);
 for(const key of Object.keys(save.upgrades) as (keyof Save['upgrades'])[])save.upgrades[key]=int(obj.upgrades?.[key],5);
 for(const key of Object.keys(save.settings) as (keyof Save['settings'])[])if(typeof obj.settings?.[key]==='boolean')save.settings[key]=obj.settings[key];
 return save;
}
export function loadSave():Save{try{const raw=localStorage.getItem(KEY);return raw?validateSave(JSON.parse(raw)):freshSave();}catch{return freshSave();}}
export function storeSave(save:Save){try{localStorage.setItem(KEY,JSON.stringify(save));return true;}catch{return false;}}
