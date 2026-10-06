import { HEROES } from './data';
export type PixelRect={x:number;y:number;w:number;h:number;color:string};
export const HERO_ART_W=40,HERO_ART_H=44;
// The same original pixel drawing powers the large portraits and in-game sprites.
export function heroArt(id:string,frame=0):PixelRect[]{
 const hero=HEROES.find(h=>h.id===id)||HEROES[0],a:PixelRect[]=[];id=hero.id;
 const ink='#302c3d',skin='#eebd96',light='#ffdbb1',shade='#b67b68',metal='#b7c7d1',shine='#ecf5eb',gold='#edbf64';
 const rect=(x:number,y:number,w:number,h:number,color:string)=>a.push({x,y,w,h,color});
 const box=(x:number,y:number,w:number,h:number,c:string,s=1)=>{rect(x,y,w,h,ink);rect(x+s,y+s,w-s*2,h-s*2,c);};
 const coat:Record<string,string>={knife:'#769b6b',toxic:'#647a66',frost:'#4f8fac',forge:'#6f777f',coin:'#b08857',blood:'#763c53',hex:'#73608e',bomb:'#b8744f',engineer:'#4a8b83',raven:'#575071',spark:'#7b8c97',fortune:'#947254'};
 const hair:Record<string,string>={knife:'#bcc4bb',toxic:'#3b4248',frost:'#e3e8e4',forge:'#6d4f3f',coin:'#3a3039',blood:'#d7d1d3',hex:'#c4b4df',bomb:'#825440',engineer:'#66564b',raven:'#ddd5e5',spark:'#eac46b',fortune:'#725347'};
 // Cape and outline: varied lengths and silhouettes, with lit folds.
 if(['knife','blood','hex','raven','frost','spark'].includes(id)){
  const cape=id==='raven'?'#413951':id==='hex'?'#514361':id==='blood'?'#563044':id==='knife'?'#526958':'#456b88';
  rect(8,17,24,19,ink);rect(9,18,22,17,cape);rect(8,31,5,6,cape);rect(27,30,5,7,cape);rect(11,20,2,15,coat[id]);rect(29,23,2,11,coat[id]);
 }
 // Boots, separated legs, buckles, shoulder pieces, gloves and coat highlights.
 const step=frame?1:0;
 box(13,32+step,6,8,'#4a4350');box(22,32-step,6,8,'#4a4350');rect(13,38+step,7,3,ink);rect(22,38-step,7,3,ink);rect(14,36+step,4,1,gold);rect(23,36-step,4,1,gold);
 box(11,18,19,16,coat[id]);rect(13,20,3,10,hero.color);rect(26,20,2,10,hero.color);rect(18,23,4,6,tint(coat[id],-20));
 box(7,19+step,5,12,coat[id]);box(29,19-step,5,12,coat[id]);rect(8,21+step,3,4,hero.color);rect(30,21-step,3,4,hero.color);
 box(7,28+step,5,5,skin);box(29,28-step,5,5,skin);rect(8,29+step,2,2,light);rect(30,29-step,2,2,light);
 rect(11,29,19,3,ink);rect(12,29,17,2,'#56484b');box(19,28,4,4,gold);rect(20,29,2,2,'#ffe5a0');rect(14,31,4,4,'#6c564b');rect(14,31,4,1,gold);
 // Face, asymmetrical hair strands, ear, eye whites and a tiny brow.
 box(13,6,15,13,skin);rect(15,8,10,4,light);rect(25,12,2,5,shade);rect(12,11,2,5,skin);rect(27,11,2,5,shade);
 rect(14,5,13,4,hair[id]);rect(12,7,5,4,hair[id]);rect(13,8,2,5,hair[id]);rect(24,7,4,4,hair[id]);rect(17,7,2,3,hair[id]);rect(20,6,2,3,tint(hair[id],25));
 rect(16,12,3,2,shine);rect(22,12,3,2,shine);rect(17,12,1,2,ink);rect(23,12,1,2,ink);rect(17,11,2,1,ink);rect(22,11,2,1,ink);rect(18,16,4,1,shade);rect(15,15,2,1,'#dd8c80');
 rect(13,18,15,3,tint(hero.color,-20));rect(14,18,13,1,hero.color);
 switch(id){
  case'knife':
   rect(13,15,14,2,'#b96962');rect(27,16,4,3,'#b96962');rect(28,18,3,6,'#975250');rect(31,21,3,2,'#b96962');
   box(3,21,3,12,metal);rect(4,20,1,10,shine);rect(2,31,5,2,gold);rect(4,33,1,4,'#806a4c');
   box(34,18,3,12,metal);rect(35,17,1,10,shine);rect(33,28,5,2,gold);rect(35,30,1,4,'#806a4c');rect(12,24,3,3,'#d9dfb4');break;
  case'toxic':
   box(11,4,19,8,'#657462');rect(14,5,12,2,'#93ad81');rect(11,9,4,9,'#657462');rect(27,8,3,11,'#657462');
   box(14,14,12,4,'#ded6bf');rect(25,14,6,2,'#eee8ce');rect(30,14,2,1,ink);rect(18,15,3,1,'#a99f84');
   box(32,25,6,9,'#7dba80');rect(34,23,2,3,'#b6a087');rect(33,28,2,4,'#c4eea2');rect(35,27,1,2,'#eff5d3');
   box(23,24,5,7,'#705b4c');rect(24,24,3,1,gold);rect(17,23,2,2,metal);break;
  case'frost':
   box(12,4,17,7,'#839baa');rect(14,5,13,2,metal);rect(12,9,3,7,'#718ba0');rect(26,9,3,7,'#718ba0');
   rect(14,1,2,5,'#addaf0');rect(20,0,2,5,'#d0edf2');rect(26,1,2,5,'#addaf0');rect(19,6,4,3,'#77c7da');
   box(8,19,6,5,metal);box(27,19,6,5,metal);rect(15,23,12,4,'#bdd4da');rect(19,21,4,8,'#759db5');
   box(34,17,3,19,'#93d6e6');rect(35,13,1,17,'#e4f9f1');rect(33,30,5,2,metal);rect(35,32,1,6,'#4c6c8c');rect(3,22,3,8,'#99d5e1');rect(2,24,5,4,'#bfdde2');break;
  case'forge':
   box(12,4,17,6,'#635653');rect(14,5,13,2,'#a2987d');rect(15,7,10,1,gold);rect(15,15,11,5,hair.forge);rect(19,16,3,2,skin);
   box(7,18,9,7,'#a4afb3');box(26,18,9,7,'#a4afb3');rect(8,19,6,2,metal);rect(28,19,5,2,metal);
   box(14,23,13,7,'#89999e');rect(16,24,2,4,'#bac4bf');rect(22,24,2,4,'#bac4bf');
   rect(34,16,3,23,ink);rect(35,16,1,23,'#94714c');box(29,12,11,10,'#929fa9');rect(31,13,8,2,metal);rect(38,14,2,6,shine);break;
  case'coin':
   box(14,1,14,7,'#4b414b');rect(15,2,12,3,'#62515a');rect(14,6,14,2,gold);rect(10,8,22,2,ink);
   rect(15,19,11,9,'#e7d4ad');rect(19,20,3,8,'#775466');rect(17,22,1,1,gold);rect(23,24,1,1,gold);rect(26,22,3,5,'#e1b765');
   box(32,28,7,8,'#685646');rect(33,29,5,2,gold);rect(34,26,3,2,ink);box(2,27,5,5,gold);rect(3,28,2,2,'#ffe5a2');break;
  case'blood':
   rect(12,5,5,12,'#4a3549');rect(13,5,13,2,'#e4d7d8');rect(14,7,3,7,'#e4d7d8');rect(22,12,3,2,'#e3778b');rect(23,12,1,1,'#ffe0c4');
   rect(16,20,9,3,'#c46c83');rect(24,22,3,7,'#a3546a');rect(14,26,3,1,'#e69a9f');
   box(33,18,3,16,'#b7556b');rect(34,17,1,13,'#f1a0a6');rect(32,29,5,2,metal);rect(34,32,1,5,ink);box(3,25,3,9,'#b7556b');rect(4,24,1,8,'#f1a0a6');break;
  case'hex':
   rect(19,0,4,2,ink);rect(17,2,8,3,ink);rect(15,5,13,3,ink);rect(12,8,20,3,ink);rect(17,3,6,3,'#716085');rect(15,6,13,3,'#8a72a8');rect(19,5,3,2,gold);rect(10,10,24,2,'#51435e');
   rect(13,20,15,2,'#af91c7');rect(18,22,5,7,'#51405f');rect(19,23,3,3,'#ab7dcc');rect(20,24,1,1,shine);
   rect(35,15,2,24,ink);rect(35,17,1,21,'#a48dba');box(32,10,7,7,'#996dc0');rect(34,11,3,3,'#d9b6eb');rect(33,10,1,2,gold);rect(3,21,2,2,'#ba98df');rect(1,18,2,2,'#d2b3ea');break;
  case'bomb':
   rect(12,5,17,4,'#b7704f');rect(13,4,15,2,'#dc9863');rect(28,7,4,3,'#b7704f');rect(30,9,3,4,'#a86349');
   box(14,8,6,4,'#cfb275');box(22,8,6,4,'#cfb275');rect(15,9,3,2,'#70aeb4');rect(23,9,3,2,'#70aeb4');rect(20,9,2,1,ink);
   rect(15,21,11,11,'#d6c6a0');rect(17,23,7,5,'#a78063');rect(12,30,4,4,gold);rect(25,30,3,4,gold);
   box(31,26,8,8,'#484651');rect(32,27,3,2,'#7b7482');rect(35,23,1,4,'#cda974');rect(35,21,2,3,'#f1bd62');rect(36,20,1,2,'#fff0b0');break;
  case'engineer':
   box(11,4,19,6,'#7a7255');rect(13,5,15,2,'#bbaa76');rect(9,9,22,2,'#a29365');box(14,7,6,4,metal);box(22,7,6,4,metal);rect(15,8,3,2,'#659bae');rect(23,8,3,2,'#659bae');
   rect(17,20,2,9,'#d4c19a');rect(24,20,2,9,'#d4c19a');rect(15,26,12,3,'#38635e');rect(18,25,6,1,hero.color);
   box(3,18,5,13,'#617e77');rect(4,20,2,5,metal);rect(35,17,2,22,ink);rect(35,19,1,18,metal);rect(32,14,7,6,metal);rect(34,13,3,4,ink);rect(32,15,2,3,shine);rect(37,15,2,3,shine);break;
  case'raven':
   rect(12,3,17,7,ink);rect(14,4,13,3,'#655574');rect(11,8,4,11,'#51465f');rect(26,8,4,11,'#51465f');rect(13,10,3,6,hair.raven);rect(22,13,3,2,'#b29acb');
   rect(8,23,3,14,'#7d6e94');rect(6,29,3,8,'#5f516f');rect(29,24,3,14,'#7d6e94');rect(32,29,3,8,'#5f516f');rect(17,20,7,3,'#aca0c4');
   rect(2,26,3,3,gold);rect(4,28,3,3,gold);rect(6,30,3,3,gold);rect(33,24,3,3,'#c3b0db');rect(35,26,3,3,'#c3b0db');rect(32,28,4,3,'#c3b0db');break;
  case'spark':
   rect(13,4,15,5,hair.spark);rect(12,2,3,5,hair.spark);rect(18,1,3,4,'#f5dda0');rect(23,2,5,4,hair.spark);rect(27,5,3,5,hair.spark);rect(13,8,3,5,hair.spark);
   box(8,19,7,6,'#c3cbd0');box(27,19,7,6,'#c3cbd0');rect(15,23,12,6,'#d4d8cf');rect(17,24,8,2,gold);rect(20,21,3,8,gold);rect(20,21,1,5,'#ffeea6');
   rect(34,16,4,7,'#83d5dc');rect(32,22,5,3,'#c9f4e5');rect(34,25,3,6,'#83d5dc');rect(32,30,3,3,'#c9f4e5');rect(3,23,3,3,gold);break;
  case'fortune':
   box(13,3,15,7,'#927557');rect(15,4,11,3,'#ba9567');rect(13,8,15,2,'#476f5f');rect(8,10,25,2,'#8e6d50');rect(11,10,20,1,'#d2ab73');
   rect(13,19,15,3,'#70a080');rect(23,21,3,8,'#497b63');rect(14,22,3,7,'#d3b281');rect(17,25,5,5,'#725645');rect(18,25,3,1,gold);
   box(32,27,7,7,gold);rect(33,28,5,5,'#dddac0');rect(35,28,1,5,'#779684');rect(33,30,5,1,'#779684');rect(35,29,1,2,'#d47a69');box(2,25,4,9,'#745942');rect(3,26,2,3,'#caa478');break;
 }
 return a;
}
function tint(hex:string,n:number){const k=parseInt(hex.slice(1),16);return'#'+[k>>16,k>>8&255,k&255].map(v=>Math.max(0,Math.min(255,v+n)).toString(16).padStart(2,'0')).join('');}
export function heroIcon(id:string,size=64){const paths=heroArt(id).map(r=>`<path fill="${r.color}" d="M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z"/>`).join('');return`<svg width="${size}" height="${size*HERO_ART_H/HERO_ART_W}" viewBox="0 0 ${HERO_ART_W} ${HERO_ART_H}" shape-rendering="crispEdges" aria-hidden="true">${paths}</svg>`;}
