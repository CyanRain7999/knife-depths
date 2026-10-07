import type {Gear,InventoryOrder,Slot} from './types';
import {countSets,setById} from './sets';

export const GEAR_SLOTS:Slot[]=['head','body','boots','charm'];
export const BAG_PAGE_SIZE=24;
export const salvageValue=(gear:Gear)=>8+gear.quality*9;

// Sorting changes only the list; the player always chooses what to equip.
export function sortInventory(items:readonly Gear[],equipped:Record<string,Gear>,order:InventoryOrder,slot:Slot|'all'='all'){
 const counts=countSets(equipped);
 const quality=(a:Gear,b:Gear)=>b.quality-a.quality||b.uid-a.uid;
 return items.filter(g=>slot==='all'||g.def.slot===slot).sort((a,b)=>{
  if(order==='quality')return quality(a,b);
  const setA=a.def.set||'',setB=b.def.set||'';
  const progress=(counts[setB]||0)-(counts[setA]||0);
  if(progress)return progress;
  if(!!setA!==!!setB)return setA?-1:1;
  return setA.localeCompare(setB)||quality(a,b);
 });
}

export function inventorySetHint(gear:Gear,equipped:Record<string,Gear>){
 const set=setById(gear.def.set);if(!set)return '散件装备';
 const before=countSets(equipped)[set.id]||0;
 const after=countSets({...equipped,[gear.def.slot]:gear})[set.id]||0;
 const gained=set.tiers.filter(t=>t.pieces>before&&t.pieces<=after).at(-1);
 return gained?`可激活 ${gained.pieces} 件套`:`已穿 ${before}/4 · ${after>before?'补齐部位':'同部位替换'}`;
}
