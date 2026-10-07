import type {Tag} from './types';

export type ItemIconKind='weapon'|'equipment'|'passive';
type Spec={shape:string;tag:Tag;mark?:string;accent?:string};
type Palette={ink:string;dark:string;mid:string;light:string;shine:string;gold:string;metal:string;steel:string;wood:string};
const THEMES:Record<Tag,string>={crit:'#d8869b',speed:'#8ebf82',pierce:'#8bbdba',bounce:'#ad9bd5',poison:'#92bb55',ice:'#77c4e2',fire:'#e8995f',lightning:'#e4ca69',explosion:'#d99569',heavy:'#b99878',return:'#b19bdd',turret:'#80b9a6',blood:'#cb7086',shield:'#88c0d0',gold:'#dbb965',curse:'#a68ad5',luck:'#b8c875',control:'#74b9a7',summon:'#9cbfe0'};
const mix=(a:string,b:string,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
const palette=(tag:Tag):Palette=>({ink:'#263344',dark:mix(THEMES[tag],'#263344',.48),mid:THEMES[tag],light:mix(THEMES[tag],'#f6f6dd',.48),shine:'#f5fae9',gold:'#dfb968',metal:'#b9d0d8',steel:'#708b9e',wood:'#a97854'});
const rect=(x:number,y:number,w:number,h:number,fill:string,stroke?:string)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="2"`:''}/>`;
const path=(d:string,fill:string,stroke='#263344',width=2)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
const line=(d:string,color:string,width=2)=>path(d,'none',color,width);
const circle=(x:number,y:number,r:number,fill:string,stroke?:string,width=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${width}"`:''}/>`;
const group=(body:string,x=0,y=0,scale=1,angle=0)=>`<g transform="translate(${x} ${y}) scale(${scale}) rotate(${angle} 16 16)">${body}</g>`;
const gem=(x:number,y:number,r:number,c:Palette)=>path(`M${x} ${y-r} ${x+r} ${y-r/3} ${x+r*.7} ${y+r*.65} ${x} ${y+r} ${x-r*.7} ${y+r*.65} ${x-r} ${y-r/3}Z`,c.mid)+path(`M${x} ${y-r} ${x+r} ${y-r/3} ${x} ${y+r}Z`,c.dark,'none',0)+path(`M${x} ${y-r} ${x-r} ${y-r/3} ${x-2} ${y+2}Z`,c.light,'none',0)+line(`M${x-r*.55} ${y-r*.35} ${x-2} ${y-r*.7}`,c.shine,2);
const star=(x:number,y:number,r:number,c:string)=>path(`M${x} ${y-r} ${x+2} ${y-2} ${x+r} ${y} ${x+2} ${y+2} ${x} ${y+r} ${x-2} ${y+2} ${x-r} ${y} ${x-2} ${y-2}Z`,c,'none',0);
const rivets=(c:Palette)=>[22,74].flatMap(x=>[22,74].map(y=>circle(x,y,2,c.gold,c.ink,1))).join('');

// Symbols are drawn in a 32-unit square and composed into individual illustrations.
function symbol(name:string,c:Palette):string{
 const i=c.ink,m=c.mid,l=c.light,d=c.dark,g=c.gold,s=c.metal;
 switch(name){
  case'blade':return path('M24 3 23 16 12 24 8 20 17 9Z',s)+path('M24 3 19 16 10 22 8 20 17 9Z',c.shine,'none',0)+path('M8 17 16 25 13 28 5 20Z',g)+path('M7 23 10 26 5 31 2 28Z',c.wood)+line('M17 12 21 8',c.steel);
  case'eye':return path('M2 16 9 9 16 7 23 9 30 16 23 23 16 25 9 23Z',l)+circle(16,16,7,m,i)+circle(16,16,3,i)+rect(14,11,3,3,c.shine)+line('M9 5 11 3M22 5 24 3',g);
  case'skull':return path('M8 4 24 4 28 10 28 20 23 22 23 29 9 29 9 22 4 20 4 10Z',l)+path('M7 12 13 11 13 18 8 18ZM19 11 25 12 24 18 19 18Z',i,'none',0)+path('M16 17 13 22 19 22Z',d,'none',0)+line('M12 25V29M16 25V29M20 25V29',d);
  case'feather':return path('M6 27 8 14 17 4 29 2 27 14 17 23Z',l)+path('M28 3 21 18 9 27 7 25Z',m,'none',0)+line('M4 30 25 8M13 13 13 20M18 9 18 15M10 25 18 25',d);
  case'wing':return path('M3 22 2 5 9 9 16 6 23 12 30 11 28 18 22 25 14 29Z',m)+path('M3 8 10 13 19 13 26 15 18 18 11 18ZM4 14 10 20 20 19 14 24 7 24Z',l,'none',0)+line('M6 27 23 13',d);
  case'flame':return path('M17 2 19 12 25 7 29 17 28 24 22 30 10 30 4 25 3 18 8 10 10 19 14 15Z',m)+path('M16 12 23 21 21 29 12 29 8 23 13 20Z',g,'none',0)+path('M16 21 19 26 17 30 13 28Z',c.shine,'none',0);
  case'snow':return line('M16 2V30M4 9 28 23M4 23 28 9M11 5 16 10 21 5M11 27 16 22 21 27M3 15 9 12 8 6M24 26 23 20 29 17M3 17 9 20 8 26M24 6 23 12 29 15',l,3)+gem(16,16,4,c);
  case'bolt':return path('M17 2 5 19 14 19 10 30 28 12 18 12 23 2Z',g)+path('M18 4 9 16 17 16 15 24 24 14 16 14Z',c.shine,'none',0);
  case'drop':return path('M16 2 22 12 28 21 27 27 22 31 10 31 5 27 4 21 10 12Z',m)+path('M15 9 9 21 10 26 14 27 11 21Z',l,'none',0)+circle(21,24,2,c.shine);
  case'heart':return path('M16 10 21 4 27 4 31 10 30 18 16 30 2 18 1 10 5 4 11 4Z',m)+path('M4 10 7 7 10 7 13 11 10 13 7 10 5 15Z',l,'none',0)+line('M6 18H11L14 13 18 24 21 18H27',c.shine,2);
  case'shield':return path('M3 6 16 2 29 6 28 21 23 28 16 32 9 28 4 21Z',s)+path('M8 9 16 6 24 9 23 21 16 27 9 21Z',m)+path('M16 6 24 9 23 21 16 27Z',d,'none',0)+line('M11 10V19L15 23',l);
  case'coin':return circle(16,16,14,d,i)+circle(16,15,11,g,i,1)+circle(16,15,8,l,g,2)+path('M16 8 21 15 16 22 11 15Z',g,d,1)+line('M7 9 9 7M23 23 25 21',c.shine);
  case'clock':return circle(16,16,13,g,i)+circle(16,16,10,l,i)+line('M16 7V16L22 20',d,3)+rect(14,1,4,3,d)+line('M6 16H8M24 16H26M16 24V26',g);
  case'gear':return path('M12 1H20V5L24 7 28 5 32 12 28 15V19L32 22 28 29 24 27 20 29V32H12V29L8 27 4 29 0 22 4 19V15L0 12 4 5 8 7 12 5Z',s)+circle(16,17,9,d,i)+circle(16,17,5,m,i)+circle(14,15,2,l);
  case'book':return path('M3 5 13 3 16 6 19 3 29 5V28L19 26 16 29 13 26 3 28Z',c.wood)+path('M5 5 13 4 16 7 19 4 27 5V24L19 23 16 26 13 23 5 24Z',l)+line('M16 7V26M8 9 12 8M8 13 12 12M20 9 24 10M20 14 24 15M8 18 12 17',d,1.5);
  case'clover':return path('M16 14C0-2-3 20 13 18C-3 35 20 38 17 21C34 37 40 14 21 17C40 1 18-5 16 14Z',m)+line('M16 16 14 28 10 31M8 9 15 16M25 8 18 16M7 25 15 18M25 25 18 18',l,2);
  case'magnet':return path('M3 3H12V17C12 24 20 24 20 17V3H29V19C29 35 3 35 3 19Z',m)+rect(3,3,9,7,l,i)+rect(20,3,9,7,l,i)+line('M7 14V19Q7 28 16 28',d);
  case'cross':return path('M11 3H21V11H29V21H21V29H11V21H3V11H11Z',l)+path('M16 5H19V14H27V18H19V27H16Z',m,'none',0);
  case'arrow':return path('M16 2 29 14 23 18 20 15V30H12V15L9 18 3 14Z',s)+path('M16 3V29H12V15L9 18 5 14Z',l,'none',0)+line('M16 9V25',d);
  case'bounce':return line('M3 27 13 17 22 24 29 9',m,4)+path('M20 8 30 4 31 15Z',l)+circle(13,17,3,g,i)+line('M3 8V18M25 28H31',s,2);
  case'burst':return path('M16 1 20 9 28 4 25 13 32 16 24 20 29 29 20 26 16 33 12 25 3 30 8 20 0 16 8 12 4 3 12 8Z',m)+path('M16 9 22 13 24 19 17 25 9 20 8 14Z',g)+star(16,16,6,c.shine);
  case'crescent':return path('M24 2C6 3-4 21 10 29C19 34 28 28 30 22C12 28 5 11 24 2Z',l)+line('M10 15Q8 24 18 27',m)+star(26,10,4,g);
  case'rune':return path('M7 2H25L30 9V26L25 31H7L2 26V9Z',l)+line('M9 8 22 8 11 23 23 23M8 15H25M16 8V28',d,3)+rect(5,6,2,2,g)+rect(26,26,2,2,g);
  case'chain':return path('M7 4 12 2 19 7 20 14 15 19 8 18 3 12 3 7Z',s)+path('M17 14 24 13 30 19 30 25 25 30 18 29 12 23 12 18Z',m)+line('M10 10 22 23',g,4)+line('M7 7 11 5M23 18 27 22',l);
  case'vial':return path('M11 3H21V11L27 22V28L24 31H8L5 28V22L11 11Z',s)+path('M7 22H25V27L23 29H9L7 27Z',m,'none',0)+rect(10,1,12,5,c.wood,i)+line('M11 14 8 20V25',c.shine)+circle(20,22,2,l);
  case'net':return path('M4 4 26 3 30 26 8 30 2 19Z',d)+line('M4 8 28 24M4 17 19 28M11 4 29 16M19 4 6 23M27 8 12 29M9 4 2 15',l,2)+circle(29,27,3,g,i);
  case'flower':return path('M16 3C9-1 5 6 9 12C-1 9-2 22 10 22C7 33 23 37 23 24C35 27 36 12 24 12C30 2 20-4 16 3Z',m)+circle(17,17,7,g,i)+circle(17,17,3,l)+line('M16 25 16 31',d);
  case'tower':return path('M6 4H12V8H20V4H26V30H6Z',s)+rect(11,22,10,8,d)+rect(10,12,4,5,m)+rect(18,12,4,5,m)+line('M4 30H28M8 20H24',g,2);
  case'anvil':return path('M2 8H25L31 12 25 17 18 18 18 25 24 28V31H5V28L11 25 11 18 4 16Z',s)+path('M3 9H24L28 12H6Z',l,'none',0)+line('M12 18H18M9 29H22',d);
  case'hammer':return path('M4 5 19 2 28 10 24 18 9 19 1 12Z',s)+path('M12 18 19 18 23 29 18 32Z',c.wood)+path('M4 6 17 4 22 8 8 11Z',l,'none',0)+line('M17 23 22 22M19 27 23 26',g);
  case'scope':return circle(16,16,12,d,i)+circle(16,16,8,m,i)+line('M16 1V11M16 21V31M1 16H11M21 16H31',l,3)+circle(16,16,2,g);
  case'orb':return circle(16,16,12,d,i)+circle(15,14,9,m)+path('M9 10 13 7 19 7 15 10Z',l,'none',0)+line('M4 24Q16 29 29 13',g,2)+star(23,5,3,c.shine);
  case'fang':return path('M6 3 18 4 26 10 28 19 23 27 13 31 18 21 15 12 8 10Z',l)+path('M18 4 26 10 28 19 23 27 13 31 21 20 21 13Z',m,'none',0)+line('M8 4 12 7 17 7',g);
  case'bomb':return circle(16,20,11,d,i)+path('M12 9V5H20V9Z',s)+line('M17 5 20 1 26 2',c.wood,3)+star(27,3,5,g)+path('M8 18 10 14 15 12',l,'none',3)+rect(12,23,8,3,m);
  case'boot':return path('M11 2H26V19L31 24V30H4V24L11 19Z',m)+path('M11 3H16V18L9 24H5V26H23L28 24 24 21V5Z',l,'none',0)+line('M6 29H29M13 9H23M13 14H23',d);
  case'quiver':return path('M7 10 11 7 24 9 26 29 11 31Z',c.wood)+line('M12 22V2M18 24V1M23 25V3',s,3)+path('M8 4 12 0 16 4M14 3 18 0 22 3M19 6 23 2 27 6',l)+line('M11 15 24 17M12 27 24 25',g);
  case'circuit':return path('M4 3H28V29H4Z',d)+line('M7 9H13V15H25M7 23H13V18H22V7M18 29V23H25',g,2)+rect(12,11,9,10,m,i)+rect(15,14,3,4,l)+circle(7,9,2,l)+circle(25,23,2,l);
  case'turret':return path('M12 2H20V12H12Z',s)+path('M7 13 12 10H22L28 18V25H5Z',m)+path('M9 25 6 31H1L5 23M23 25 27 31H31L27 23',s)+rect(12,15,8,6,d)+rect(14,16,4,3,l)+line('M14 4H18M8 22H25',g);
  case'hand':return path('M4 14V9L7 7 10 10V4L13 2 16 5 18 2 21 4V10L24 7 27 10V23L22 29H11L6 23Z',c.wood)+line('M11 12V21M17 7V18M23 13V20',l)+path('M9 27H24V31H9Z',m);
  case'wind':return line('M2 10H21Q30 10 26 3Q21-1 19 5M2 17H27Q34 17 29 24M6 25H17Q24 25 21 30',l,3)+line('M1 13H12M9 21H21',m,2);
  case'mountain':return path('M1 29 13 7 21 20 25 14 32 29Z',d)+path('M9 15 13 7 17 14 14 13 12 16Z',l,'none',0)+path('M22 20 25 14 28 21Z',s,'none',0)+line('M7 28 14 20 20 28',m);
  case'spiral':return line('M28 16C28 1 6-2 3 13C-1 33 26 34 25 18C24 6 10 7 10 17C10 25 22 24 19 15L16 17',l,3)+star(28,16,3,g);
  case'dice':return path('M5 3H25L30 8V28H10L5 23Z',m)+path('M5 3 10 8H30L25 3ZM5 3V23L10 28V8Z',d)+circle(15,13,2,l)+circle(25,13,2,l)+circle(20,18,2,l)+circle(15,23,2,l)+circle(25,23,2,l);
  case'lantern':return path('M10 8V5Q16-1 22 5V8',g)+path('M9 8H23L27 14V26L22 31H10L5 26V14Z',s)+path('M11 13H21V27H11Z',d)+group(symbol('flame',c),12,16,.3)+line('M8 15H25M8 25H25',g);
  case'crystal':return gem(16,16,14,c)+line('M4 29H8M26 3H30',c.shine);
  case'crown':return path('M3 8 10 14 16 3 22 14 29 8 27 28H5Z',g)+path('M6 22H26V27H6Z',d)+gem(16,21,4,c)+circle(3,6,2,l)+circle(16,2,2,l)+circle(29,6,2,l);
  case'leaf':return path('M5 29C-3 11 6 1 29 2C30 24 19 34 5 29Z',m)+line('M4 30 25 7M8 23H19M12 17H22M17 12V5',l,2);
  case'hourglass':return path('M5 2H27V6H5ZM5 27H27V31H5Z',c.wood)+path('M8 6H24L22 12 18 16 22 20 24 27H8L10 20 14 16 10 12Z',s)+path('M10 8H22L16 15ZM16 19 11 25H21Z',m,'none',0)+line('M16 14V23',g,1);
  case'mask':return path('M3 3 16 6 29 3 27 22 23 29 16 31 9 29 5 22Z',l)+path('M6 12 13 11 11 17 7 18ZM19 11 26 12 25 18 21 17Z',d)+line('M12 25 16 22 20 25',m,2)+gem(16,8,3,c);
  default:throw new Error('Unknown icon symbol: '+name);
 }
}

function dagger(c:Palette,long=false){return path(long?'M46 8 58 21 54 57 46 63 38 56 40 21Z':'M46 14 56 25 53 53 45 60 37 53 39 25Z',c.metal)+path('M46 15 47 53 39 56 37 53 39 25Z',c.shine,'none',0)+path('M47 19 54 26 52 51 47 56Z',c.steel,'none',0)+line('M46 22V46',c.light)+path('M31 55 43 59 59 55 59 62 45 66 31 62Z',c.gold)+path('M40 65H51V82H40Z',c.wood)+line('M40 69H51M40 74H51M40 79H51',c.dark)+circle(45,84,4,c.gold,c.ink)+gem(45,61,3,c);}
function spear(c:Palette){return path('M44 29H51V85H44Z',c.wood)+line('M46 34V80',c.gold,2)+path('M48 7 62 29 55 44 48 49 39 41 34 29Z',c.metal)+path('M48 8V47L40 40 35 29Z',c.shine,'none',0)+path('M48 10 60 29 53 40 48 46Z',c.mid,'none',0)+line('M48 14V38',c.light)+rect(40,44,16,5,c.gold,c.ink)+line('M43 53H52M43 58H52M43 63H52',c.light);}
function wheel(c:Palette,saw=false){const teeth=saw?Array.from({length:10},(_,j)=>{const a=j*Math.PI/5;return path(`M${48+27*Math.cos(a)} ${45+27*Math.sin(a)} ${48+34*Math.cos(a+.08)} ${45+34*Math.sin(a+.08)} ${48+26*Math.cos(a+.27)} ${45+26*Math.sin(a+.27)}Z`,c.metal);}).join(''):'';return teeth+circle(48,45,28,c.steel,c.ink,3)+circle(48,45,23,c.mid,c.ink)+circle(48,45,17,c.dark,c.ink)+circle(48,45,10,c.gold,c.ink)+gem(48,45,5,c)+line('M29 28 37 36M59 56 66 63M27 54 36 50M58 38 66 33',c.shine,2)+path('M40 75 33 82 52 82',c.light,'none',2);}
function axe(c:Palette,execution=false){return path('M42 21H49V86H42Z',c.wood)+line('M44 39V76',c.gold)+path(execution?'M19 17 39 27 44 18 66 17 77 27 74 48 62 63 42 56 27 49Z':'M14 19 37 29 44 18 65 18 76 27 72 42 58 56 39 50 27 47 17 36Z',c.steel)+path('M14 19 22 30 39 38 60 42 72 33 72 42 58 56 39 50 27 47 17 36Z',c.metal)+path('M16 21 22 31 40 40 59 43 70 36',c.shine,'none',3)+path('M44 20 55 23 57 39 48 48 40 42Z',c.dark)+gem(48,31,6,c)+line('M43 61H50M43 67H50M43 73H50M43 79H50',c.light)+circle(45,84,4,c.gold,c.ink);}
function bow(c:Palette,crossbow=false){return path('M28 16 20 28 17 46 21 67 28 77 32 72 27 60 25 45 29 31 34 21Z',c.wood)+path('M68 16 76 28 79 46 75 67 68 77 64 72 69 60 71 45 67 31 62 21Z',c.wood)+line('M30 18 48 69 66 18',c.light,2)+(crossbow?path('M40 31H56V71L48 84 40 71Z',c.steel)+rect(41,44,14,12,c.dark,c.ink)+gem(48,51,5,c):'')+path('M45 15H51V75H45Z',c.metal)+path('M48 5 59 20 48 17 37 20Z',c.mid)+path('M43 65 48 72 53 65 54 82 48 78 42 82Z',c.mid)+line('M28 26 24 39M68 26 72 39',c.gold,3);}
function turret(c:Palette,electric=false){return path('M31 53 25 77 16 85H30L39 66M60 53 69 76 80 85H64L53 67Z',c.steel)+path('M29 41 38 31H61L73 45 68 65H29L23 53Z',c.mid)+path('M32 47H63V61H32Z',c.dark)+path('M40 18H54V48H40Z',c.steel)+rect(42,16,10,8,c.metal,c.ink)+rect(41,29,12,6,c.gold,c.ink)+gem(48,53,6,c)+line('M29 49V56M63 49V56M23 80H29M68 80H74',c.light,2)+(electric?group(symbol('bolt',c),61,14,.65)+line('M31 42 22 32 28 25',c.light,3):'');}

function weapon(spec:Spec,c:Palette):string{
 switch(spec.shape){
  case'knife':return `<g transform="rotate(35 48 48)">${dagger(c)}</g>`+line('M17 47 25 40M21 60 31 51',c.mid,3);
  case'kunai':return [-24,0,24].map((a,j)=>`<g transform="translate(${(j-1)*17} ${(j===1?-4:6)}) rotate(${a} 48 48)">${path('M48 14 61 43 48 51 35 43Z',c.metal)+path('M48 14V49L36 43Z',c.shine,'none',0)+path('M44 51H52V67H44Z',c.dark)+circle(48,74,7,'none',c.gold,3)+line('M44 55H52M44 61H52',c.mid)}</g>`).join('');
  case'spear':return `<g transform="rotate(30 48 48)">${spear(c)}</g>`;
  case'axe':return `<g transform="rotate(18 48 48)">${axe(c)}</g>`;
  case'boomerang':return path('M13 27 30 23 48 45 67 19 81 25 57 68 45 72Z',c.wood)+path('M16 28 28 26 48 51 69 23 78 26 51 67 46 68Z',c.mid)+line('M23 31 29 30 48 58 71 30',c.light,3)+line('M17 58Q7 75 27 82L24 72M69 76Q85 65 83 49',c.gold,2);
  case'needle':return `<g transform="rotate(28 48 48)">${path('M47 12H49V53H47Z',c.metal)+path('M40 49H56V72L52 78H44L40 72Z',c.mid)+rect(38,45,20,5,c.gold,c.ink)+line('M43 53V68',c.light,3)+rect(42,77,12,4,c.steel,c.ink)}</g>`+group(symbol('drop',c),60,20,.6);
  case'icicle':return [-1,0,1].map((n)=>`<g transform="translate(${n*19} ${Math.abs(n)*8}) rotate(${n*15} 48 48)">${path('M48 12 61 42 55 65 48 78 39 61 36 40Z',c.mid)+path('M48 12V77L40 60 37 41Z',c.light,'none',0)+path('M48 21 56 43 51 62Z',c.shine,'none',0)}</g>`).join('');
  case'flameblade':return group(symbol('flame',c),16,13,2)+`<g transform="rotate(22 48 48)">${dagger(c)}</g>`;
  case'thundernail':return group(symbol('bolt',c),11,20,1.8)+path('M54 12 64 20 49 70 43 72 44 62Z',c.metal)+path('M55 14 57 22 45 68',c.shine,'none',3)+path('M47 10 65 16 68 24 47 21Z',c.steel)+gem(56,17,4,c);
  case'bomb':return group(symbol('bomb',c),14,14,2.1)+line('M14 60H22M75 71 82 77M76 15 80 11',c.mid,2);
  case'seeker':return circle(48,43,26,'none',c.mid,2)+`<g transform="rotate(-32 48 48)">${dagger(c)}</g>`+group(symbol('scope',c),61,56,.65);
  case'bloodblades':return [-1,0,1].map(n=>`<g transform="translate(${n*17} ${Math.abs(n)*7}) rotate(${n*22} 48 48) scale(.82) translate(10 10)">${dagger(c)}</g>`).join('')+group(symbol('drop',c),62,62,.55);
  case'coinblade':return circle(48,45,28,c.gold,c.ink,3)+path('M48 15 55 39 77 45 55 51 48 76 41 51 18 45 41 39Z',c.metal)+circle(48,45,13,c.dark,c.ink)+gem(48,45,7,c)+line('M32 26 27 31M64 61 69 56',c.shine,2);
  case'hexbone':return path('M31 64 21 56 21 48 28 43 36 44 58 22 59 14 65 9 73 10 80 18 77 27 71 30 65 28 44 51 45 59 39 66Z',c.light)+group(symbol('rune',c),45,34,.8)+line('M27 49 34 51M63 15 68 18',c.mid,3);
  case'turret':return turret(c);
  case'splitblade':return path('M47 10 57 25 54 48 48 55 42 48 40 25Z',c.metal)+path('M47 12V51L42 47 41 26Z',c.shine,'none',0)+group(symbol('blade',c),13,39,1.1,-25)+group(symbol('blade',c),55,41,1.1,25)+path('M42 54H54V78H42Z',c.wood)+line('M42 61H54M42 67H54M25 30 33 23M63 21 72 30',c.mid,2);
  case'pinball':return path('M44 48H53V82H44Z',c.wood)+line('M43 67H54M43 74H54',c.gold)+circle(48,36,23,c.steel,c.ink,3)+circle(44,32,15,c.metal)+path('M31 28 36 22 44 19',c.shine,'none',3)+group(symbol('bounce',c),59,51,.7);
  case'drill':return path('M40 43H57V73H40Z',c.steel)+path('M48 9 61 45H35Z',c.metal)+line('M43 21 52 23M40 29 55 33M37 38 59 42',c.dark,3)+rect(35,47,27,8,c.gold,c.ink)+rect(43,59,11,11,c.mid,c.ink)+path('M43 73H54L59 85H38Z',c.wood)+line('M47 12 44 18',c.shine);
  case'crescent':return group(symbol('crescent',c),10,8,2.25)+circle(52,55,9,c.steel,c.ink)+gem(52,55,5,c)+line('M76 70 70 78H58',c.mid,2);
  case'meteor':return `<g transform="rotate(32 48 48)">${spear(c)}</g>`+group(symbol('flame',c),49,8,1.15)+star(17,72,5,c.gold);
  case'scatter':return path('M24 19H70L77 28 69 38H43L38 78H23L30 38H22Z',c.wood)+rect(26,21,47,10,c.steel,c.ink)+rect(47,31,22,8,c.gold,c.ink)+line('M34 43H43M33 51H41M32 59H39',c.dark,3)+[0,1,2].map(j=>path(`M${48+j*13} ${13-j*2}l3-7h5l-2 8Z`,c.light)).join('');
  case'frostwheel':return wheel(c)+group(symbol('snow',c),31,28,1.05);
  case'viper':return path('M27 73C5 36 47 23 69 43C86 62 67 84 46 70L33 60 45 51 56 53 58 62 52 65C76 80 83 41 51 39C27 37 19 53 32 63Z',c.mid)+path('M28 71 19 67 15 58 22 51 32 56 39 63Z',c.dark)+path('M31 67 40 72 46 63 41 54 30 54Z',c.light)+circle(34,58,2,c.ink)+path('M35 66 46 70 43 77Z',c.shine)+line('M23 46 30 42M62 44 68 49',c.light,3);
  case'fireworks':return [-18,0,18].map((a,j)=>`<g transform="translate(${(j-1)*15} 0) rotate(${a} 48 48)">${path('M40 26H53V76H40Z',c.mid)+rect(39,24,15,6,c.gold,c.ink)+rect(39,55,15,8,c.gold,c.ink)+line('M43 34V48',c.light,3)+line('M47 23 50 14',c.wood,3)+star(51,13,5,c.gold)}</g>`).join('');
  case'tesla':return turret(c,true);
  case'saw':return wheel(c,true)+group(symbol('drop',c),64,57,.6);
  case'rain':return group(weapon({shape:'kunai',tag:spec.tag},c),0,0,1)+line('M20 15V28M73 13V26M48 5V10',c.light,3)+path('M17 16 20 11 23 16M70 14 73 9 76 14',c.gold);
  case'mine':return path('M17 60 25 43H70L79 60 76 73H21Z',c.steel)+path('M27 43 34 31H62L69 43Z',c.dark)+circle(48,44,12,c.mid,c.ink)+circle(48,43,7,c.gold,c.ink)+line('M48 20V11M18 41 11 36M78 40 85 35',c.light,3)+rect(20,63,57,6,c.metal,c.ink)+group(symbol('burst',c),64,12,.55);
  case'crossblade':return [-35,35].map(a=>`<g transform="rotate(${a} 48 48)">${dagger(c)}</g>`).join('')+gem(48,51,7,c);
  case'sunlance':return `<g transform="rotate(30 48 48)">${spear(c)}</g>`+circle(62,26,15,'none',c.gold,3)+[0,1,2,3].map(j=>line(`M${14+j*9} ${42+j*4}l6-9`,c.mid,2)).join('')+star(80,13,7,c.shine);
  case'executioner':return axe(c,true)+group(symbol('skull',c),23,21,.72);
  case'echoblade':return line('M17 56Q7 29 25 16M13 62Q2 27 27 11',c.mid,2)+`<g transform="rotate(22 48 48)">${dagger(c,true)}</g>`+group(symbol('blade',c),59,47,.8,30);
  case'shuriken':return path('M48 9 53 35 66 24 65 42 86 48 62 55 72 70 53 64 48 87 40 62 25 72 31 54 9 48 34 41 24 26 41 32Z',c.steel)+path('M48 10 47 44 10 48 34 41 26 27 42 34ZM86 48 49 49 48 86 55 64 70 69 60 54Z',c.metal,'none',0)+circle(48,48,11,c.dark,c.ink)+gem(48,48,6,c)+line('M46 21V33M67 48H76',c.shine,2);
  case'acidjar':return group(symbol('vial',c),14,10,2.1)+group(symbol('skull',c),34,50,.75)+line('M15 33 11 25M79 64 85 67',c.light,3);
  case'glaive':return wheel(c,true)+path('M44 12 48 4 53 12M16 44 8 48 16 52M80 44 88 48 80 52Z',c.light)+group(symbol('eye',c),35,33,.8);
  case'cometbow':return bow(c,true)+line('M16 10 10 21M19 71 10 81M75 14 84 8',c.light,3);
  case'blackhole':return circle(48,46,30,c.dark,c.ink,3)+circle(48,46,22,c.mid)+circle(48,46,17,c.ink)+path('M10 44Q44 12 85 43Q70 68 12 53',c.light,'none',3)+path('M15 47Q50 33 80 46',c.gold,'none',2)+star(25,18,4,c.shine)+star(74,72,4,c.mid);
  case'net':return group(symbol('net',c),12,8,2.1)+path('M62 74H70V87H62Z',c.wood)+line('M17 18 22 12M72 32 79 24',c.light);
  case'prism':return line('M14 62 47 40 83 62M14 62 26 24 47 40 70 20 83 62',c.gold,2)+gem(48,43,21,c)+gem(17,64,7,c)+gem(81,64,7,c)+gem(69,19,6,c)+line('M42 30 38 38',c.shine,3);
  case'starblades':return circle(48,47,27,'none',c.mid,2)+[0,1,2].map(j=>{const a=j*2*Math.PI/3;return group(symbol('blade',c),35+26*Math.cos(a),33+26*Math.sin(a),.85,j*120-30);}).join('')+gem(48,47,9,c)+star(16,76,4,c.gold);
  case'mirrorblade':return path('M21 15 65 12 76 25 72 69 28 73 18 61Z',c.dark)+path('M25 19 63 17 71 27 68 65 30 68 24 58Z',c.mid)+line('M29 48 54 21M40 63 67 34',c.light,3)+`<g transform="rotate(30 48 48)">${dagger(c)}</g>`;
  case'harpoon':return path('M44 37H52V86H44Z',c.wood)+path('M48 8 56 32 70 30 76 18 77 46 64 51 52 45 48 57 42 45 27 51 18 43 20 19 27 31 40 32Z',c.metal)+path('M48 10 48 45 43 42 28 45 24 41 23 27 28 34 42 36Z',c.shine,'none',0)+line('M43 61H53M43 67H53M43 73H53',c.gold)+line('M61 62Q83 64 79 81H68',c.mid,3);
  case'discus':return wheel(c)+line('M14 22H6V74H18M80 22H88V74H76',c.light,3)+star(15,52,4,c.gold);
  case'spore':return path('M20 40Q20 16 48 16Q78 17 78 42L63 49 33 49Z',c.mid)+path('M18 41Q48 32 80 42L76 51H23Z',c.dark)+path('M36 50H60L64 73 55 81H40L32 73Z',c.light)+line('M33 79 24 87M47 81V89M62 77 72 86',c.mid,3)+[29,47,66].map((x,j)=>circle(x,32-j%2*6,4,c.light,c.ink,1)).join('')+circle(48,66,5,c.mid);
  case'shieldblade':return path('M48 9 75 20 74 49 63 71 48 86 31 71 20 49 21 20Z',c.metal)+path('M48 17 67 25 65 47 57 66 48 75 38 66 29 47 30 25Z',c.mid)+path('M48 18V74L57 65 65 46 66 25Z',c.dark,'none',0)+gem(48,42,13,c)+line('M22 65Q10 73 21 85L18 76M75 64Q85 55 83 39',c.light,2);
  case'ropeblade':return line('M23 63Q11 32 37 24Q60 13 72 43Q86 67 53 77',c.gold,3)+group(symbol('blade',c),17,36,1.3,-25)+group(symbol('blade',c),49,11,1.2,30)+group(symbol('blade',c),48,52,1,90)+circle(38,26,4,c.light,c.ink);
  case'icewall':return path('M14 74H83V83H14Z',c.steel)+[22,42,63].map((x,j)=>path(`M${x} ${29-j*8}l9-17 12 17-3 44h-14Z`,c.mid)+path(`M${x+9} ${13-j*8}v59h-5l-2-42Z`,c.light,'none',0)+line(`M${x+10} 42l7 7`,c.shine)).join('')+line('M10 85H85',c.light,2);
  case'moth':return path('M43 43Q16 2 12 32L21 52 12 63 31 74 46 57 48 48 51 57 66 74 84 63 75 52 85 30Q78 8 53 43Z',c.mid)+path('M42 43 19 24 25 42 39 50ZM55 43 76 24 71 42 58 50Z',c.gold)+path('M42 50 26 58 32 65 43 56ZM54 50 70 58 64 65 53 56Z',c.dark)+path('M43 29H53V69L48 77 43 69Z',c.steel)+gem(48,44,5,c)+line('M45 30 35 18M51 30 61 18',c.light,2);
  case'fusecord':return line('M26 19Q78 7 63 37Q17 47 32 68Q38 81 64 80',c.gold,3)+[0,1,2].map(j=>group(symbol('bomb',c),[12,50,19][j],[8,26,54][j],.85)).join('')+star(66,80,5,c.shine);
  case'portalgun':return circle(67,27,18,'none',c.mid,5)+circle(28,68,16,'none',c.light,3)+`<g transform="rotate(35 48 48)">${spear(c)}</g>`+line('M12 19 28 19M70 77H84',c.gold,3);
  case'tidebow':return bow(c)+line('M13 67Q25 53 38 65Q51 79 63 65Q74 52 84 64M18 77Q28 65 42 77Q55 89 70 77',c.light,3);
  case'pendulum':return line('M46 12V39M52 12V39',c.gold,3)+rect(39,10,21,7,c.steel,c.ink)+path('M25 45 43 34H58L73 47 69 70 51 82 33 75 24 59Z',c.steel)+path('M27 46 43 38 55 39 43 54 28 60Z',c.metal,'none',0)+gem(50,59,14,c)+line('M14 54Q8 77 27 84M78 45Q87 70 72 82',c.mid,2);
  case'razorball':return wheel(c,true)+path('M28 26 37 18 45 32 57 28 62 41 75 45 62 53 61 69 49 60 35 70 34 55 20 49 33 42Z',c.steel)+circle(48,46,14,c.dark,c.ink)+gem(48,46,7,c);
  case'syringe':return `<g transform="rotate(35 48 48)">${path('M47 8H49V33H47Z',c.metal)+rect(38,32,20,39,c.metal,c.ink)+rect(41,44,14,25,c.mid,c.ink)+rect(34,30,28,5,c.gold,c.ink)+rect(42,72,12,11,c.steel,c.ink)+rect(36,83,24,5,c.gold,c.ink)+line('M43 38V61',c.shine,3)+line('M50 40H57M50 49H57M50 58H57',c.dark)}</g>`;
  case'hourglass':return group(symbol('hourglass',c),14,9,2.1)+line('M17 42 10 50M78 34 85 26',c.light,3)+star(76,75,4,c.gold);
  case'sigil':return circle(48,47,30,c.dark,c.ink,3)+circle(48,47,24,'none',c.gold,2)+path('M48 22 69 35 69 60 48 73 27 60 27 35Z',c.mid)+group(symbol('rune',c),30,29,1.15)+[0,1,2,3].map(j=>star(48+33*Math.cos(j*Math.PI/2),47+33*Math.sin(j*Math.PI/2),4,c.light)).join('');
  default:throw new Error('Unknown weapon illustration: '+spec.shape);
 }
}

function head(shape:string,c:Palette):string{
 const hood=()=>path('M23 69 25 31 35 17 48 11 62 17 72 31 75 70 61 80 35 80Z',c.mid)+path('M30 61 35 31 47 21 60 30 67 61 57 70 39 70Z',c.dark)+path('M35 40 47 31 59 40 58 59 48 65 37 59Z',c.ink)+line('M28 56 29 33 38 23M63 69 71 63',c.light,3)+path('M31 69 48 76 65 69 64 81H32Z',c.gold)+gem(48,77,4,c);
 const helm=()=>path('M24 64 24 34 31 22 48 16 66 22 74 34V64L65 75H58V58H38V75H30Z',c.steel)+path('M27 34 35 25 48 21 62 26 69 35V47H27Z',c.metal)+path('M30 49H66V57H30Z',c.dark)+path('M44 19H52V67H44Z',c.gold)+line('M31 33 38 29M58 29 64 33M30 66 35 61M61 61 66 66',c.shine,3)+gem(48,35,5,c);
 const cap=()=>path('M25 56 27 32 37 24H62L71 35 69 58Z',c.mid)+path('M16 58 26 52 70 51 81 58 72 66H24Z',c.dark)+line('M32 43V32H42',c.light,3)+rect(27,48,43,6,c.gold,c.ink);
 switch(shape){
  case'hood':return hood()+group(symbol('feather',c),62,12,.72);
  case'moonhood':return hood()+group(symbol('crescent',c),36,28,.75)+line('M24 69 19 76M74 67 80 74',c.gold,2);
  case'emberhood':return hood()+group(symbol('flame',c),35,30,.8)+path('M29 17 31 29 40 20Z',c.gold)+path('M62 18 69 28 72 15Z',c.gold);
  case'veil':return path('M24 23 47 12 70 23 77 47 68 80H28L18 47Z',c.mid)+path('M27 35 48 26 68 35 64 50 32 50Z',c.dark)+line('M26 52 34 73M37 54 43 77M50 54 54 77M63 54 65 73',c.light,2)+path('M28 38 41 41 37 47 29 45ZM55 41 67 37 64 45 58 47Z',c.shine)+gem(48,23,6,c);
  case'ravenmask':return path('M21 27 34 17 61 17 74 28 69 55 59 65 37 66 27 56Z',c.dark)+path('M27 32 41 27 55 27 68 32 59 47 46 45 35 50Z',c.mid)+path('M43 43 54 40 67 51 63 75 46 64 38 53Z',c.steel)+path('M47 46 57 46 62 66 48 60Z',c.metal,'none',0)+path('M26 33 38 36 35 43 28 42ZM57 35 67 31 65 40 58 42Z',c.shine)+group(symbol('feather',c),16,8,.65);
  case'plaguemask':return path('M27 17 61 17 71 31 67 62 52 76 30 65 22 43Z',c.light)+circle(34,35,10,c.gold,c.ink)+circle(35,35,6,c.dark,c.ink)+path('M46 41 60 36 82 52 72 64 56 64 44 55Z',c.wood)+path('M58 42 77 53 70 58 57 55Z',c.metal)+[0,1,2].map(j=>circle(56+j*6,51+j*2,1.8,c.ink)).join('')+line('M27 51 31 61',c.mid,3);
  case'crown':return group(symbol('crown',c),14,11,2.1)+group(symbol('snow',c),37,58,.7);
  case'goldcrown':return group(symbol('crown',c),12,7,2.25)+[29,49,69].map((x,j)=>gem(x,64,4,{...c,mid:j===1?'#d98c7b':c.mid})).join('');
  case'goggles':return path('M15 35H80V60H15Z',c.wood)+circle(32,48,17,c.gold,c.ink)+circle(64,48,17,c.gold,c.ink)+circle(32,48,12,c.dark,c.ink)+circle(64,48,12,c.dark,c.ink)+circle(31,46,8,c.mid)+circle(63,46,8,c.mid)+line('M24 44 31 38M56 44 63 38',c.shine,3)+rect(45,44,8,7,c.steel,c.ink)+line('M30 26V17M65 26V17M21 18 32 14M64 14 75 18',c.gold,3);
  case'clockglasses':return path('M11 39H85V51H11Z',c.wood)+group(symbol('clock',c),13,27,1.2)+group(symbol('gear',c),48,26,1.2)+line('M43 45H50',c.gold,4)+path('M20 65H39M58 65H75',c.steel,'none',3);
  case'helmet':return helm()+path('M45 17 46 7 53 7 55 18Z',c.mid)+circle(26,52,3,c.gold,c.ink)+circle(71,52,3,c.gold,c.ink);
  case'warhelm':return helm()+path('M29 24 16 17 16 40 25 43M66 24 80 17 80 40 71 43Z',c.wood)+group(symbol('drop',c),38,57,.65);
  case'circuithelm':return helm()+line('M25 37H34V29H40M54 28H64V37H73',c.mid,3)+circle(24,38,5,c.gold,c.ink)+circle(73,38,5,c.gold,c.ink)+line('M48 16V7H65',c.light,2);
  case'halo':return circle(48,41,28,c.gold,c.ink,3)+circle(48,41,23,c.dark,c.ink)+path('M21 44 31 51 48 45 64 51 75 44 73 58 48 65 24 58Z',c.metal)+gem(48,49,10,c)+[22,48,74].map((x,j)=>star(x,[20,9,20][j],5,c.light)).join('');
  case'hexmask':return group(symbol('mask',c),15,10,2.1)+path('M21 17 12 9 15 33M75 17 84 9 80 34Z',c.gold)+line('M28 56 36 51M59 51 68 56',c.mid,3);
  case'hat':return cap()+group(symbol('clover',c),47,24,.75)+path('M30 25 26 14 32 9 40 25Z',c.light);
  case'tophat':return path('M25 18H68L66 62H27Z',c.dark)+path('M28 19H62L60 50H30Z',c.mid,'none',0)+rect(26,49,41,10,c.gold,c.ink)+path('M14 63 27 58H67L82 63 73 73H22Z',c.wood)+group(symbol('coin',c),41,45,.6)+line('M32 24V42',c.light,3);
  case'icemask':return path('M18 38 28 18 47 10 70 22 79 42 69 69 47 82 27 67Z',c.metal)+path('M23 37 38 26 46 38 57 26 73 38 64 59 47 67 31 58Z',c.mid)+path('M24 39 39 38 35 47 27 48ZM56 38 71 39 68 48 60 47Z',c.dark)+gem(47,24,9,c)+line('M39 65 47 73 56 64',c.light,2);
  case'thornveil':return head('veil',c)+line('M22 32 16 26 22 21 24 16M73 35 80 29 76 20M29 77 24 87M64 78 70 85',c.dark,3)+group(symbol('flower',c),39,12,.65);
  default:throw new Error('Unknown head icon: '+shape);
 }
}

function armor(shape:string,c:Palette):string{
 const plate=()=>path('M30 16 42 23H54L66 16 82 28 74 45 65 39 68 78 56 86H37L25 78 30 39 19 45 12 28Z',c.steel)+path('M31 25 42 31H54L65 25 62 68 54 77H40L31 68Z',c.metal)+path('M47 31H54L63 26 60 64 52 75H47Z',c.mid,'none',0)+path('M21 24 32 23 29 38 19 39 15 29ZM64 23 76 25 79 29 73 39 66 37Z',c.mid)+line('M31 49H62M31 59H61M37 80H58',c.dark,2)+[30,65].map(x=>circle(x,30,3,c.gold,c.ink)).join('');
 const coat=(long=false)=>path(`M34 14 44 22H52L63 14 78 23 85 47 72 51 66 38 69 ${long?83:74}H27L30 38 23 51 10 47 18 23Z`,c.mid)+path(`M35 18 44 25 40 42 35 ${long?82:72}H28L31 38Z`,c.light)+path(`M61 18 52 25 55 42 61 ${long?82:72}H68L65 38Z`,c.dark)+line('M48 31V72M23 30 19 41M73 30 77 41',c.light,2)+rect(28,53,39,7,c.wood,c.ink)+rect(43,52,10,9,c.gold,c.ink)+[39,47,65].map(y=>circle(50,y,2,c.gold,c.ink,1)).join('');
 switch(shape){
  case'leather':return coat()+path('M29 26 39 25V44H29ZM57 25H66V44H57Z',c.wood)+line('M31 29H36M59 29H64M31 64H41M55 64H65',c.gold,2);
  case'plate':return plate()+gem(47,39,6,c);
  case'thorncoat':return coat(true)+line('M29 69 18 64 22 59 14 53M66 68 77 63 73 58 82 52M31 30 23 18 27 14M64 31 74 19 69 12',c.dark,3)+group(symbol('leaf',c),40,27,.6);
  case'bloodcoat':return coat(true)+path('M29 20 41 28 35 36 28 33ZM67 20 53 28 59 36 67 33Z',c.wood)+group(symbol('heart',c),38,33,.7)+line('M29 73 35 79 42 75M55 75 61 79 67 73',c.gold,2);
  case'chainmail':return plate()+Array.from({length:4},(_,r)=>Array.from({length:5},(_,k)=>circle(34+k*7,36+r*8,3,'none',r%2?c.dark:c.steel,1.5)).join('')).join('')+group(symbol('orb',c),39,29,.65);
  case'frostplate':return plate()+path('M24 24 23 13 33 22 38 12 42 27M61 24 66 13 70 23 78 17 77 30Z',c.light)+group(symbol('snow',c),36,35,.8)+line('M34 69 42 61 49 69 57 61',c.mid,2);
  case'apron':return path('M36 15H59L63 38 73 80H22L31 38Z',c.light)+line('M36 15 40 8H55L59 15M28 43 17 37M66 43 79 37',c.wood,4)+path('M34 50H60V68H34Z',c.mid)+line('M37 54H57M37 61H57',c.dark,2)+rect(35,37,24,5,c.gold,c.ink)+group(symbol('flame',c),39,21,.6);
  case'labcoat':return coat(true)+path('M34 17 44 25 37 44 27 31ZM62 17 52 25 60 44 69 31Z',c.shine)+rect(30,57,12,15,c.light,c.ink)+rect(56,57,12,15,c.light,c.ink)+group(symbol('vial',c),28,51,.52)+line('M43 25 47 35 53 25',c.gold,2);
  case'enginevest':return coat()+rect(29,31,13,18,c.wood,c.ink)+rect(56,31,13,18,c.wood,c.ink)+group(symbol('gear',c),38,33,.7)+rect(31,64,12,10,c.steel,c.ink)+rect(55,64,12,10,c.steel,c.ink)+line('M39 19 33 30M58 19 63 30',c.gold,3);
  case'bombvest':return coat()+[29,42,55].map(x=>rect(x,31,10,27,c.wood,c.ink)+rect(x-1,37,12,5,c.gold,c.ink)+line(`M${x+5} 30V24`,c.light,2)).join('')+group(symbol('bomb',c),53,51,.65);
  case'goldplate':return plate()+path('M28 46 47 53 67 46 64 67 48 76 31 67Z',c.gold)+group(symbol('coin',c),37,34,.75)+line('M18 29 25 27M73 27 79 30',c.light,3);
  case'voidrobe':return coat(true)+path('M27 69 35 77 43 67 49 78 58 68 66 80 70 84H25Z',c.dark)+group(symbol('rune',c),35,30,.82)+line('M20 19 12 14M79 23 85 17',c.light,2);
  case'mirrorplate':return plate()+path('M29 35 47 25 64 35 60 58 47 72 33 58Z',c.mid)+line('M33 49 52 31M41 62 60 43',c.shine,3)+line('M25 66 31 73M64 73 71 65',c.gold,2);
  case'robe':return coat(true)+path('M34 14 48 23 63 14 64 30 48 39 32 30Z',c.dark)+group(symbol('feather',c),37,34,.7)+line('M30 76 36 71M61 71 67 76',c.gold,2);
  case'cloak':return path('M48 13 66 22 80 78 69 83 59 77 48 84 37 77 26 83 15 78 31 22Z',c.mid)+path('M48 17 35 26 23 78 37 74 48 82Z',c.light,'none',0)+path('M48 17 61 26 73 78 59 74 48 82Z',c.dark,'none',0)+path('M35 22 48 30 61 22 59 36 48 42 37 36Z',c.gold)+gem(48,32,6,c)+line('M41 47 34 67M57 47 65 67',c.mid,3);
  case'circuitcoat':return armor('enginevest',c)+line('M25 66H35V75H42M54 75H62V65H72',c.gold,2)+circle(26,66,3,c.light,c.ink)+circle(72,65,3,c.light,c.ink);
  case'warplate':return plate()+path('M19 27 21 13 30 22M66 22 76 13 78 29Z',c.wood)+group(symbol('drop',c),36,32,.85)+path('M29 78 22 87 36 85M64 78 73 87 60 85Z',c.gold);
  case'merchantrobe':return coat(true)+path('M34 17 44 25 39 40 29 30ZM61 17 52 25 58 40 68 30Z',c.gold)+group(symbol('book',c),52,59,.63)+line('M35 67V77M39 67V77',c.gold,2);
  default:throw new Error('Unknown armor icon: '+shape);
 }
}

function boots(shape:string,c:Palette):string{
 const tall=['heavyboots','bloodboots','warboots','iceboots'].includes(shape),top=tall?17:29;
 const pair=[-1,1].map((side)=>`<g transform="${side===-1?'translate(4 0)':'translate(91 4) scale(-1 1)'}">${path(`M16 ${top}H36V56L45 68V78H7V66L16 56Z`,c.mid)+path(`M17 ${top+3}H24V53L13 64H9V70H34L41 68 33 57V${top+3}Z`,c.light,'none',0)+path('M8 72H43V78H8Z',c.dark)+line(`M18 ${top+7}H34M19 ${top+13}H33M19 ${top+19}H33`,c.wood,3)+rect(18,52,18,6,c.gold,c.ink)+rect(25,52,6,6,c.steel,c.ink)+line('M12 70H19M24 70H33',c.shine,2)}</g>`).join('');
 switch(shape){
  case'wingboots':return pair+group(symbol('wing',c),4,39,.85,-25)+group(symbol('wing',c),63,40,.85,25);
  case'heavyboots':return pair+path('M13 19H38V32H13ZM58 22H83V35H58Z',c.steel)+[18,30,63,75].map(x=>circle(x,24,2,c.gold,c.ink,1)).join('')+path('M12 64 37 62 45 68 43 76H8Z',c.metal)+path('M58 68 80 66 87 72 84 79H53Z',c.metal);
  case'ghostboots':return pair+path('M8 76 6 85 14 81 23 87 31 80 42 86 44 74Z',c.light)+star(13,24,5,c.shine)+star(83,45,4,c.light)+line('M15 17 11 10M78 23 84 16',c.mid,2);
  case'bloodboots':return pair+group(symbol('drop',c),17,26,.48)+group(symbol('drop',c),63,30,.48)+line('M18 61 27 69M64 64 76 72',c.dark,3);
  case'magnetboots':return pair+group(symbol('magnet',c),29,8,1.08)+line('M12 45 7 40M85 48 91 43M49 49V63',c.gold,2);
  case'iceboots':return pair+path('M7 65 2 51 13 57 19 47 25 62M80 64 86 50 91 63 89 75Z',c.light)+group(symbol('snow',c),34,9,.85);
  case'fireboots':return pair+group(symbol('flame',c),4,43,1)+group(symbol('flame',c),64,40,1)+line('M36 18 39 10M57 20 63 12',c.gold,2);
  case'coilboots':return pair+group(symbol('bolt',c),34,8,.9)+path('M15 28H41V43H15ZM55 32H81V47H55Z',c.steel)+line('M20 30V41M27 30V41M34 30V41M59 35V44M66 35V44M73 35V44',c.gold,2);
  case'moonboots':return pair+group(symbol('crescent',c),30,8,1.1)+path('M16 31 36 31 33 47 18 47ZM61 36H80L77 52H63Z',c.dark)+star(27,41,4,c.light)+star(71,44,4,c.light);
  case'goldboots':return pair+group(symbol('coin',c),32,5,1.02)+[13,47,80].map((x,j)=>circle(x,82-j*6,4,c.gold,c.ink)).join('');
  case'hexboots':return pair+path('M17 25 10 11 28 17 40 9 38 31M61 29 55 15 68 20 82 12 83 35Z',c.dark)+group(symbol('rune',c),35,28,.65)+line('M14 66 26 71M63 71 77 75',c.gold,2);
  case'furboots':return pair+path('M14 29 18 24 23 29 28 24 33 29 38 25 41 33 38 40H13ZM58 32 62 27 67 32 72 27 77 32 82 28 85 36 82 43H57Z',c.shine)+path('M19 21 16 8 21 3 27 17M65 24 67 8 73 5 73 22Z',c.light)+line('M17 62H25M64 67H73',c.wood,3);
  case'rootboots':return pair+line('M14 52 6 55 8 65 4 73M81 54 87 59 85 72 92 78M20 81 12 87M32 81 37 88',c.dark,3)+group(symbol('leaf',c),33,7,1);
  case'warboots':return boots('heavyboots',c)+group(symbol('blade',c),30,4,.9,15)+path('M14 33 4 30 11 44M82 34 92 29 87 48Z',c.wood);
  case'softboots':return pair+path('M16 28H37V40H16ZM60 33H81V45H60Z',c.wood)+line('M20 30V39M26 30V39M32 30V39M64 35V43M70 35V43M76 35V43',c.gold,1.5)+group(symbol('clover',c),32,4,1);
  default:throw new Error('Unknown boots icon: '+shape);
 }
}

function equipment(spec:Spec,c:Palette){
 let body='';
 const heads=['hood','moonhood','emberhood','veil','ravenmask','plaguemask','crown','goldcrown','goggles','clockglasses','helmet','warhelm','circuithelm','halo','hexmask','hat','tophat','icemask','thornveil'];
 const armors=['leather','plate','thorncoat','bloodcoat','chainmail','frostplate','apron','labcoat','enginevest','bombvest','goldplate','voidrobe','mirrorplate','robe','cloak','circuitcoat','warplate','merchantrobe'];
 if(heads.includes(spec.shape))body=head(spec.shape,c);
 else if(armors.includes(spec.shape))body=armor(spec.shape,c);
 else if(spec.shape.endsWith('boots'))body=boots(spec.shape,c);
 else{
  const chain=line('M28 13Q22 29 39 37M67 13Q74 30 56 37',c.gold,3)+[0,1,2].map(j=>circle(29-j*2,18+j*6,2,c.light,c.ink,1)).join('');
  switch(spec.shape){
   case'pendant':body=chain+path('M48 31 68 44 62 70 48 83 33 70 27 44Z',c.gold)+gem(48,56,21,c);break;
   case'splitgem':body=gem(34,48,19,c)+gem(65,61,17,c)+line('M41 35 45 44 38 54 43 64',c.ink,3)+star(74,26,5,c.light);break;
   case'badge':body=chain+path('M48 31 71 42 69 66 48 82 26 66 25 42Z',c.metal)+group(symbol(spec.mark||'arrow',c),31,40,1.1);break;
   case'spring':body=path('M25 29 35 18H60L71 29 71 69 60 80H35L25 69Z',c.steel)+line('M27 32 68 42 28 50 68 58 28 66',c.mid,6)+line('M28 30 68 40M28 48 68 56M29 64 62 71',c.light,2)+rect(23,21,50,7,c.gold,c.ink)+rect(24,72,47,7,c.gold,c.ink);break;
   case'fang':body=chain+group(symbol('fang',c),15,22,2)+group(symbol('drop',c),62,65,.65);break;
   case'crystal':body=gem(48,45,29,c)+path('M26 75 20 59 37 68M67 68 80 58 72 78Z',c.light)+star(17,30,5,c.shine)+star(79,74,4,c.light);break;
   case'flint':body=path('M24 52 36 29 52 20 66 31 71 56 61 73 37 78 23 68Z',c.steel)+path('M25 52 39 33 49 29 43 55 34 72 25 67Z',c.metal,'none',0)+path('M49 29 62 35 65 52 50 59 43 55Z',c.dark,'none',0)+group(symbol('flame',c),55,47,1)+star(22,25,6,c.gold);break;
   case'jar':body=group(symbol('vial',c),15,7,2.1)+group(symbol('bolt',c),38,39,.7);break;
   case'fuse':body=group(symbol('bomb',c),13,17,2)+line('M48 27Q42 8 66 10Q79 11 75 25',c.wood,4)+star(76,25,7,c.light);break;
   case'gearheart':body=group(symbol('gear',c),12,10,2.25)+group(symbol('heart',c),31,28,1.16)+line('M16 59H24M70 64H79',c.gold,3);break;
   case'moonstone':body=chain+group(symbol('crescent',c),15,26,1.9)+gem(58,56,16,c)+group(symbol('drop',c),59,57,.63);break;
   case'hexcoin':body=chain+group(symbol('coin',c),16,21,2.05)+group(symbol('mask',c),29,34,1.2)+path('M21 29 16 14 31 23M68 28 79 14 76 36Z',c.gold);break;
   case'ring':body=circle(48,58,23,c.gold,c.ink,4)+circle(48,58,15,c.dark,c.ink)+gem(48,34,14,c)+group(symbol('feather',c),42,19,.6);break;
   case'fireseed':body=path('M22 73 18 54 35 38 48 31 64 41 78 55 73 75Z',c.wood)+group(symbol('flame',c),15,4,2.2)+line('M27 59 38 68 55 71M64 55 71 64',c.gold,3);break;
   case'phial':body=group(symbol('vial',c),15,9,2.2)+path('M17 41 24 33 29 39 24 44ZM71 49 79 42 84 49 77 55Z',c.gold)+group(symbol('leaf',c),39,50,.65);break;
   case'watch':body=chain+group(symbol('clock',c),16,23,2.03)+group(symbol('gear',c),62,61,.67);break;
   case'eclipse':body=chain+circle(48,55,27,c.gold,c.ink,3)+circle(48,55,22,c.mid)+circle(57,49,21,c.dark,c.ink)+star(34,57,6,c.light)+line('M24 30 19 25M71 75 78 83',c.gold,2);break;
   case'bloodbadge':body=chain+path('M48 31 74 43 67 72 48 86 28 72 21 43Z',c.steel)+group(symbol('heart',c),28,40,1.3)+path('M24 44 18 34 32 39M65 39 78 32 72 48Z',c.gold);break;
   case'chip':body=chain+circle(48,56,27,c.dark,c.ink,3)+circle(48,56,22,c.gold)+circle(48,56,16,c.mid,c.ink)+group(symbol('dice',c),32,40,1)+Array.from({length:8},(_,j)=>`<g transform="rotate(${j*45} 48 56)">${rect(45,29,6,6,c.light,c.ink)}</g>`).join('');break;
   default:throw new Error('Unknown charm icon: '+spec.shape);
  }
 }
 if(spec.mark&&!['badge'].includes(spec.shape))body+=circle(72,72,13,c.dark,c.ink)+group(symbol(spec.mark,c),62,62,.63);
 return body;
}

function passive(spec:Spec,c:Palette){
 const main=group(symbol(spec.shape,c),20,17,1.75);
 const secondary=spec.mark?circle(70,69,17,c.dark,c.ink,2)+group(symbol(spec.mark,c),57,56,.8):'';
 const aura=spec.accent==='rays'?line('M20 15 25 20M73 15 68 21M13 49H20M77 45H85M22 77 28 72',c.gold,2):spec.accent==='orbit'?`<ellipse cx="48" cy="47" rx="37" ry="19" transform="rotate(-30 48 47)" fill="none" stroke="${c.mid}" stroke-width="2"/>`:spec.accent==='shards'?path('M15 27 23 22 22 35ZM76 18 85 27 76 33ZM16 68 21 80 29 72Z',c.light):line('M15 31 20 24M78 37 83 44',c.mid,2);
 return aura+main+secondary+star(19,74,4,c.light);
}

function frame(kind:ItemIconKind,c:Palette,id:string){
 const bg=mix(c.dark,'#182332',.62);
 const gradients=`<defs><linearGradient id="b-${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${mix(c.dark,'#8492a5',.2)}"/><stop offset="1" stop-color="${bg}"/></linearGradient><radialGradient id="h-${id}"><stop stop-color="${c.mid}" stop-opacity=".25"/><stop offset="1" stop-color="${c.mid}" stop-opacity="0"/></radialGradient></defs>`;
 const base=kind==='passive'?path('M29 4H67L91 28V67L67 91H29L5 67V28Z',c.ink,'#15202c',2)+path('M30 8H66L87 29V66L66 87H30L9 66V29Z',`url(#b-${id})`,c.dark,2)+circle(48,48,36,'none',c.gold,1.5):path('M16 5H80L91 16V80L80 91H16L5 80V16Z',c.ink,'#15202c',2)+path('M17 9H79L87 17V79L79 87H17L9 79V17Z',`url(#b-${id})`,c.dark,2)+line('M17 13H77L83 19M13 18V77L19 83',c.light,1.5);
 return gradients+base+circle(48,47,34,`url(#h-${id})`)+line('M22 81H74',mix(c.dark,c.ink,.5),1)+circle(48,64,23,c.ink)+rivets(c);
}

export function itemIconSVG(kind:ItemIconKind,id:string,framed=true){
 const catalog=kind==='weapon'?WEAPON_ART:kind==='equipment'?GEAR_ART:PASSIVE_ART;
 const spec=catalog[id];if(!spec)throw new Error('Missing '+kind+' art: '+id);
 const c=palette(spec.tag),art=kind==='weapon'?weapon(spec,c):kind==='equipment'?equipment(spec,c):passive(spec,c);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img" aria-label="${kind} ${id}">${framed?frame(kind,c,kind+'-'+id):''}<g>${art}</g>${framed?star(77,18,3,c.shine):''}</svg>`;
}

const a=(shape:string,tag:Tag,mark?:string,accent?:string):Spec=>({shape,tag,mark,accent});
export const WEAPON_ART:Record<string,Spec>={
 knife:a('knife','speed'),kunai:a('kunai','speed'),spear:a('spear','pierce'),axe:a('axe','heavy'),boomerang:a('boomerang','return'),
 venom:a('needle','poison'),icicle:a('icicle','ice'),ember:a('flameblade','fire'),thunder:a('thundernail','lightning'),bomb:a('bomb','explosion'),
 seeker:a('seeker','luck'),blooddagger:a('bloodblades','blood'),coinblade:a('coinblade','gold'),hex:a('hexbone','curse'),sentry:a('turret','turret'),
 shatter:a('splitblade','pierce'),pinball:a('pinball','bounce'),drill:a('drill','pierce'),crescent:a('crescent','return'),meteor:a('meteor','heavy'),
 scatter:a('scatter','heavy'),frostwheel:a('frostwheel','ice'),viper:a('viper','poison'),firework:a('fireworks','explosion'),tesla:a('tesla','turret'),
 saw:a('saw','blood'),rain:a('rain','pierce'),mine:a('mine','explosion'),cross:a('crossblade','speed'),sun:a('sunlance','fire'),
 executioner:a('executioner','heavy'),echo:a('echoblade','return'),stormstar:a('shuriken','lightning'),acid:a('acidjar','poison'),glaive:a('glaive','return'),comet:a('cometbow','speed'),
 singularity:a('blackhole','control'),silknet:a('net','control'),conduit:a('prism','lightning'),starward:a('starblades','summon'),glassknife:a('mirrorblade','crit'),anchor:a('harpoon','return'),wallring:a('discus','bounce'),sporeseed:a('spore','poison'),
 rampart:a('shieldblade','shield'),cometrope:a('ropeblade','bounce'),icebridge:a('icewall','ice'),firemoth:a('moth','summon'),dynamitecord:a('fusecord','explosion'),iongate:a('portalgun','pierce'),tidebow:a('tidebow','control'),pendulum:a('pendulum','heavy'),razorball:a('razorball','heavy'),medicneedle:a('syringe','blood'),hexhour:a('hourglass','curse'),reaperseal:a('sigil','crit')
};

export const GEAR_ART:Record<string,Spec>={
 scout:a('hood','crit','eye'),crow:a('ravenmask','return','crescent'),plague:a('plaguemask','poison','vial'),crown:a('crown','ice'),emberhood:a('emberhood','fire'),coil:a('goggles','lightning','bolt'),smith:a('helmet','heavy','anvil'),clock:a('clockglasses','turret'),halo:a('halo','shield','shield'),goldcrown:a('goldcrown','gold','coin'),hexmask:a('hexmask','curse','rune'),luckhat:a('hat','luck'),assassin:a('veil','crit','blade'),
 leather:a('leather','shield','heart'),iron:a('plate','heavy','hammer'),thorns:a('thorncoat','shield','leaf'),bloodcoat:a('bloodcoat','blood'),soulmail:a('chainmail','shield','orb'),frostmail:a('frostplate','ice'),firecoat:a('apron','fire','flame'),labcoat:a('labcoat','poison'),enginecoat:a('enginevest','turret','gear'),bombvest:a('bombvest','explosion'),greedmail:a('goldplate','gold','rune'),voidrobe:a('voidrobe','curse'),mirror:a('mirrorplate','shield','crystal'),
 runner:a('wingboots','speed'),anchor:a('heavyboots','heavy','anvil'),ghost:a('ghostboots','pierce'),bloodstep:a('bloodboots','blood'),magnetboot:a('magnetboots','luck'),icewalk:a('iceboots','ice'),firewalk:a('fireboots','fire'),coilboot:a('coilboots','lightning'),returnboot:a('moonboots','return'),goldstep:a('goldboots','gold'),hexstep:a('hexboots','curse'),luckstep:a('furboots','luck'),
 ruby:a('pendant','crit','burst'),splitgem:a('splitgem','speed'),needle:a('badge','pierce','arrow'),rubber:a('spring','bounce'),tooth:a('fang','poison'),icegem:a('crystal','ice','snow'),flint:a('flint','fire'),battery:a('jar','lightning'),fuse:a('fuse','explosion'),gearheart:a('gearheart','turret'),vampire:a('moonstone','blood'),hexcoin:a('hexcoin','curse'),
 'set-gale-head':a('hood','speed','wing'),'set-gale-body':a('robe','speed','arrow'),'set-gale-boots':a('wingboots','speed','wind'),'set-gale-charm':a('ring','speed'),
 'set-glacier-head':a('icemask','shield','snow'),'set-glacier-body':a('frostplate','shield','shield'),'set-glacier-boots':a('iceboots','shield','shield'),'set-glacier-charm':a('crystal','shield','shield'),
 'set-cinder-head':a('goldcrown','fire','flame'),'set-cinder-body':a('apron','fire','burst'),'set-cinder-boots':a('fireboots','fire','wind'),'set-cinder-charm':a('fireseed','fire'),
 'set-briar-head':a('thornveil','poison'),'set-briar-body':a('thorncoat','poison','vial'),'set-briar-boots':a('rootboots','poison'),'set-briar-charm':a('phial','poison'),
 'set-circuit-head':a('circuithelm','turret'),'set-circuit-body':a('circuitcoat','turret'),'set-circuit-boots':a('coilboots','turret','shield'),'set-circuit-charm':a('watch','turret'),
 'set-lunar-head':a('moonhood','return'),'set-lunar-body':a('cloak','return','crescent'),'set-lunar-boots':a('moonboots','return','wind'),'set-lunar-charm':a('eclipse','return'),
 'set-warborn-head':a('warhelm','heavy'),'set-warborn-body':a('warplate','heavy','heart'),'set-warborn-boots':a('warboots','heavy'),'set-warborn-charm':a('bloodbadge','heavy'),
 'set-fortune-head':a('tophat','gold'),'set-fortune-body':a('merchantrobe','gold','rune'),'set-fortune-boots':a('softboots','gold'),'set-fortune-charm':a('chip','gold')
};

export const PASSIVE_ART:Record<string,Spec>={
 keen:a('eye','crit','feather','rays'),cruel:a('skull','crit','blade','shards'),critknife:a('blade','crit','burst','rays'),critshield:a('shield','crit','crystal','shards'),
 haste:a('wing','speed','clock','rays'),rhythm:a('clock','speed','blade','orbit'),flurry:a('quiver','speed','burst','rays'),nimble:a('boot','speed','wing','orbit'),
 puncture:a('arrow','pierce','blade','rays'),sight:a('scope','pierce','arrow'),fletching:a('feather','pierce','blade','shards'),momentum:a('hammer','pierce','wind','rays'),
 rebound:a('bounce','bounce','orb','orbit'),elastic:a('spiral','bounce','arrow','orbit'),static:a('orb','bounce','bolt','shards'),ricochetcrit:a('eye','bounce','bounce','rays'),
 toxicity:a('vial','poison','drop'),contagion:a('skull','poison','flower','shards'),venomblood:a('heart','poison','vial','orbit'),poisonedge:a('blade','poison','drop'),
 deepfreeze:a('snow','ice','hourglass','shards'),iceburst:a('crystal','ice','burst','shards'),icearmor:a('shield','ice','snow'),frostbite:a('snow','ice','drop','rays'),
 fuel:a('vial','fire','flame'),wildfire:a('flame','fire','leaf','rays'),fireknife:a('blade','fire','flame','shards'),cauterize:a('heart','fire','flame'),
 conduct:a('snow','lightning','bolt','rays'),overload:a('bolt','lightning','burst','shards'),battery:a('vial','lightning','shield'),arcing:a('bolt','lightning','chain','orbit'),
 blast:a('burst','explosion','arrow','rays'),volatile:a('skull','explosion','bomb','shards'),powder:a('heart','explosion','bomb','rays'),flash:a('eye','explosion','burst','shards'),
 mass:a('anvil','heavy','hammer'),execution:a('skull','heavy','rune','shards'),impact:a('hammer','heavy','snow','rays'),close:a('shield','heavy','blade'),
 recall:a('crescent','return','blade','orbit'),catch:a('hand','return','heart'),returnshield:a('crescent','return','shield','orbit'),echoes:a('spiral','return','blade','orbit'),
 engineering:a('gear','turret','turret'),blueprint:a('book','turret','circuit'),maintenance:a('gear','turret','cross'),capacitor:a('turret','turret','bolt','rays'),
 desperate:a('heart','blood','blade','rays'),siphon:a('fang','blood','drop'),bloodrage:a('drop','blood','blade','shards'),revenge:a('heart','blood','shield'),
 barrier:a('shield','shield','crystal'),recharge:a('shield','shield','clock','orbit'),thorn:a('leaf','shield','blade','shards'),armor:a('mountain','shield','shield'),
 interest:a('coin','gold','blade'),greed:a('hand','gold','coin'),midas:a('crown','gold','coin','rays'),insurance:a('shield','gold','coin'),
 forbidden:a('book','curse','rune'),hexarmor:a('shield','curse','rune'),darkdeal:a('heart','curse','book','shards'),hexburst:a('rune','curse','burst','rays'),
 lucky:a('clover','luck','dice'),study:a('book','luck','eye'),magnet:a('magnet','luck','coin','rays'),luckycrit:a('clover','luck','eye','rays'),
 alchemy:a('vial','fire','leaf','shards'),coldcoin:a('coin','gold','snow'),bloodcoin:a('coin','gold','drop'),soulreturn:a('crescent','return','clock','orbit'),
 hexmark:a('rune','crit','scope'),backpush:a('hammer','heavy','arrow','rays'),rootmark:a('leaf','control','scope'),netshield:a('net','shield','shield'),
 orbitalcraft:a('orb','summon','blade','orbit'),resonance:a('spiral','speed','quiver','orbit'),dissolution:a('vial','poison','burst','shards'),markhunt:a('scope','explosion','bomb','rays'),
 clearair:a('shield','shield','wind','rays'),coinwall:a('coin','gold','shield','shards'),frosthook:a('snow','ice','arrow','orbit'),returnstars:a('crescent','return','orb','orbit'),
 sporeweave:a('flower','poison','net'),suppression:a('net','control','clock'),lastwind:a('heart','blood','wind','rays'),returnmark:a('crescent','return','scope'),towerwill:a('tower','heavy','blade','rays'),towerbreath:a('lantern','shield','shield','orbit'),
 frostwind:a('crescent','return','snow','orbit'),forgeecho:a('hammer','heavy','burst','rays'),emberswap:a('vial','poison','flame','shards'),slowblood:a('net','control','drop'),
 glassvow:a('crystal','blood','heart','shards'),ironwill:a('shield','blood','wind','rays'),chainreward:a('chain','return','clock','orbit'),quiver:a('quiver','speed','wind','rays'),
 goldstorm:a('coin','gold','quiver','rays'),shieldpulse:a('shield','shield','burst','shards'),snarefield:a('net','control','leaf'),mossshroud:a('leaf','shield','shield'),
 crimsonmark:a('scope','crit','drop'),twinprism:a('crystal','lightning','bolt','rays'),coldinterest:a('snow','ice','coin'),returndoom:a('crescent','return','hourglass','orbit'),
 dronebrood:a('flower','summon','blade','orbit'),coilreserve:a('turret','turret','cross'),wardrecycling:a('snow','ice','shield','orbit'),debtcontract:a('book','curse','coin'),
 clearpath:a('wind','control','arrow','rays'),sandscript:a('hourglass','crit','eye'),bombfuse:a('bomb','explosion','flame','shards'),towerfocus:a('tower','curse','rune','rays')
};
