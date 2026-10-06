import Phaser from 'phaser';
import { Run, W, H, PLAYER_Y } from './engine';
import { BOSSES, QUALITY_COLORS, REGIONS } from './data';
import { makeTextures, shade } from './art';
export class DungeonScene extends Phaser.Scene {
 run?:Run; move=0; targetX?:number; onFrame?:()=>void; onSkill?:()=>void;
 private sprites=new Map<string,Phaser.GameObjects.Image>();private pool=new Map<string,Phaser.GameObjects.Image[]>();private floating=new Map<object,Phaser.GameObjects.Text>();private textPool:Phaser.GameObjects.Text[]=[];
 private dynamic!:Phaser.GameObjects.Graphics;private player!:Phaser.GameObjects.Image;private shadow!:Phaser.GameObjects.Ellipse;private background!:Phaser.GameObjects.Graphics;private keys?:Record<string,Phaser.Input.Keyboard.Key>;private lastFloor=0;private lastInv=0;
 constructor(){super('dungeon');}
 create(){
  makeTextures(this);this.background=this.add.graphics();this.dynamic=this.add.graphics();this.shadow=this.add.ellipse(W/2,PLAYER_Y+36,60,14,0x000000,.4);this.player=this.add.image(W/2,PLAYER_Y,'hero-knife').setScale(2).setDepth(10);
  this.keys=this.input.keyboard?.addKeys('A,D,LEFT,RIGHT,SPACE,ESC,P') as Record<string,Phaser.Input.Keyboard.Key>;
  this.input.keyboard?.on('keydown-SPACE',()=>this.onSkill?.());this.input.keyboard?.on('keydown-ESC',()=>this.run?.pause());this.input.keyboard?.on('keydown-P',()=>this.run?.pause());
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{this.targetX=p.x;});this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(p.isDown)this.targetX=p.x;});
  this.paintBackground(1);
 }
 setRun(run:Run){this.run=run;this.lastFloor=0;this.lastInv=0;this.targetX=undefined;this.move=0;}
 private paintBackground(floor:number){
  const g=this.background;g.clear();const palettes=[['#232931','#2b3038','#536051'],['#252d28','#2b342d','#69764e'],['#302a29','#3a302c','#8e6047'],['#222e36','#28343e','#7395a5'],['#302e27','#39352b','#8d7c4c'],['#2a2935','#302e3b','#776f9b'],['#2e2533','#392c3d','#956d9d'],['#30232c','#392832','#9a5e78']];
  const [base,tile,accent]=palettes[(floor-1)%8];g.fillStyle(color(base));g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=40)for(let x=24;x<W-24;x+=48){g.fillStyle(color(tile),.42);g.fillRect(x+(y%80?20:0),y,46,38);g.fillStyle(0x11151c,.15);g.fillRect(x+8,y+10,5,2);}
  for(let y=0;y<H;y+=32){for(const x of [0,W-26]){g.fillStyle(color(shade(accent,-25)));g.fillRect(x,y,26,30);g.fillStyle(color(accent),.55);g.fillRect(x+2,y+2,22,3);g.fillStyle(0x11131d,.6);g.fillRect(x+2,y+28,24,4);}}
  g.fillStyle(0x131720,.5);g.fillRect(26,PLAYER_Y-19,W-52,57);g.lineStyle(1,color(accent),.28);g.lineBetween(27,PLAYER_Y-22,W-27,PLAYER_Y-22);
  for(const y of [105,355])for(const x of [13,W-13]){g.fillStyle(0x10151b);g.fillRect(x-7,y-10,14,28);g.fillStyle(0x916740);g.fillRect(x-4,y+2,8,15);g.fillStyle(0xffb762);g.fillRect(x-4,y-7,8,11);g.fillStyle(0xffdd89);g.fillRect(x-2,y-12,4,12);g.fillStyle(0xffae66,.05);g.fillCircle(x,y,70);}
  const label=this.add.text(W/2,H/2,REGIONS[(floor-1)%8],{fontFamily:'monospace',fontSize:'28px',color:'#ffffff'}).setOrigin(.5).setAlpha(.04);this.time.delayedCall(3000,()=>label.destroy());
 }
 update(_time:number,delta:number){
  const run=this.run;if(!run||!this.player)return;const dt=Math.min(delta/1000,.05);let keyboard=0;if(this.keys?.A.isDown||this.keys?.LEFT.isDown)keyboard--;if(this.keys?.D.isDown||this.keys?.RIGHT.isDown)keyboard++;
  if(keyboard||this.move)this.targetX=undefined;run.tick(dt,keyboard||this.move,this.targetX);if(this.targetX!==undefined&&Math.abs(run.x-this.targetX)<4)this.targetX=undefined;if(run.floor!==this.lastFloor){this.lastFloor=run.floor;this.paintBackground(run.floor);this.player.setTexture(`hero-${run.hero.id}`);}
  const g=this.dynamic;g.clear();const used=new Set<string>();
  const moving=!!(keyboard||this.move||this.targetX!==undefined);const stepX=run.x-this.player.x;if(Math.abs(stepX)>.3)this.player.setFlipX(stepX<0);this.player.setTexture(`hero-${run.hero.id}${moving&&Math.floor(run.time*8)%2?'-walk':''}`).setPosition(run.x,PLAYER_Y+Math.sin(run.time*7)*(moving?2:.7));this.shadow.setPosition(run.x,PLAYER_Y+36);this.player.setAlpha(run.invincible>0?(Math.floor(run.invincible*16)%2?.45:1):1);
  if(run.invincible>this.lastInv&&run.meta.settings.shake)this.cameras.main.shake(110,.004);this.lastInv=run.invincible;
  if(run.shield>0){g.lineStyle(2,0x8cd3e0,.38);g.strokeCircle(run.x,PLAYER_Y,42);g.fillStyle(0x83d4e4,.06);g.fillCircle(run.x,PLAYER_Y,42);}
  for(const h of run.hazards){g.fillStyle(color(h.color),h.fired?.5:.06+.05*Math.sin(run.time*14));if(h.kind==='line'){g.fillRect(h.x-h.r,40,h.r*2,PLAYER_Y+15-40);g.lineStyle(2,color(h.color),.8);g.lineBetween(h.x-h.r,40,h.x-h.r,PLAYER_Y+20);g.lineBetween(h.x+h.r,40,h.x+h.r,PLAYER_Y+20);}else{g.fillCircle(h.x,h.y,h.r);g.lineStyle(2,color(h.color),.8);g.strokeCircle(h.x,h.y,h.r);}}
  for(const t of run.turrets){const key=`turret-${t.x}-${t.y}-${t.weapon.id}`;const sprite=this.use(key,'turret',used);sprite.setPosition(t.x,t.y).setScale(2).setAlpha(Math.min(1,t.life));}
  for(const e of run.enemies){if(e.dead)continue;const boss=e.boss>=0;const texture=boss?`boss-${BOSSES[e.boss].id}`:`enemy-${e.def.id}`;const sprite=this.use(`e${e.uid}`,texture,used);sprite.setPosition(e.x,e.y).setScale(boss?5:e.elite?3.2:e.def.radius/6).setAlpha(e.def.behavior==='stealth'&&e.age%4<1.8&&e.y<450?.25:1);
   sprite.clearTint();if(e.flash>0)sprite.setTintFill(0xffffff);else if(e.frozen>0)sprite.setTint(0x93d9ff);else if(e.poison>0)sprite.setTint(0xa6da82);else if(e.burn>0)sprite.setTint(0xffb27e);
   if(e.elite){g.lineStyle(1,0xd7acff,.5);g.strokeCircle(e.x,e.y,e.def.radius*1.6+3);}if(e.barrier>0||e.def.behavior==='shield'&&e.age%3<1.3){g.lineStyle(2,0x9bd7e4,.8);g.strokeCircle(e.x,e.y,e.def.radius+6);}
   if(!boss&&(e.hp<e.maxHp||e.elite)){g.fillStyle(0x11131b,.8);g.fillRect(e.x-18,e.y-e.def.radius-13,36,4);g.fillStyle(e.elite?0xc19ce5:0xa7cc8a);g.fillRect(e.x-18,e.y-e.def.radius-13,36*Math.max(0,e.hp/e.maxHp),3);}
   if(e.affix){g.fillStyle(color(e.affix==='富饶'?'#eaca73':'#c2a1df'));g.fillRect(e.x-2,e.y-e.def.radius-19,4,4);}
   if(e.def.behavior==='charge'&&e.age%4>2&&e.age%4<2.7){g.lineStyle(1,0xe4aa84,.6);g.lineBetween(e.x,e.y,e.targetX,PLAYER_Y);}
  }
  for(const s of run.shots){if(!s.active)continue;const sprite=this.use(`s${s.uid}`,`weapon-${s.weapon.id}`,used);sprite.setPosition(s.x,s.y).setScale(s.weapon.heavy?2.2:1.6).setRotation(s.weapon.heavy||s.returning?s.age*12:Math.atan2(s.vy,s.vx)+Math.PI/2).setAlpha(s.weapon.pattern==='mine'?.7:1);g.lineStyle(s.weapon.heavy?3:1,color(s.weapon.color),.25);g.lineBetween(s.x,s.y,s.x-s.vx*.045,s.y-s.vy*.045);if(s.weapon.pattern==='mine'){g.lineStyle(1,color(s.weapon.color),.35);g.strokeCircle(s.x,s.y,35);}}
  for(const b of run.bullets){g.fillStyle(color(b.color),.18);g.fillCircle(b.x,b.y,8);g.fillStyle(color(b.color));g.fillRect(b.x-3,b.y-3,6,6);g.fillStyle(0xffe9c8);g.fillRect(b.x-1,b.y-1,2,2);}
  for(const d of run.drops){const sprite=this.use(`d${d.uid}`,d.kind==='gear'?'gear':d.kind,used);sprite.setPosition(d.x,d.y+Math.sin(d.age*5)*2).setScale(d.kind==='gear'?2.5:1.6);if(d.kind==='gear'){const c=color(QUALITY_COLORS[d.gear!.quality]);sprite.setTint(c);g.fillStyle(c,.06);g.fillRect(d.x-9,d.y-90,18,90);g.fillStyle(c,.13);g.fillRect(d.x-3,d.y-110,6,110);g.lineStyle(1,c,.6);g.strokeEllipse(d.x,d.y+14,30,9);}}
  const effects=new Set<object>();for(const v of run.vfx){const alpha=v.life/v.max;
   if(v.text){effects.add(v);let text=this.floating.get(v);if(!text){text=this.textPool.pop()||this.add.text(0,0,'',{fontFamily:'monospace',fontSize:'14px',fontStyle:'bold',stroke:'#15151f',strokeThickness:3});this.floating.set(v,text);text.setText(v.text).setColor(v.color).setOrigin(.5).setFontSize(v.kind==='skill'?20:v.kind==='crit'?18:12).setVisible(true).setDepth(20);}text.setPosition(v.x,v.y-(1-alpha)*28).setAlpha(Math.min(1,alpha*2));}
   if(v.kind==='chain'){g.lineStyle(2,color(v.color),alpha);g.beginPath();g.moveTo(v.x,v.y);g.lineTo((v.x+(v.tx||0))/2+10,(v.y+(v.ty||0))/2);g.lineTo(v.tx||v.x,v.ty||v.y);g.strokePath();}
   if(v.kind==='nova'||v.kind==='skill'||v.kind==='heal'){g.lineStyle(v.kind==='nova'?3:1,color(v.color),alpha*.6);g.strokeCircle(v.x,v.y,v.radius*(1-alpha+.2));}
   if(run.meta.settings.particles&&['death','crit','nova'].includes(v.kind))for(let i=0;i<6;i++){const angle=i*Math.PI/3;g.fillStyle(color(v.color),alpha);g.fillRect(v.x+Math.cos(angle)*(1-alpha)*v.radius,v.y+Math.sin(angle)*(1-alpha)*v.radius,3,3);}
  }
  for(const[key,sprite]of this.sprites){if(!used.has(key)){sprite.setVisible(false);this.sprites.delete(key);const list=this.pool.get(sprite.texture.key)||[];list.push(sprite);this.pool.set(sprite.texture.key,list);}}
  for(const[v,text]of this.floating){if(!effects.has(v)){text.setVisible(false);this.floating.delete(v);this.textPool.push(text);}}
  this.onFrame?.();
 }
 private use(key:string,texture:string,used:Set<string>){used.add(key);let sprite=this.sprites.get(key);if(!sprite){const list=this.pool.get(texture);sprite=list?.pop()||this.add.image(0,0,texture);sprite.setVisible(true).setDepth(5);this.sprites.set(key,sprite);}return sprite;}
}
const color=(hex:string)=>Phaser.Display.Color.HexStringToColor(hex).color;
