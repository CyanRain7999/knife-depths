import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {WEAPON_ART,GEAR_ART,PASSIVE_ART,itemIconSVG} from '../src/item-icon-art.ts';

const root=new URL('../',import.meta.url);
const source=await readFile(new URL('src/data.ts',root),'utf8');
const sets=await readFile(new URL('src/sets.ts',root),'utf8');
const data={weapon:[],equipment:[],passive:[]};
for(const match of source.matchAll(/\b(w|g|p)\('([^']+)','([^']+)'/g))data[{w:'weapon',g:'equipment',p:'passive'}[match[1]]].push({id:match[2],name:match[3]});
for(const match of sets.matchAll(/\bitem\('([^']+)','([^']+)','([^']+)'/g))data.equipment.push({id:`set-${match[1]}-${match[2]}`,name:match[3]});
const catalogs={weapon:WEAPON_ART,equipment:GEAR_ART,passive:PASSIVE_ART};
const directories={weapon:'weapons',equipment:'equipment',passive:'passives'};
const catalog=[];
for(const kind of Object.keys(data)){
 const entries=data[kind],defined=Object.keys(catalogs[kind]);
 const missing=entries.filter(e=>!defined.includes(e.id)),extra=defined.filter(id=>!entries.some(e=>e.id===id));
 if(missing.length||extra.length)throw Error(`${kind}: missing ${missing.map(e=>e.id)}; extra ${extra}`);
 const folder=new URL(`public/item-icons/${directories[kind]}/`,root);await mkdir(folder,{recursive:true});
 if(kind==='equipment')await mkdir(new URL('public/item-icons/drops/',root),{recursive:true});
 for(const {id,name} of entries){
  const svg=itemIconSVG(kind,id);await writeFile(new URL(id+'.svg',folder),svg);
  if(kind==='equipment')await writeFile(new URL(`public/item-icons/drops/${id}.svg`,root),itemIconSVG(kind,id,false));
  catalog.push({kind,id,name});
 }
 console.log(`${kind}: exported ${entries.length} detailed icons.`);
}
const cols=12,cell=104,rows=Math.ceil(catalog.length/cols);
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*cell}" height="${rows*cell}" viewBox="0 0 ${cols*cell} ${rows*cell}"><rect width="100%" height="100%" fill="#e9efdd"/>${catalog.map(({kind,id},n)=>`<g transform="translate(${n%cols*cell+4} ${Math.floor(n/cols)*cell+4})">${itemIconSVG(kind,id).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`).join('')}</svg>`;
await writeFile(new URL('docs/ITEM-ICONS.svg',root),sheet);
const samples=[
 ['weapon','武器',['knife','kunai','axe','stormstar','tesla','singularity','icebridge','hexhour']],
 ['equipment','装备',['crow','coil','frostmail','labcoat','runner','ruby','set-lunar-body','set-fortune-charm']],
 ['passive','被动',['keen','deepfreeze','darkdeal','engineering','quiver','sporeweave','crimsonmark','shieldpulse']]
];
const preview=`<svg xmlns="http://www.w3.org/2000/svg" width="1088" height="548" viewBox="0 0 1088 548"><rect width="100%" height="100%" fill="#eff3e5"/><text x="22" y="31" font-family="Microsoft YaHei,sans-serif" font-size="19" fill="#3b5947">飞刀深渊 · 全新物品图标</text>${samples.map(([kind,label,ids],row)=>`<text x="23" y="${66+row*160}" font-family="Microsoft YaHei,sans-serif" font-size="14" fill="#718469">${label}</text>${ids.map((id,col)=>{const name=catalog.find(e=>e.kind===kind&&e.id===id).name;return `<g transform="translate(${22+col*134} ${76+row*160})">${itemIconSVG(kind,id).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}<text x="48" y="115" text-anchor="middle" font-family="Microsoft YaHei,sans-serif" font-size="11" fill="#566d4e">${name}</text></g>`;}).join('')}`).join('')}</svg>`;
await writeFile(new URL('docs/ITEM-ICON-PREVIEW.svg',root),preview);
console.log(`Complete: ${catalog.length} catalog icons + ${data.equipment.length} transparent drop sprites.`);
