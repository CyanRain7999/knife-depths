import Phaser from 'phaser';
import { HEROES, ENEMIES, BOSSES, WEAPONS } from './data';
import { heroArt, HERO_ART_W, HERO_ART_H } from './portraits';
import { characterIcon } from './chibi';
import {itemIcon} from './item-icons';
const slime=['      xxxx      ','    xxxxxxxx    ','   xxxxxxxxxx   ','  xxxxxxxxxxxx  ',' xxxxxxxxxxxxxx ',' xxxexxxxexxxxx ',' xxxxwxxwxxxxxx ','  xxxxxxxxxxxx  ','   xxxxxxxxxx   ',' xxxxxxxxxxxxxx '];
const skull=['     xxxxxx     ','   xxxxxxxxxx   ','   xxxxxxxxxx   ','   xxexxxexxx   ','    xxxwxxx     ','     xxxxx      ','  xxxcxxcxxx    ','  xx cxxc xx    ','     cccc       ','    xx  xx      ','    xx  xx      '];
const bat=[' xx          xx ',' xxxx      xxxx ',' xxxxxx  xxxxxx ','   xxxxxxxxxx   ','     xxxxxx     ','     exxxxe     ','      xxxx      ','      x  x      '];
const humanoid=['     xxxxxx     ','    xxxxxxxx    ','    xxexxexx    ','     xwwwwx     ','     xxxxxx     ','   cccccccccc   ','  ccccxxcccccc  ','  xcxxxxxxxxcx  ','   cccccccc     ','    cccccc      ','    xx  xx      ','    xx  xx      '];
const bossPixels=['      cccc      ','   cccccccccc   ',' ccccxxxxcccccc ',' cccxxxxxxxxccc ',' ccxxexxexxxxcc ',' ccxxxxxxxxxxcc ','  cxxxwwxxxccc  ','   cccccccccc   ',' cccccccccccccc ','cccccxxxxxxccccc','cccxxxxxxxxxxccc','ccccxxxxxxxxcccc','  cccccccccccc  ','   ccc    ccc   ','  cccc    cccc  ','  xxxx    xxxx  '];
const specialWeapons:Record<string,string[]>={
 rampart:['     xxxxxx     ','    xxwwwwxx    ','    xwwwwwwx    ','    xwwxxwwx    ','    xwwxxwwx    ','     xwwwwx     ','      xxxx      '],
 cometrope:['     xxx        ','    xxwxx       ','     xxx        ','      c         ','       c        ','      c         ','     c          '],
 icebridge:['  x    x    x   ',' xxx  xxx  xxx  ','  xxxxxwxxxxx   ','   xxxxxxxxx    ','    xxxxxxx     ','      ccc       '],
 firemoth:['  xx      xx    ',' xwwx xx xwwx   ',' xwwxxxxxxwwx   ','  xxxwwwwxxx    ','   xxxwwxxx     ','     xxxx       ','     x  x       '],
 dynamitecord:['   xx   xx      ','   xwcccwx      ','   xx   xx      ','     c          ','      c         ','   xx c         ','   xwcc         ','   xx           '],
 iongate:['      xx        ','     xwwx       ','    xwwwwx      ','     xwwx       ','      xx        ','    ccwwcc      ','      ww        ','      cc        '],
 tidebow:[' x          x   ','  xx      xx    ','   xxxwwxxx     ','     xwwx       ','      ww        ','      cc        '],
 pendulum:['       c        ','       c        ','       c        ','     xxxxx      ','    xxwwwxx     ','    xwwwwwx     ','    xxwwwxx     ','     xxxxx      '],
 razorball:['     x    x     ','  x  xxxxxx x   ','   xxxwwxxxx    ','   xxwwwwxx     ','  xxxxwwxxx     ','   x xxxxxx  x  ','     x    x     '],
 medicneedle:['      x         ','      x         ','     wxw        ','     xwx        ','     xwx        ','     wxw        ','      c         ','     ccc        '],
 hexhour:['    xxxxxx      ','    xwwwwx      ','     xwwx       ','      xx        ','     xwwx       ','    xwwwwx      ','    xxxxxx      '],
 reaperseal:['    xxxxx       ','   xwcccwx      ','   xcxwx cx     ','   xcwxwc x     ','   xwcccwx      ','    xxxxx       ','      w         ','     ccc        '],
 singularity:['      xxxx      ','    xx    xx    ','   x   cc   x   ','  x  cdddc   x  ','  x  dddddd  x  ','  x  cdddc   x  ','   x   cc   x   ','    xx    xx    ','      xxxx      '],
 silknet:['   x   x   x    ','    x x x x     ','   x x x x x    ','    x x x x     ','   x x x x x    ','    x x x x     ','     x x x      ','      xxx       ','       c        '],
 conduit:['       w        ','      wxw       ','     wxxxw      ','    wxwwwxw     ','     wxxxw      ','      wxw       ','       w        ','       c        '],
 starward:['      x         ','     xxx        ','    xxwxx       ','   xxxwxxx      ','    xxwxx       ','     xxx        ','      c         ','      c         '],
 glassknife:['    h     h     ','    hx   xh     ','    hxx xxh     ','     xx xx      ','      wxw       ','       w        ','       c        '],
 anchor:['    x  x  x     ','    x  x  x     ','     xxxxx      ','       x        ','       w        ','       w        ','       c        ','       c        '],
 wallring:['    xxxxxx      ','   xwwwwwwx     ','  xwc    cwx    ','  xwc    cwx    ','  xwc    cwx    ','   xwwwwwwx     ','    xxxxxx      '],
 sporeseed:['   xx      xx   ','    xx    xx    ','     xxxxxx     ','    xwxwwxxx    ','   xxxxxxxxxx   ','    xxxxxxxx    ','     cccccc     ','      cccc      ','     c cc c     ']
};
const palette=(color:string)=>({x:color,c:shade(color,-32),h:color,s:'#d9bf9b',e:'#171722',w:'#f1e6bf',d:shade(color,-52),b:'#393446'});
export function shade(hex:string,amount:number){const n=parseInt(hex.slice(1),16);const c=(v:number)=>Math.max(0,Math.min(255,v+amount));return'#'+[c(n>>16),c(n>>8&255),c(n&255)].map(x=>x.toString(16).padStart(2,'0')).join('');}
function texture(scene:Phaser.Scene,key:string,pattern:string[],color:string){const g=scene.make.graphics({x:0,y:0});const p=palette(color);pattern.forEach((row,y)=>[...row].forEach((symbol,x)=>{if(symbol!==' '){g.fillStyle(Phaser.Display.Color.HexStringToColor(p[symbol as keyof typeof p]||color).color);g.fillRect(x,y,1,1);}}));g.generateTexture(key,16,16);g.destroy();}
export function makeTextures(scene:Phaser.Scene){
 for(const h of HEROES)for(let frame=0;frame<2;frame++){const g=scene.make.graphics({x:0,y:0});for(const r of heroArt(h.id,frame)){g.fillStyle(Phaser.Display.Color.HexStringToColor(r.color).color);g.fillRect(r.x,r.y,r.w,r.h);}g.generateTexture(`hero-${h.id}${frame?'-walk':''}`,HERO_ART_W,HERO_ART_H);g.destroy();}
 for(const e of ENEMIES){const shape=['walk','split','bomb','egg','tank'].includes(e.behavior)?slime:['fast','swarm'].includes(e.behavior)?bat:['ranged','snipe','revive','shield'].includes(e.behavior)?skull:humanoid;texture(scene,`enemy-${e.id}`,shape,e.color);}
 for(const b of BOSSES)texture(scene,`boss-${b.id}`,bossPixels,b.color);
 for(const w of WEAPONS){const shape=specialWeapons[w.id]||(w.heavy?['       xx       ','      xxxx      ','     xxxxxx     ','    xxxxxxxx    ','     xxxxxx     ','       ww       ','       ww       ','       ww       ','       cc       ']:w.returning?['   xx      xx   ','    xx    xx    ','     xx  xx     ','      xxxx      ','       xx       ']:w.pattern==='mine'||w.explosive?['      ww        ','     xxxx       ','    xxxxxx      ','    xxxxxx      ','    xxxxxx      ','     xxxx       ']:['       x        ','       x        ','      xxx       ','      xxx       ','       w        ','       c        ','       c        ']);texture(scene,`weapon-${w.id}`,shape,w.color);}
 texture(scene,'xp',['      xx        ','     xxxx       ','    xxxxxx      ','     xxxx       ','      xx        '],'#b7e987');
 texture(scene,'gold',['     xxxx       ','    xwwxxx      ','    xwxxxx      ','    xxxxxx      ','     xxxx       '],'#edcc77');
 texture(scene,'gear',['    xxxxxx      ','   xxwwxxxx     ','    xxxxxx      ','     xxxx       ','     xxxx       '],'#bf95ec');
 texture(scene,'turret',['     xx         ','     xx         ','    cccc        ','   xxxxxx       ','  xxxxxxxx      ','  xxccccxx      ',' xx      xx     '],'#88c9ba');
}
export function pixelIcon(color:string,kind='hero',size=56,id?:string){if(id&&(kind==='weapon'||kind==='passive'||kind==='equipment'))return itemIcon(kind,id,size);if(id&&kind==='gear')return itemIcon('equipment',id,size);if(kind==='hero')return characterIcon(HEROES.find(h=>h.color===color)?.id||'knife',size);const pattern=kind==='boss'?bossPixels:kind==='enemy'?slime:kind==='gear'?['    xx    xx    ','   xxxxxxxxxx   ','   xxwwwwwwxx   ','    xxxwwxxx    ','    xxxwwxxx    ','    xxxxxxxx    ','    xxxxxxxx    ','   xxxxxxxxxx   ','   xxxxxxxxxx   ','    xxxxxxxx    ']:kind==='weapon'?(specialWeapons[id||'']||['       x        ','       x        ','      xxx       ','      xxx       ','      xxx       ','       w        ','       c        ','      ccc       ']):bat;const colors=palette(color);let paths='';pattern.forEach((row,y)=>[...row].forEach((symbol,x)=>{if(symbol!==' ')paths+=`<path fill="${colors[symbol as keyof typeof colors]||color}" d="M${x} ${y}h1v1h-1z"/>`;}));return`<svg width="${size}" height="${size}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${paths}</svg>`;}
