import { HEROES, WEAPONS, PASSIVES, EQUIPMENT, ENEMIES, BOSSES, EVENTS } from './data';
import type { Save } from './types';
import {freshHome,BUILDINGS,COMMISSIONS,SUPPLIES} from './home';
const KEY='knife-depths.save.v1';
export const freshSave=():Save=>({version:1,essence:0,unlocked:HEROES.filter(h=>h.cost===0).map(h=>h.id),seen:[],stats:{runs:0,kills:0,bosses:0,bestFloor:0,wins:0,gold:0},upgrades:{vitality:0,fortune:0,supply:0},home:freshHome(),settings:{sound:true,shake:true,numbers:true,particles:true,gameSpeed:1,inventoryOrder:'quality'}});
const int=(x:unknown,max=1e9)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(max,Math.floor(x))):0;
export function validateSave(raw:unknown):Save{
 if(!raw||typeof raw!=='object')throw new Error('存档格式不正确');const obj=raw as Partial<Save>;if(obj.version!==1)throw new Error('不支持此存档版本');
 const save=freshSave();save.essence=int(obj.essence);const validIds=new Set([...HEROES,...WEAPONS,...PASSIVES,...EQUIPMENT,...ENEMIES,...BOSSES].map(x=>x.id));for(const e of EVENTS)validIds.add(`event:${e.id}`);
 if(Array.isArray(obj.unlocked))save.unlocked=[...new Set([...save.unlocked,...obj.unlocked.filter(id=>typeof id==='string'&&HEROES.some(h=>h.id===id))])];
 if(Array.isArray(obj.seen))save.seen=[...new Set(obj.seen.filter(id=>typeof id==='string'&&validIds.has(id)))];
 for(const key of Object.keys(save.stats) as (keyof Save['stats'])[])save.stats[key]=int(obj.stats?.[key]);
 for(const key of Object.keys(save.upgrades) as (keyof Save['upgrades'])[])save.upgrades[key]=int(obj.upgrades?.[key],5);
 if(obj.home&&typeof obj.home==='object'){
  save.home.timber=int(obj.home.timber);
  for(const building of BUILDINGS)save.home.buildings[building.id]=int(obj.home.buildings?.[building.id],5);
  if(Array.isArray(obj.home.claimed))save.home.claimed=[...new Set(obj.home.claimed.filter(id=>COMMISSIONS.some(c=>c.id===id)))];
  const packed=SUPPLIES.find(s=>s.id===obj.home?.packed);if(packed&&save.home.buildings[packed.building]>0)save.home.packed=packed.id;
 }
 for(const key of ['sound','shake','numbers','particles'] as const)if(typeof obj.settings?.[key]==='boolean')save.settings[key]=obj.settings[key];
 const speed=obj.settings?.gameSpeed;if(typeof speed==='number'&&Number.isInteger(speed)&&speed>=1&&speed<=5)save.settings.gameSpeed=speed as Save['settings']['gameSpeed'];
 if(obj.settings?.inventoryOrder==='set')save.settings.inventoryOrder='set';
 return save;
}
export function loadSave():Save{try{const raw=localStorage.getItem(KEY);return raw?validateSave(JSON.parse(raw)):freshSave();}catch{return freshSave();}}
export function storeSave(save:Save){try{localStorage.setItem(KEY,JSON.stringify(save));return true;}catch{return false;}}
