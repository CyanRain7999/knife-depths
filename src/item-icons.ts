import type {Gear} from './types';
export type ItemIconKind='weapon'|'equipment'|'passive';
const directories={weapon:'weapons',equipment:'equipment',passive:'passives'} as const;
const cache=new Map<string,string>();
export const itemIconUrl=(kind:ItemIconKind,id:string)=>`${import.meta.env.BASE_URL}item-icons/${directories[kind]}/${encodeURIComponent(id)}.svg`;
export const dropIconUrl=(id:string)=>`${import.meta.env.BASE_URL}item-icons/drops/${encodeURIComponent(id)}.svg`;
export function itemIcon(kind:ItemIconKind,id:string,size=48,quality?:number){
 const key=[kind,id,size,quality??''].join(':');const cached=cache.get(key);if(cached)return cached;
 const html=`<span class="item-icon item-icon-${kind}${quality===undefined?'':` item-quality-${quality}`}" style="width:${size}px;height:${size}px"><img src="${itemIconUrl(kind,id)}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async" draggable="false">${quality===undefined?'':`<i class="item-quality-gem" aria-hidden="true"></i>`}</span>`;
 if(cache.size>1200)cache.clear();cache.set(key,html);return html;
}
export const gearIcon=(gear:Gear,size=48)=>itemIcon('equipment',gear.def.id,size,gear.quality);
