import { HEROES, WEAPONS, PASSIVES, EQUIPMENT, AFFIXES, ENEMIES, BOSSES, ENEMY_AFFIXES, bossIndex } from './data';
import type { Hero, Weapon, Passive, Stats, Mods, Effect, EnemyDef, Gear, Save, NodeType, Hook, EventOption } from './types';
import { DIFFICULTY, COMBAT_FEEL, floorValue } from './balance';
import { BOUNTIES, MUTATIONS, TOWER_LIMIT } from './tower';
import type { GameMode } from './types';
export const W=720, H=960, PLAYER_Y=884;
export type Panel = 'level'|'loot'|'clear'|'map'|'shop'|'event'|'chest'|'altar'|'heal'|'bossintro'|'pause'|'forge'|null;
export type Enemy = { uid:number; def:EnemyDef; x:number; y:number; hp:number; maxHp:number; age:number; action:number; flash:number; poison:number; poisonTime:number; burn:number; burnTime:number; bleed:number; bleedTime:number; ice:number; iceTime:number; frozen:number; snare:number; mark:number; markTime:number; tick:number; revived:boolean; elite:boolean; affix:string; barrier:number; boss:number; phase:number; targetX:number; dead:boolean; entering:boolean };
export type Shot = { active:boolean; uid:number; x:number; y:number; vx:number; vy:number; age:number; life:number; damage:number; weapon:Weapon; level:number; pierce:number; bounce:number; hits:Set<number>; returning:boolean; turned:boolean; turret:boolean; child:boolean; seed:number; lastHit:number; anchorY?:number };
export type Bullet = {active:boolean;x:number;y:number;vx:number;vy:number;damage:number;life:number;color:string};
export type Drop = {uid:number;kind:'xp'|'gold'|'gear';x:number;y:number;value:number;gear?:Gear;age:number};
export type Vfx = {x:number;y:number;kind:'hit'|'crit'|'nova'|'heal'|'chain'|'text'|'skill'|'death';text:string;color:string;life:number;max:number;radius:number;tx?:number;ty?:number};
export type Hazard = {x:number;y:number;r:number;timer:number;life:number;damage:number;color:string;kind:'line'|'circle';fired:boolean};
export type Choice = {kind:'weapon'|'passive';id:string};
export const BASE:Stats = {damage:1,speed:1,crit:.06,critPower:1.8,maxHp:100,armor:0,move:1,luck:0,magnet:78,pierce:0,bounce:0,projectiles:0,area:1,duration:1,goldBonus:1,xpBonus:1,regen:0,dodge:0,lowDamage:0,goldPower:0,cursePower:0,statusPower:1,thorns:0,lifeSteal:0,execute:0,closePower:0,farPower:0,shieldMax:20,turretPower:1,returnPower:1};
export class Random {
 constructor(public state=Date.now()>>>0) {}
 next(){this.state|=0;this.state=this.state+0x6D2B79F5|0;let t=Math.imul(this.state^this.state>>>15,1|this.state);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
 pick<T>(a:T[]):T{return a[Math.floor(this.next()*a.length)];}
 range(a:number,b:number){return a+(b-a)*this.next();}
 shuffle<T>(a:T[]){return [...a].map(v=>({v,r:this.next()})).sort((a,b)=>a.r-b.r).map(x=>x.v);}
}
export class Run {
 rng:Random; hero:Hero; stats:Stats={...BASE}; x=W/2; hp=100; shield=0; gold=35; curse=0; baseCurse=0; level=1; xp=0; needXp=24;
 floor=1; row=0; col=1; kills=0; bossKills=0; totalGold=0; time=0; roomTime=0; duration=28; spawnTimer=0; skillCD=0; invincible=0; combo=0; comboTimer=0; second=0; strongBoss=false; fortune=0; rerolls=2; bossReward=0;
 phase:'combat'|'between'|'dead'|'victory'='combat'; panel:Panel=null; revision=0; room:NodeType='battle'; route:NodeType[][]=[]; visited:{row:number;col:number}[]=[];
 weapons:{id:string;level:number;timer:number;burst:number;forged?:number;awakened?:boolean;volleys?:number}[]=[]; passives:Record<string,number>={}; equipment:Record<string,Gear>={}; extraMods:Mods={};
 mutationId=0; mutationTimer=5; bounty?:{id:string;progress:number;claimed:boolean};
 enemies:Enemy[]=[]; shots:Shot[]=[]; bullets:Bullet[]=[]; drops:Drop[]=[]; vfx:Vfx[]=[]; hazards:Hazard[]=[]; turrets:{x:number;y:number;life:number;timer:number;weapon:Weapon;level:number}[]=[];
 loot:Gear[]=[]; lootReturn:Panel=null; pendingLevels=0; choices:Choice[]=[]; shop:{kind:'gear'|'weapon'|'passive'|'heal';id?:string;gear?:Gear;cost:number;sold:boolean}[]=[]; refreshes=0; eventId=''; notices:string[]=[]; seen=new Set<string>();
 private uid=1; private effects:{effect:Effect;stacks:number;key:string}[]=[]; private effectCooldown=new Map<string,number>(); private shotPool:Shot[]=[]; private bulletPool:Bullet[]=[];
 onSound?:(kind:string)=>void;
 constructor(heroId:string,public meta:Save,seed?:number,public mode:GameMode='tower'){
  this.rng=new Random(seed);this.hero=HEROES.find(h=>h.id===heroId)||HEROES[0];this.weapons=[{id:this.hero.weapon,level:1,timer:.1,burst:0}];
  this.baseCurse=this.hero.id==='hex'?2:0;this.gold+=meta.upgrades.supply*10+(this.hero.id==='coin'?60:0);this.extraMods={maxHp:meta.upgrades.vitality*5,luck:meta.upgrades.fortune*.03};
  this.recalculate();this.hp=this.stats.maxHp;this.shield=this.stats.shieldMax*.3;this.buildRoute();this.seen.add(this.hero.id);this.seen.add(this.hero.weapon);this.startCombat('battle');
 }
 recalculate(){
  const oldMax=this.stats.maxHp; this.stats={...BASE};this.effects=[];
  const add=(mods:Mods,n=1)=>{for(const [k,v] of Object.entries(mods))this.stats[k as keyof Stats]+=v!*n;};
  const effects=(items:Effect[],n:number,prefix:string)=>items.forEach((effect,i)=>this.effects.push({effect,stacks:n,key:`${prefix}:${i}`}));
  add(this.hero.mods);add(this.extraMods);effects(this.hero.effects,1,'hero');
  for(const [id,n]of Object.entries(this.passives)){const p=PASSIVES.find(p=>p.id===id);if(p){add(p.mods,n);effects(p.effects,n,id);}}
  let curses=this.baseCurse;
  for(const gear of Object.values(this.equipment)){add(gear.mods);effects(gear.effects,1,`gear${gear.uid}`);if(gear.def.cursed)curses+=2;}
  this.curse=curses;this.stats.damage=Math.max(.2,this.stats.damage);this.stats.speed=Math.max(.25,this.stats.speed);this.stats.maxHp=Math.max(25,this.stats.maxHp);this.stats.crit=Math.min(.85,this.stats.crit);this.stats.dodge=Math.min(.5,this.stats.dodge);this.stats.move=Math.max(.5,this.stats.move);
  if(oldMax<this.stats.maxHp)this.hp+=this.stats.maxHp-oldMax;this.hp=Math.min(this.hp,this.stats.maxHp);this.shield=Math.min(this.shield,this.stats.shieldMax);
 }
 buildRoute(){
  const pool:NodeType[]=['battle','battle','elite','event','chest','altar','heal','shop','forge'];
  this.route=[['battle','battle','battle'],[this.rng.pick(pool),'event',this.rng.pick(pool)],['elite','shop','battle'],[this.rng.pick(pool),'forge','heal'],['boss','boss','boss']];this.visited=[{row:0,col:1}];
  this.mutationId=this.floor<3?0:1+(this.floor-3)% (MUTATIONS.length-1);this.bounty=undefined;
 }
 get mutation(){return MUTATIONS[this.mutationId];}
 get bossId(){return bossIndex(this.floor);}
 takeBounty(id:string){if(this.bounty||!BOUNTIES.some(b=>b.id===id))return false;this.bounty={id,progress:0,claimed:false};this.revision++;return true;}
 bountyStep(id:string,n=1){if(this.bounty?.id===id&&!this.bounty.claimed){this.bounty.progress+=n;this.revision++;}}
 claimBounty(){const b=BOUNTIES.find(b=>b.id===this.bounty?.id);if(!b||!this.bounty||this.bounty.claimed||this.bounty.progress<b.goal)return false;this.bounty.claimed=true;if(b.reward==='gear'){this.loot.push(this.createGear(3));this.lootReturn=this.panel==='forge'?'forge':this.panel==='shop'?'shop':null;this.open('loot');}else if(b.reward==='gold')this.addGold(60+this.floor*8);else this.rerolls+=2;this.note(`完成悬赏：${b.name}`);this.revision++;return true;}
 forgeCost(index:number,awaken=false){const w=this.weapons[index];return w?(awaken?120+this.floor*10:45+this.floor*8+(w.forged||0)*25):Infinity;}
 forgeWeapon(index:number,awaken=false){const w=this.weapons[index],cost=this.forgeCost(index,awaken);if(this.panel!=='forge'||!w||this.gold<cost|| (awaken?(w.level<5||!w.forged||w.awakened):(w.forged||0)>=3))return false;this.gold-=cost;if(awaken)w.awakened=true;else w.forged=(w.forged||0)+1;this.note(`${w.awakened?'觉醒':'锻造'} ${WEAPONS.find(x=>x.id===w.id)!.name}`);this.revision++;return true;}
 reforgeGear(slot:string){const old=this.equipment[slot],cost=65+this.floor*6;if(this.panel!=='forge'||!old||this.gold<cost)return false;this.gold-=cost;this.loot.push(this.createGear(old.quality,old.def));this.lootReturn='forge';this.open('loot');return true;}
 open(panel:Panel){this.panel=panel;this.revision++;}
 note(text:string){this.notices.unshift(text);this.notices.length=Math.min(7,this.notices.length);}
 power(){return this.stats.damage*(1+this.curse*this.stats.cursePower)*(1+Math.min(12,this.gold/100)*this.stats.goldPower)*(this.hp/this.stats.maxHp<.35?1+this.stats.lowDamage:1);}
 createGear(minQuality=0,chosenDef?:Gear['def']):Gear{
  const roll=this.rng.next()+this.stats.luck*.17+this.fortune*.12+this.floor*.014;
  const quality=Math.min(4,Math.max(minQuality,roll>.99?4:roll>.87?3:roll>.65?2:roll>.34?1:0));
  const def=chosenDef||this.rng.pick(EQUIPMENT);const factor=1+quality*.3;const mods:Mods={};for(const[k,v]of Object.entries(def.mods))mods[k as keyof Stats]=v!*factor;
  const affixes=this.rng.shuffle(AFFIXES).slice(0,quality===0?0:quality===4?3:quality>=2?2:1).map(a=>({name:a.name,mods:{...a.mods}}));
  for(const a of affixes)for(const[k,v]of Object.entries(a.mods))mods[k as keyof Stats]=(mods[k as keyof Stats]||0)+v!;
  const effects=def.effects.map(e=>({...e,amount:e.amount*factor}));
  if(quality>=3)effects.push(fxLegend(def.tag,quality));
  return{uid:this.uid++,def,quality,affixes,mods,effects};
 }
 equip(gear:Gear){this.equipment[gear.def.slot]=gear;this.seen.add(gear.def.id);this.recalculate();this.note(`装备 ${gear.def.name}`);this.revision++;}
 chooseLoot(take:boolean){if(this.panel!=='loot')return;const gear=this.loot.shift();if(gear){if(take)this.equip(gear);else this.addGold(8+gear.quality*9);}this.open(null);if(!this.loot.length&&this.lootReturn){const panel=this.lootReturn;this.lootReturn=null;this.open(panel);}else this.checkPanels();}
 addWeapon(id:string,replace?:number){const own=this.weapons.find(w=>w.id===id);if(own)own.level=Math.min(5,own.level+1);else if(this.weapons.length<3)this.weapons.push({id,level:1,timer:.2,burst:0});else if(replace!==undefined)this.weapons[replace]={id,level:1,timer:.2,burst:0};else return false;this.seen.add(id);this.note(`取得 ${WEAPONS.find(w=>w.id===id)?.name}`);this.revision++;return true;}
 addPassive(id:string){const p=PASSIVES.find(p=>p.id===id);if(!p)return;this.passives[id]=Math.min(p.max,(this.passives[id]||0)+1);this.seen.add(id);this.recalculate();this.note(`领悟 ${p.name}`);this.revision++;}
 levelChoices(){
  const available=PASSIVES.filter(p=>(this.passives[p.id]||0)<p.max);const weight=(p:Passive)=>this.weapons.some(w=>WEAPONS.find(x=>x.id===w.id)?.tag===p.tag)?3:1;
  const passives=available.map(p=>({id:p.id,r:this.rng.next()**(1/weight(p))})).sort((a,b)=>b.r-a.r).slice(0,2).map(p=>({kind:'passive' as const,id:p.id}));
  const weaponPool=WEAPONS.filter(w=>!this.weapons.some(o=>o.id===w.id&&o.level>=5));const own=this.weapons.filter(w=>w.level<5);
  const id=own.length&&this.rng.next()<.55?this.rng.pick(own).id:this.rng.pick(weaponPool).id;
  this.choices=this.rng.shuffle([...passives,{kind:'weapon' as const,id}]);
 }
 chooseUpgrade(index:number,replace?:number){if(this.panel!=='level'||this.pendingLevels<=0)return false;const c=this.choices[index];if(!c)return false;if(c.kind==='weapon'){if(!this.addWeapon(c.id,replace))return false;}else this.addPassive(c.id);this.pendingLevels--;this.open(null);this.onSound?.('upgrade');this.checkPanels();return true;}
 reroll(){if(this.rerolls<=0)return;this.rerolls--;this.levelChoices();this.revision++;}
 gainXp(amount:number){this.xp+=amount*this.stats.xpBonus;while(this.xp>=this.needXp){this.xp-=this.needXp;this.level++;this.needXp=24+this.level*13;this.pendingLevels++;}}
 addGold(amount:number){const n=Math.round(amount*this.stats.goldBonus);this.gold+=n;this.totalGold+=n;}
 heal(n:number){this.hp=Math.min(this.stats.maxHp,this.hp+n);}
 checkPanels(){if(this.phase==='dead'||this.phase==='victory')return;if(this.panel)return;if(this.pendingLevels>0){this.levelChoices();this.open('level');}else if(this.loot.length)this.open('loot');else if(this.phase==='between')this.open('clear');}
 startCombat(type:NodeType){
  this.phase='combat';this.room=type;this.roomTime=0;this.duration=type==='elite'?35+Math.min(20,this.floor)*2:26+Math.min(20,this.floor)*2;this.spawnTimer=.4;this.mutationTimer=5;this.fortune=0;this.enemies=[];this.drops=[];this.hazards=[];this.turrets=[];this.releaseAll();this.open(null);
  if(type==='boss'){const boss=this.spawnEnemy(ENEMIES[4],W/2,105,true,this.bossId);this.note(`${BOSSES[this.bossId].name} 已苏醒`);boss.action=2;if(this.floor>8&&this.floor%8===0){const partner=this.spawnEnemy(ENEMIES[4],510,105,true,(this.bossId+3)%8);for(const e of [boss,partner]){e.maxHp*=.65;e.hp=e.maxHp;}partner.action=3;}this.open('bossintro');}
  if(type==='elite')this.spawnEnemy(this.rng.pick(ENEMIES.filter(e=>e.floor<=this.floor+1)),W/2,75,true);
 }
 enterNode(col:number){
  if(this.panel!=='map'||this.row>=4||Math.abs(col-this.col)>1)return;this.row++;this.col=col;this.visited.push({row:this.row,col});const type=this.route[this.row][col];this.room=type;
  if(type==='battle'||type==='elite'||type==='boss')this.startCombat(type);else{this.phase='between';this.eventId='';this.open(type);if(type==='shop'){this.refreshes=0;this.makeShop();}}
 }
 next(){
  if(this.row===4){if(this.floor>=TOWER_LIMIT&&this.mode!=='endless'){this.phase='victory';this.open(null);return;}this.floor++;this.row=0;this.col=1;this.buildRoute();this.startCombat('battle');}
  else this.open('map');
 }
 makeShop(){
  this.shop=[{kind:'gear',gear:this.createGear(1),cost:50+this.floor*8,sold:false},{kind:'weapon',id:this.rng.pick(WEAPONS).id,cost:45+this.floor*6,sold:false},{kind:'passive',id:this.rng.pick(PASSIVES.filter(p=>(this.passives[p.id]||0)<p.max)).id,cost:35+this.floor*5,sold:false},{kind:'heal',cost:20+this.floor*3,sold:false}];this.revision++;
 }
 refreshShop(){const cost=15+this.refreshes*10;if(this.gold<cost)return;this.gold-=cost;this.refreshes++;this.makeShop();}
 buy(index:number,replace?:number){const item=this.shop[index];if(!item||item.sold||this.gold<item.cost)return false;if(item.kind==='weapon'&&!this.addWeapon(item.id!,replace))return false;
  this.gold-=item.cost;item.sold=true;if(item.kind==='gear'){this.loot.push(item.gear!);this.lootReturn='shop';this.open('loot');}if(item.kind==='passive')this.addPassive(item.id!);if(item.kind==='heal')this.heal(35);this.revision++;return true;
 }
 eventAction(o:EventOption,replace?:number){
  if(this.panel!=='event'&&this.panel!=='altar')return false;
  if(this.gold<(o.cost||0)||this.hp<=(o.blood||0))return false;if(o.op==='upgrade'&&!Object.keys(this.equipment).length)return false;
  if(o.op==='weapon'&&this.weapons.length>=3&&replace===undefined)return false;
  this.gold-=o.cost||0;this.hp-=o.blood||0;
  const randomPassive=()=>this.rng.pick(PASSIVES.filter(p=>(this.passives[p.id]||0)<p.max)).id;
  switch(o.op){
   case'gear':this.loot.push(this.createGear(o.amount));if(o.amount===0)this.addGold(20);break;
   case'weapon':this.addWeapon(this.rng.pick(WEAPONS).id,replace);if(o.risk===1)this.baseCurse++;break;
   case'passive':this.addPassive(o.amount===2?'lucky':randomPassive());break;
   case'heal':this.heal(o.amount);break;
   case'gold':this.addGold(o.amount);if(o.risk&&this.rng.next()<o.risk){this.hp=Math.max(1,this.hp-18);this.note('暗藏机关：失去 18 生命');}break;
   case'curse':this.baseCurse+=o.amount===3?2:1;if(o.amount===1)this.addPassive(randomPassive());else if(o.amount===4)this.addGold(70);else this.loot.push(this.createGear(o.amount===3?3:1));break;
   case'cleanse':this.baseCurse=Math.max(0,this.baseCurse-o.amount);if(!o.cost&&!o.blood)this.heal(18);break;
   case'upgrade':{const gear=this.rng.pick(Object.values(this.equipment));if(gear.quality<4){gear.quality++;for(const[k,v]of Object.entries(gear.mods))gear.mods[k as keyof Stats]=v!*1.18;gear.effects=gear.effects.map(e=>({...e,amount:e.amount*1.18}));}break;}
   case'gamble':if(this.rng.next()<.55){this.addGold(o.amount);this.note('赌赢了：金币入袋');}else this.note('赌输了：空空如也');break;
   case'reroll':this.rerolls+=o.amount;break;
   case'hp':this.extraMods.maxHp=(this.extraMods.maxHp||0)+o.amount;break;
   case'shield':this.shield=Math.min(this.stats.shieldMax,this.shield+o.amount);break;
   case'fight':this.recalculate();this.startCombat('elite');return true;
   case'boss':this.strongBoss=true;this.note('下一个 Boss 已强化，奖励品质 +2');break;
   case'sacrifice':this.extraMods.maxHp=(this.extraMods.maxHp||0)-o.amount;this.extraMods.damage=(this.extraMods.damage||0)+.3;break;
   case'trade':this.addGold(o.amount);break;
  }
  this.recalculate();this.open(null);if(this.loot.length)this.open('loot');else this.next();return true;
 }
 releaseAll(){for(const s of this.shots){s.active=false;this.shotPool.push(s);}for(const b of this.bullets){b.active=false;this.bulletPool.push(b);}this.shots=[];this.bullets=[];}
 spawnEnemy(def:EnemyDef,x=this.rng.range(50,W-50),y=-25,elite=false,boss=-1):Enemy{
  if(boss>=0){const b=BOSSES[boss];def={...def,id:b.id,name:b.name,behavior:'walk',color:b.color,radius:38};}
  const scale=floorValue(DIFFICULTY.enemyHealth,this.floor)*(1+this.row*DIFFICULTY.roomHealthStep)*(1+this.curse*.08)*this.mutation.health;
  const maxHp=boss>=0?BOSSES[boss].hp*floorValue(DIFFICULTY.bossHealth,this.floor)*(this.strongBoss?1.4:1)*(1+this.curse*.06):def.hp*scale*(elite?floorValue(DIFFICULTY.eliteHealth,this.floor):1);
  const affix=elite?this.rng.pick(ENEMY_AFFIXES):this.floor>1&&this.rng.next()<Math.min(.4,.12+(this.floor-2)*.025+this.curse*.01)?this.rng.pick(ENEMY_AFFIXES):'';
  const e:Enemy={uid:this.uid++,def,x,y,hp:maxHp,maxHp,age:0,action:this.rng.range(1.4,3),flash:0,poison:0,poisonTime:0,burn:0,burnTime:0,bleed:0,bleedTime:0,ice:0,iceTime:0,frozen:0,snare:0,mark:0,markTime:0,tick:0,revived:false,elite,affix,barrier:boss<0&&this.mutation.id==='ward'?1:0,boss,phase:0,targetX:this.x,dead:false,entering:boss<0&&y<COMBAT_FEEL.enemyEntryLine};
  if(affix==='铁壁'){e.maxHp*=1.4;e.hp=e.maxHp;}if(this.enemies.length<130)this.enemies.push(e);else e.dead=true;this.seen.add(def.id);if(boss>=0)this.seen.add(BOSSES[boss].id);return e;
 }
 advance(realDt:number,input:number,targetX?:number){
  if(!Number.isFinite(realDt)||realDt<=0||this.panel||this.phase!=='combat')return;
  const scaled=Math.min(realDt,.05)*this.meta.settings.gameSpeed,steps=Math.ceil(scaled/(1/60));
  for(let i=0;i<steps;i++){if(this.panel||this.phase!=='combat')break;this.tick(scaled/steps,input,targetX);}
 }
 tick(dt:number,input:number,targetX?:number){
  dt=Math.min(dt,.05);for(const v of this.vfx)v.life-=dt;this.vfx=this.vfx.filter(v=>v.life>0);
  if(this.panel||this.phase!=='combat')return;
  this.time+=dt;this.roomTime+=dt;this.skillCD=Math.max(0,this.skillCD-dt);this.invincible=Math.max(0,this.invincible-dt);this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=0;
  for(const[k,v]of this.effectCooldown){if(v<=dt)this.effectCooldown.delete(k);else this.effectCooldown.set(k,v-dt);}
  const movement=300*this.stats.move*dt;
  if(targetX!==undefined)this.x+=Math.max(-movement,Math.min(movement,targetX-this.x));else this.x+=input*movement;
  this.x=Math.max(28,Math.min(W-28,this.x));
  this.second+=dt;if(this.second>=1){this.second--;this.heal(this.stats.regen);this.trigger('second');}
  this.spawnTimer-=dt;
  if(this.room!=='boss'&&this.roomTime<this.duration&&this.spawnTimer<=0&&this.enemies.length<130){
   const pool=this.floor===1&&this.row===0&&this.roomTime<8?ENEMIES.slice(0,3):ENEMIES.filter(e=>e.floor<=this.floor);const count=this.roomTime<5?1:Math.min(5,1+Math.floor(this.floor/2)+Math.floor(this.roomTime/16));
   for(let i=0;i<count;i++){const def=this.rng.pick(pool);this.spawnEnemy(def);if(def.behavior==='swarm')for(let j=0;j<2;j++)this.spawnEnemy(def);}
   this.spawnTimer=Math.max(.38,1.6-this.floor*.09-this.roomTime*.008);
  }
  this.mutationTimer-=dt;if(this.mutationTimer<=0){this.mutationTimer=this.mutation.id==='rift'?6:5;if(this.mutation.id==='storm')for(let i=0;i<3;i++)this.enemyBullet(this.rng.range(40,W-40),25,Math.PI/2,170,10,'#d2db8f');if(this.mutation.id==='rift')this.hazards.push({x:this.x,y:PLAYER_Y,r:30,timer:1.5,life:1.85,damage:14,color:'#b899d9',kind:'line',fired:false});}
  for(const own of this.weapons){own.timer-=dt;if(own.timer<=0){const weapon=WEAPONS.find(w=>w.id===own.id)!;this.fireWeapon(weapon,own.level);own.volleys=(own.volleys||0)+1;if(own.awakened&&own.volleys%4===0){this.fireWeapon(weapon,own.level);this.effect(this.x,PLAYER_Y-65,'text','觉醒重奏',weapon.color);}own.timer=weapon.interval/this.stats.speed*(weapon.charge?.95:1);}}
  this.updateTurrets(dt);this.updateEnemies(dt);this.updateShots(dt);this.updateBullets(dt);this.updateHazards(dt);this.updateDrops(dt);
  if(this.hp<=0)return;
  this.enemies=this.enemies.filter(e=>!e.dead);
  if((this.room==='boss'&&!this.enemies.some(e=>e.boss>=0))||(this.room!=='boss'&&this.roomTime>=this.duration&&this.enemies.length===0))this.finishRoom();
  this.checkPanels();
 }
 private updateTurrets(dt:number){for(const t of this.turrets){t.life-=dt;t.timer-=dt;if(t.timer<=0){const target=this.nearest(t.x,t.y);if(target){this.launch(t.weapon,t.level,t.x,t.y,Math.atan2(target.y-t.y,target.x-t.x),true);t.timer=.35/this.stats.speed;}}}this.turrets=this.turrets.filter(t=>t.life>0);}
 fireWeapon(weapon:Weapon,level:number,originX=this.x,originY=PLAYER_Y){
  const count=Math.min(12,(weapon.count||1)+Math.floor(this.stats.projectiles));const extra=Math.floor(this.stats.projectiles);
  if(weapon.pattern==='turret'){if(this.turrets.length<6)this.turrets.push({x:originX,y:PLAYER_Y-35,weapon,level,life:7*this.stats.duration,timer:0});return;}
  if(weapon.pattern==='satellite'&&this.shots.filter(s=>s.active&&s.weapon.pattern==='satellite').length>=12)return;
  if(['gravity','seeds','tether'].includes(weapon.pattern)&&this.shots.filter(s=>s.active&&s.weapon.pattern===weapon.pattern).length>=16)return;
  for(let i=0;i<count;i++){
   let x=originX,y=originY,angle=-Math.PI/2;
   switch(weapon.pattern){
    case'fan':case'shotgun':angle+=(i-(count-1)/2)*(weapon.pattern==='shotgun'?.15:.16);break;
    case'aim':{const target=this.nearest(originX,originY);if(target)angle=Math.atan2(target.y-originY,target.x-originX)+(i-(count-1)/2)*.08;break;}
    case'cross':x+=i%2?-50:50;angle+=(i%2?-.2:.2);break;
    case'discus':angle+=(i%2?-.42:.42);break;
    case'satellite':y=PLAYER_Y-170;break;
    case'rain':{const target=this.rng.pick(this.enemies.filter(e=>!e.dead));x=target?target.x+this.rng.range(-25,25):this.rng.range(50,W-50);y=target?Math.max(25,target.y-130):40;angle=Math.PI/2;break;}
    case'mine':x=this.rng.range(80,W-80);y=this.rng.range(200,410);break;
    case'burst':y-=i*24;x+=(i%3-1)*9;break;
    case'scythe':case'orbit':x+=(i-(count-1)/2)*24;angle+=(i-(count-1)/2)*.09;break;
    default:x+=(i-(count-1)/2)*14;
   }
   const s=this.launch(weapon,level,x,y,angle,false);if(weapon.pattern==='burst')s.damage*=1+(weapon.charge?.1:0);if(extra>0&&i>=(weapon.count||1))s.damage*=.85;
  }
  this.onSound?.('throw');
 }
 launch(weapon:Weapon,level:number,x:number,y:number,angle:number,turret=false,child=false):Shot{
  const s=this.shotPool.pop()||{hits:new Set<number>()} as Shot;
  const own=this.weapons.find(w=>w.id===weapon.id),forged=own?.forged||0;
  s.hits.clear();Object.assign(s,{active:true,uid:this.uid++,x,y,vx:Math.cos(angle)*weapon.speed*COMBAT_FEEL.playerShotSpeed,vy:Math.sin(angle)*weapon.speed*COMBAT_FEEL.playerShotSpeed,age:0,life:['gravity','seeds','tether','satellite'].includes(weapon.pattern)?6:weapon.returning?8:weapon.pattern==='mine'?8:4.5,damage:weapon.damage*(1+(level-1)*.28)*this.power()*(1+forged*.18)*(turret?this.stats.turretPower:1)*(weapon.returning?this.stats.returnPower:1),weapon,level,pierce:(weapon.pierce||0)+Math.floor(this.stats.pierce)+(forged>=2?1:0),bounce:(weapon.bounce||0)+Math.floor(this.stats.bounce),returning:!!weapon.returning,turned:false,turret,child,seed:this.rng.next()*Math.PI*2,lastHit:0});
  s.anchorY=['gravity','seeds'].includes(weapon.pattern)?Math.max(105,Math.min(620,(this.nearest(x,y)?.y??410)+25)):undefined;
  if(this.shots.length<650)this.shots.push(s);else{s.active=false;this.shotPool.push(s);}return s;
 }
 private updateShots(dt:number){
  const grid=new Map<number,Enemy[]>();for(const e of this.enemies){if(e.dead)continue;const key=Math.floor(e.x/64)+Math.floor(e.y/64)*20;const cell=grid.get(key)||[];cell.push(e);grid.set(key,cell);}
  for(const s of this.shots){
   if(!s.active)continue;s.age+=dt;s.life-=dt;
   const oldX=s.x,oldY=s.y;
   const pattern=s.weapon.pattern;
   if(pattern==='mirror'&&!s.child&&s.age>=.45&&s.lastHit===0){s.lastHit=this.time;for(const angle of [-Math.PI/2-.3,-Math.PI/2+.3]){const copy=this.launch(s.weapon,s.level,s.x,s.y,angle,false,true);copy.damage=s.damage*.55;}}
   if(pattern==='satellite'){
    s.x=this.x+Math.cos(s.age*3.5+s.seed)*100;s.y=PLAYER_Y-145+Math.sin(s.age*3.5+s.seed)*65;
    if(this.time-s.lastHit>.3){s.hits.clear();s.lastHit=this.time;}
    for(const b of this.bullets)if(b.active&&Math.hypot(b.x-s.x,b.y-s.y)<24){b.active=false;this.effect(s.x,s.y,'nova','','#99d9ef',25);}
   }
   if(['gravity','seeds','tether'].includes(pattern)&&(pattern==='tether'?s.age>.6:s.y<=(s.anchorY??435))){
    s.vx=0;s.vy=0;
    if(pattern==='gravity')for(const e of this.enemies)if(!e.dead&&e.boss<0&&Math.hypot(e.x-s.x,e.y-s.y)<150*this.stats.area){e.x+=(s.x-e.x)*dt*1.5;e.y+=(s.y-e.y)*dt*.75;}
    if(this.time-s.lastHit>.45){s.lastHit=this.time;
     if(pattern==='tether'){
      const targets=this.enemies.filter(e=>!e.dead).sort((a,b)=>b.maxHp-a.maxHp).slice(0,2);
      if(targets.length===2){const [a,b]=targets;this.effect(a.x,a.y,'chain','',s.weapon.color,0,b.x,b.y);for(const e of this.enemies)if(!e.dead&&segmentDistance(e.x,e.y,a.x,a.y,b.x,b.y)<e.def.radius+12)this.damageEnemy(e,s.damage);}
      else if(targets[0])this.damageEnemy(targets[0],s.damage*.5);
     }else{this.effect(s.x,s.y,'nova','',s.weapon.color,pattern==='gravity'?145:105);for(const e of this.enemies)if(!e.dead&&Math.hypot(e.x-s.x,e.y-s.y)<(pattern==='gravity'?145:105)*this.stats.area){if(pattern==='seeds'){e.snare=Math.max(e.snare,.8);this.applyStatus(e,'poison',1);}this.damageEnemy(e,s.damage*.5);}}
    }
    if(s.life<=0)s.active=false;continue;
   }
   if(s.returning&&!s.turned&&(s.age>2.6||s.y<30)){s.turned=true;s.hits.clear();s.vy=Math.abs(s.vy);s.vx*=.5;}
   if(s.turned){const a=Math.atan2(PLAYER_Y-s.y,this.x-s.x);s.vx=Math.cos(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed;s.vy=Math.sin(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed;if(Math.hypot(s.x-this.x,s.y-PLAYER_Y)<23){s.active=false;this.trigger('return',undefined,s);if(s.weapon.id==='glaive')for(const d of this.drops)d.y=PLAYER_Y-50;continue;}}
   if(s.weapon.homing&&!s.turned){const target=this.nearest(s.x,s.y,s.hits);if(target){const a=Math.atan2(target.y-s.y,target.x-s.x);s.vx+=(Math.cos(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed-s.vx)*Math.min(1,dt*7);s.vy+=(Math.sin(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed-s.vy)*Math.min(1,dt*7);}}
   if(s.weapon.pattern==='wave'||s.weapon.pattern==='orbit')s.vx=Math.cos(s.age*5+s.seed)*135*COMBAT_FEEL.playerShotSpeed;
   s.x+=s.vx*dt;s.y+=s.vy*dt;
   if(pattern==='discus'&&(s.x<14||s.x>W-14)){s.x=Math.max(14,Math.min(W-14,s.x));s.vx*=-1;s.damage*=1.12;s.hits.clear();this.effect(s.x,s.y,'nova','反壁',s.weapon.color,28);}
   if(s.bounce>0&&(s.x<14||s.x>W-14)){s.x=Math.max(14,Math.min(W-14,s.x));s.vx*=-1;s.bounce--;}
   if(s.life<=0||s.x<-40||s.x>W+40||s.y<-50||s.y>H+30){s.active=false;continue;}
   const cx=Math.floor(s.x/64),cy=Math.floor(s.y/64);const candidates:Enemy[]=[];
   for(let gx=cx-1;gx<=cx+1;gx++)for(let gy=cy-1;gy<=cy+1;gy++){const cell=grid.get(gx+gy*20);if(cell)candidates.push(...cell);}
   for(const e of candidates){
    if(e.dead||(!s.active)||s.hits.has(e.uid))continue;
    const radius=(e.boss>=0?38:e.def.radius)+(s.weapon.heavy?COMBAT_FEEL.heavyShotRadius:COMBAT_FEEL.playerShotRadius);
    const distance=segmentDistance(e.x,e.y,oldX,oldY,s.x,s.y);
    if(distance>radius)continue;
    if(s.weapon.pattern==='mine'&&Math.hypot(e.x-s.x,e.y-s.y)>40)continue;
    if(e.def.behavior==='stealth'&&e.age%4<1.8&&e.y<450&&this.rng.next()<.6)continue;
    s.hits.add(e.uid);
    if(s.weapon.pattern==='drill'&&this.time-s.lastHit>.16){s.hits.delete(e.uid);s.lastHit=this.time;}
    if((e.def.behavior==='shield'&&e.age%3<1.3||e.barrier>0)&&s.pierce<=0){e.barrier=0;s.active=false;this.effect(e.x,e.y,'text','格挡','#97cce1');continue;}
    if(e.def.behavior==='reflect'&&s.pierce<=0&&this.rng.next()<.3)this.shootAtPlayer(e,160);
    let damage=s.damage;const d=PLAYER_Y-e.y;damage*=1+(d>300?(s.weapon.far||0)+this.stats.farPower:d<170?(s.weapon.close||0)+this.stats.closePower:0);
    if(s.weapon.id==='coinblade')damage*=1+Math.min(12,this.gold/100)*.06;
    if(s.weapon.combo)damage*=1+Math.min(20,this.combo)*.025;
    const crit=this.rng.next()<this.stats.crit;if(crit)damage*=this.stats.critPower;
    this.applyStatus(e,s.weapon.status,1,s.damage);
    if(pattern==='net'){for(const target of this.enemies)if(!target.dead&&Math.hypot(target.x-e.x,target.y-e.y)<110*this.stats.area)target.snare=Math.max(target.snare,2.5*this.stats.duration);this.effect(e.x,e.y,'nova','捕获',s.weapon.color,110);}
    if(pattern==='harpoon'&&!s.turned){if(e.boss<0)e.y=Math.max(40,e.y-100);e.snare=Math.max(e.snare,.6);s.turned=true;s.hits.clear();}
    if(e.boss<0&&e.hp/e.maxHp<Math.max(s.weapon.execute||0,this.stats.execute))damage=e.hp+100;
    this.damageEnemy(e,damage,crit,s,false);this.combo++;this.comboTimer=2;
    if(s.weapon.explosive)this.nova(e.x,e.y,s.weapon.explosive*this.stats.area,damage*.75,e.uid,s.weapon.status);
    if(s.weapon.split&&!s.child){for(let i=0;i<s.weapon.split;i++){const c=this.launch(WEAPONS[0],s.level,e.x,e.y,-Math.PI/2+(i-(s.weapon.split-1)/2)*.4,s.turret,true);c.damage=s.damage*.45;c.hits.add(e.uid);}}
    if(s.bounce>0){s.bounce--;const target=this.nearest(e.x,e.y,s.hits);if(target){const a=Math.atan2(target.y-e.y,target.x-e.x);s.vx=Math.cos(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed;s.vy=Math.sin(a)*s.weapon.speed*COMBAT_FEEL.playerShotSpeed;}else{s.vx*=-1;}s.damage*=.92;}
    else if(s.pierce>0)s.pierce--;else if(!s.returning&&pattern!=='satellite'&&!['gravity','seeds','tether'].includes(pattern))s.active=false;
   }
  }
  const alive:Shot[]=[];for(const s of this.shots){if(s.active)alive.push(s);else this.shotPool.push(s);}this.shots=alive;
 }
 applyStatus(e:Enemy,status:Weapon['status'],stacks:number,damage=12){
  if(!status||e.dead)return;if(e.def.behavior==='resist')stacks*=.3;
  const duration=4*this.stats.duration;
  switch(status){
   case'poison':e.poison=Math.min(30,e.poison+stacks);e.poisonTime=duration;break;
   case'fire':e.burn=Math.min(12,e.burn+stacks);e.burnTime=duration;break;
   case'bleed':e.bleed=Math.min(20,e.bleed+stacks);e.bleedTime=duration;break;
   case'ice':e.ice+=stacks;e.iceTime=3*this.stats.duration;if(e.ice>=4){e.ice=0;e.frozen=e.boss>=0?.5:1.6*this.stats.duration;this.effect(e.x,e.y,'text','冻结','#9cdfff');this.trigger('freeze',e);}break;
   case'lightning':this.chain(e.x,e.y,damage*.4,160*this.stats.area,e.uid);break;
  }
 }
 damageEnemy(e:Enemy,amount:number,crit=false,shot?:Shot,proc=true){
  if(e.dead)return;let damage=amount*(1+e.mark);if(e.def.behavior==='tank'&&!proc)damage*=.75;
  if(e.boss===0&&this.enemies.some(a=>a.boss<0&&a.def.behavior==='shield'&&!a.dead))damage*=.35;
  e.hp-=damage;e.flash=.1;
  if(this.meta.settings.numbers&&(crit||this.rng.next()<.5))this.effect(e.x+this.rng.range(-8,8),e.y-15,crit?'crit':'hit',`${crit?'✦ ':''}${Math.ceil(damage)}`,crit?'#ffdc82':'#e0e5da');
  if(!proc){this.trigger('hit',e,shot,damage);if(crit){this.trigger('crit',e,shot,damage);this.onSound?.('crit');}if(this.stats.lifeSteal)this.heal(Math.min(3,damage*this.stats.lifeSteal));}
  if(e.hp<=0)this.killEnemy(e,shot);
 }
 killEnemy(e:Enemy,shot?:Shot){
  if(e.dead)return;if(e.def.behavior==='revive'&&!e.revived&&e.boss<0){e.revived=true;e.hp=e.maxHp*.5;e.frozen=1;this.effect(e.x,e.y,'text','复生','#d4cc8f');return;}
  e.dead=true;this.kills++;this.bountyStep('hunter');if(e.elite&&e.boss<0)this.bountyStep('breaker');this.effect(e.x,e.y,'death','',e.def.color,e.def.radius);this.trigger('kill',e,shot,shot?.damage||20*this.power());
  if(e.burn>0)this.nova(e.x,e.y,60,0,e.uid,'fire');
  const xp=e.boss>=0?150+this.floor*45:e.def.xp*(e.elite?2.5:1)*(1+Math.max(0,this.floor-8)*.07);this.drop('xp',e.x,e.y,xp);this.drop('gold',e.x+10,e.y,(e.boss>=0?100:this.rng.range(2,5)*(e.affix==='富饶'?3:1))*this.mutation.gold);
  if(e.boss>=0){this.bossKills++;this.bossReward++;this.loot.push(this.createGear(Math.min(4,2+(this.strongBoss?2:0))));if(!this.enemies.some(a=>a.boss>=0&&!a.dead)){this.strongBoss=false;this.releaseAll();this.hazards=[];for(const a of this.enemies)if(a!==e)a.dead=true;}this.onSound?.('bosskill');}
  else if(e.elite||this.kills===1||this.rng.next()<.055+this.stats.luck*.025){const gear=this.createGear(e.elite?2:0);this.drop('gear',e.x,e.y,0,gear);}
  if(e.def.behavior==='split'&&this.enemies.length<130&&e.boss<0)for(let i=0;i<3;i++)this.spawnEnemy(ENEMIES[0],e.x+(i-1)*22,e.y);
  if(e.def.behavior==='bomb'&&e.boss<0){for(let i=0;i<6;i++)this.enemyBullet(e.x,e.y,i*Math.PI/3,120,9);}
 }
 private updateEnemies(dt:number){
  for(const e of this.enemies){
   if(e.dead)continue;e.age+=dt;e.action-=dt;e.flash=Math.max(0,e.flash-dt);e.frozen=Math.max(0,e.frozen-dt);e.snare=Math.max(0,e.snare-dt);e.markTime=Math.max(0,e.markTime-dt);if(!e.markTime)e.mark=0;
   e.poisonTime-=dt;e.burnTime-=dt;e.bleedTime-=dt;e.iceTime-=dt;if(e.poisonTime<=0)e.poison=0;if(e.burnTime<=0)e.burn=0;if(e.bleedTime<=0)e.bleed=0;if(e.iceTime<=0)e.ice=0;
   e.tick+=dt;if(e.tick>=.5){e.tick=0;const damage=(e.poison*3+e.burn*4+e.bleed*2.5)*this.stats.statusPower*this.power();if(damage>0)this.damageEnemy(e,damage);if(e.affix==='再生')e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.008);}
   if(e.dead||e.frozen>0)continue;
   if(e.boss>=0){this.updateBoss(e,dt);continue;}
   if(e.entering){const entrySpeed=COMBAT_FEEL.enemyEntrySpeed*(e.ice>0?.55:1)*(e.snare>0?.35:1);e.y=Math.min(COMBAT_FEEL.enemyEntryLine,e.y+entrySpeed*dt);if(e.y>=COMBAT_FEEL.enemyEntryLine)e.entering=false;continue;}
   let speed=e.def.speed*(1+Math.min(20,this.floor-1)*.05)*(e.ice>0?.55:1)*(e.snare>0?.35:1)*(e.affix==='迅捷'?1.5:1)*this.mutation.speed;
   if(e.def.behavior==='rage'&&e.hp/e.maxHp<.5)speed*=2.4;
   if(this.enemies.some(a=>a.def.behavior==='aura'&&!a.dead&&Math.hypot(a.x-e.x,a.y-e.y)<130))speed*=1.3;
   switch(e.def.behavior){
    case'zigzag':case'swarm':e.x+=Math.sin(e.age*4+e.uid)*65*dt;break;
    case'charge':if(e.age%4>2.7){speed*=5;e.x+=(e.targetX-e.x)*dt*3;}else if(e.age%4>2){speed=0;e.targetX=this.x;}break;
    case'ranged':case'snipe':case'summon':case'heal':case'pull':case'ward':case'mine':if(e.y>210&&this.roomTime<this.duration)speed=0;break;
   }
   e.y+=speed*dt;e.x=Math.max(20,Math.min(W-20,e.x));
   if(e.action<=0){
    switch(e.def.behavior){
     case'ranged':this.shootAtPlayer(e,145);break;
     case'snipe':this.hazards.push({x:this.x,y:PLAYER_Y,r:18,timer:1.1,life:1.4,damage:e.def.damage,color:'#ea8b91',kind:'line',fired:false});break;
     case'summon':if(this.enemies.length<120)this.spawnEnemy(ENEMIES[3],e.x+this.rng.range(-50,50),e.y+25);break;
     case'heal':for(const a of this.enemies)if(!a.dead&&Math.hypot(e.x-a.x,e.y-a.y)<160)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.08);this.effect(e.x,e.y,'heal','治愈','#9fdf95',100);break;
     case'teleport':e.x=this.rng.range(40,W-40);e.y+=35;this.effect(e.x,e.y,'nova','','#baa1ed',28);break;
     case'mine':this.hazards.push({x:this.x,y:PLAYER_Y,r:65,timer:1.8,life:2.2,damage:18,color:'#e8ac74',kind:'circle',fired:false});break;
     case'pull':this.x+=(e.x-this.x)*.3;this.effect(this.x,PLAYER_Y,'text','牵引','#aba3df');break;
     case'egg':if(this.enemies.length<120)for(let i=0;i<3;i++)this.spawnEnemy(ENEMIES[22],e.x+i*12,e.y);e.dead=true;break;
     case'ward':for(const a of this.enemies)if(Math.hypot(e.x-a.x,e.y-a.y)<130)a.barrier=1;break;
     case'dash':e.x=this.rng.range(40,W-40);e.y+=65;break;
    }
    if(e.affix==='霜息'||e.affix==='燃烧')this.shootAtPlayer(e,120);
    e.action=e.def.behavior==='egg'?8:e.def.behavior==='summon'?4:3;
   }
   if(e.y>PLAYER_Y-15){this.hurt(e.def.damage*(e.elite?1.4:1)*(e.affix==='狂暴'?1.5:1),e);if(e.def.behavior==='leech'||e.affix==='吸血')for(const a of this.enemies)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.06);e.dead=true;this.combo=0;}
  }
 }
 private updateBoss(e:Enemy,dt:number){
  const ratio=e.hp/e.maxHp;const phase=e.boss===7||this.floor>8?(ratio<.32?2:ratio<.65?1:0):ratio<.5?1:0;
  if(e.phase!==phase){e.phase=phase;this.effect(e.x,e.y,'skill',BOSSES[e.boss].phases[phase]||'极限异变','#ffcc8d',100);e.action=.5;this.onSound?.('bossphase');}
  const bosses=this.enemies.filter(a=>a.boss>=0&&!a.dead),duo=bosses.length>1;
  e.x=(duo?(bosses.indexOf(e)?510:210):W/2)+Math.sin(e.age*(.5+phase*.2))*(duo?75:170);e.y=100+Math.sin(e.age*.9)*25;
  if(e.action>0)return;
  const fan=(n:number,speed:number,spread=.15)=>{const a=Math.atan2(PLAYER_Y-e.y,this.x-e.x);for(let i=0;i<n;i++)this.enemyBullet(e.x,e.y,a+(i-(n-1)/2)*spread,speed,12+this.floor*1.5,BOSSES[e.boss].color);};
  const lane=(x:number,r=50,timer=1.5)=>this.hazards.push({x,y:PLAYER_Y,r,timer,life:timer+.35,damage:18+this.floor*2,color:BOSSES[e.boss].color,kind:'line',fired:false});
  switch(e.boss){
   case 0:fan(phase?9:5,130+phase*30);if(Math.floor(e.age/3)%2===0&&this.enemies.length<8){for(let i=0;i<2;i++)this.spawnEnemy(ENEMIES[5],e.x+(i?70:-70),e.y+60);}else lane(this.x,32);break;
   case 1:fan(phase?11:6,120,.2);if(this.enemies.length<12)this.spawnEnemy(ENEMIES[23],this.rng.range(100,W-100),200);if(phase)lane(this.rng.range(80,W-80),65,1.7);break;
   case 2:lane(this.x,70,1.25);if(phase){lane(Math.max(70,this.x-180),60,1.8);lane(Math.min(W-70,this.x+180),60,1.8);}for(let i=0;i<7;i++)this.enemyBullet(e.x,e.y,Math.PI*.2+i*Math.PI*.1,155,15,'#e7ab7c');break;
   case 3:for(let i=0;i<6+phase*3;i++){this.enemyBullet(60,e.y,Math.PI*.15+i*.11,140,12,'#9fddff');this.enemyBullet(W-60,e.y,Math.PI*.85-i*.11,140,12,'#9fddff');}lane(e.age%6<3?120:600,70,1.6);break;
   case 4:for(let i=0;i<12+phase*6;i++)this.enemyBullet(e.x,e.y,i*Math.PI*2/(12+phase*6)+e.age*.15,135,15,'#e8cd81');if(this.enemies.length<6)this.spawnEnemy(ENEMIES[10],this.rng.range(100,W-100),190);break;
   case 5:if(Math.floor(e.age/2)%2===0){for(const b of this.bullets){b.vy*=-1;b.vx*=-1;b.life+=2;}this.effect(e.x,e.y,'skill','时间倒流','#baa6e4',90);}else for(const b of this.bullets)b.vy=Math.abs(b.vy);fan(phase?13:7,150);break;
   case 6:{const ritual=Math.floor(e.age/3)%3;if(ritual===0||phase)fan(7,150);if(ritual===1&&this.enemies.length<14){this.spawnEnemy(ENEMIES[11]);this.spawnEnemy(ENEMIES[9]);}if(ritual===2||phase)lane(this.x,55,1.35);break;}
   case 7:for(let i=0;i<10+phase*4;i++)this.enemyBullet(e.x,e.y,i*Math.PI*2/(10+phase*4)+e.age*.4,150+phase*20,18,'#ef98b5');if(phase>=1&&this.enemies.length<8)this.spawnEnemy(ENEMIES[24],this.rng.range(100,W-100),190,true);if(phase===2){lane(e.age%6<3?150:570,125,1.8);lane(this.x,35,1.4);}break;
  }
  if(this.floor>8&&phase===2)lane(e.age%4<2?80:W-80,45,1.7);
  e.action=Math.max(.85,2.7-phase*.55-(this.strongBoss?.3:0)-Math.min(.5,(this.floor-1)/32));
 }
 enemyBullet(x:number,y:number,angle:number,speed:number,damage:number,color='#dc8e99'){
  if(this.bullets.length>=450)return;const b=this.bulletPool.pop()||{} as Bullet;Object.assign(b,{active:true,x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage,life:8,color});this.bullets.push(b);
 }
 shootAtPlayer(e:Enemy,speed:number){this.enemyBullet(e.x,e.y,Math.atan2(PLAYER_Y-e.y,this.x-e.x),speed,e.def.damage);}
 private updateBullets(dt:number){
  for(const b of this.bullets){if(!b.active)continue;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.hypot(b.x-this.x,b.y-PLAYER_Y)<10+COMBAT_FEEL.enemyBulletRadius){this.hurt(b.damage);b.active=false;}if(b.life<=0||b.y>H+20||b.y<-50||b.x<-30||b.x>W+30)b.active=false;}
  const alive:Bullet[]=[];for(const b of this.bullets){if(b.active)alive.push(b);else this.bulletPool.push(b);}this.bullets=alive;
 }
 private updateHazards(dt:number){for(const h of this.hazards){h.timer-=dt;h.life-=dt;if(h.timer<=0&&!h.fired){h.fired=true;this.effect(h.x,h.y,'nova','',h.color,h.r);if(Math.abs(this.x-h.x)<h.r)this.hurt(h.damage);}}this.hazards=this.hazards.filter(h=>h.life>0);}
 hurt(amount:number,source?:Enemy){
  if(this.invincible>0||this.phase!=='combat')return;if(this.rng.next()<this.stats.dodge){this.effect(this.x,PLAYER_Y-30,'text','闪避','#b7e993');return;}
  const damage=Math.max(1,amount*floorValue(DIFFICULTY.enemyDamage,this.floor)*(1+this.curse*.045)-this.stats.armor);const absorb=Math.min(this.shield,damage);this.shield-=absorb;this.hp-=damage-absorb;this.invincible=.65;this.combo=0;
  this.effect(this.x,PLAYER_Y-35,'crit',`−${Math.ceil(damage)}`,'#ed91a2');this.onSound?.('hurt');this.trigger('hurt',source,undefined,damage);
  if(this.stats.thorns>0&&source)this.damageEnemy(source,damage*this.stats.thorns*2);
  if(this.hp<=0){this.hp=0;this.phase='dead';this.open(null);this.onSound?.('death');}
 }
 drop(kind:Drop['kind'],x:number,y:number,value:number,gear?:Gear){
  if(this.drops.length>=220&&kind!=='gear'){const existing=this.drops.find(d=>d.kind===kind);if(existing){existing.value+=value;return;}}
  this.drops.push({uid:this.uid++,kind,x,y,value,gear,age:0});
 }
 private updateDrops(dt:number){for(const d of this.drops){d.age+=dt;d.y+=100*dt;const dist=Math.hypot(d.x-this.x,d.y-PLAYER_Y);if(dist<this.stats.magnet||d.y>H-30){const a=Math.atan2(PLAYER_Y-d.y,this.x-d.x);d.x+=Math.cos(a)*420*dt;d.y+=Math.sin(a)*420*dt;}if(Math.hypot(d.x-this.x,d.y-PLAYER_Y)<22||d.age>8){this.collect(d);d.age=-100;}}this.drops=this.drops.filter(d=>d.age>=0);}
 collect(d:Drop){if(d.kind==='xp')this.gainXp(d.value);else if(d.kind==='gold')this.addGold(d.value);else if(d.gear)this.loot.push(d.gear);}
 finishRoom(){this.phase='between';for(const d of this.drops)this.collect(d);this.drops=[];this.releaseAll();this.hazards=[];this.turrets=[];this.addGold(this.room==='elite'?35:15);this.shield=Math.min(this.stats.shieldMax,this.shield+6);this.note('房间已肃清');this.onSound?.('clear');this.checkPanels();}
 nearest(x:number,y:number,excluded?:Set<number>){let best:Enemy|undefined;let distance=Infinity;for(const e of this.enemies){if(e.dead||excluded?.has(e.uid))continue;const d=(e.x-x)**2+(e.y-y)**2;if(d<distance){distance=d;best=e;}}return best;}
 effect(x:number,y:number,kind:Vfx['kind'],text:string,color:string,radius=25,tx?:number,ty?:number){if(this.vfx.length>=180)return;this.vfx.push({x,y,kind,text,color,life:kind==='skill'?1.8:kind==='chain'?.2:.7,max:kind==='skill'?1.8:.7,radius,tx,ty});}
 nova(x:number,y:number,radius:number,damage:number,exclude=-1,status?:Weapon['status']){this.effect(x,y,'nova','',status==='poison'?'#9ddb82':status==='ice'?'#9fdcff':'#edbd8b',radius);for(const e of this.enemies){if(e.dead||e.uid===exclude||Math.hypot(e.x-x,e.y-y)>radius)continue;if(status)this.applyStatus(e,status,2);if(damage>0)this.damageEnemy(e,damage);}}
 chain(x:number,y:number,damage:number,radius:number,exclude=-1){const targets=this.enemies.filter(e=>!e.dead&&e.uid!==exclude&&Math.hypot(e.x-x,e.y-y)<radius).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y)).slice(0,2);for(const e of targets){this.effect(x,y,'chain','','#ece5a3',0,e.x,e.y);this.damageEnemy(e,damage);}}
 trigger(on:Hook,enemy?:Enemy,shot?:Shot,damage=20*this.power()){
  // Secondary damage never triggers hit/crit again, keeping proc chains bounded.
  for(const item of this.effects){const e=item.effect;if(e.on!==on||this.effectCooldown.has(item.key))continue;
   switch(e.condition){case'low':if(this.hp/this.stats.maxHp>=.35)continue;break;case'rich':if(this.gold<150)continue;break;case'cursed':if(this.curse<=0)continue;break;case'poisoned':if(!enemy?.poison)continue;break;case'frozen':if(!enemy?.frozen)continue;break;case'burning':if(!enemy?.burn)continue;break;case'heavy':if(!shot?.weapon.heavy)continue;break;case'return':if(!shot?.returning)continue;break;case'turret':if(!shot?.turret)continue;break;case'snared':if(!enemy?.snare)continue;break;case'marked':if(!enemy?.mark)continue;break;case'shielded':if(this.shield<=0)continue;break;}
   if(e.chance&&this.rng.next()>Math.min(.9,e.chance*item.stacks*(1+this.stats.luck*.25)))continue;
   const n=e.amount*(e.chance?1:item.stacks),x=enemy?.x??this.x,y=enemy?.y??PLAYER_Y,radius=(e.radius||0)*this.stats.area;
   this.effectCooldown.set(item.key,e.cooldown||.05);
   switch(e.op){
    case'heal':this.heal(n);break;case'shield':this.shield=Math.min(this.stats.shieldMax,this.shield+n);break;case'gold':this.addGold(n);break;case'cooldown':this.skillCD=Math.max(0,this.skillCD-n);break;
    case'nova':case'bloodnova':this.nova(x,y,radius||80,damage*n,enemy?.uid);break;
    case'chain':this.chain(x,y,damage*n,radius||150,enemy?.uid);break;
    case'poison':case'ice':case'fire':if(radius){for(const target of this.enemies)if(!target.dead&&Math.hypot(target.x-x,target.y-y)<radius)this.applyStatus(target,e.op,n,damage);}else if(enemy)this.applyStatus(enemy,e.op,n,damage);break;
    case'shot':{const target=this.nearest(this.x,PLAYER_Y);const a=target?Math.atan2(target.y-PLAYER_Y,target.x-this.x):-Math.PI/2;const s=this.launch(WEAPONS[0],1,this.x,PLAYER_Y-12,a,false,true);s.damage=20*this.power()*n;break;}
    case'pull':for(const d of this.drops)d.y=PLAYER_Y-40;break;
    case'mark':if(enemy&&!enemy.dead){enemy.mark=Math.min(.75,Math.max(enemy.mark,n));enemy.markTime=4*this.stats.duration;this.effect(x,y,'text','易伤','#e9bbcb');}break;
    case'repel':for(const target of this.enemies)if(!target.dead&&target.boss<0&&Math.hypot(target.x-x,target.y-y)<(radius||90))target.y=Math.max(35,target.y-Math.min(180,n));this.effect(x,y,'nova','击退','#aacde0',radius||90);break;
    case'orbit':{const w=WEAPONS.find(w=>w.id==='starward')!;const alive=this.shots.filter(s=>s.active&&s.weapon.pattern==='satellite').length;for(let i=0;i<Math.min(12-alive,Math.floor(n));i++)this.launch(w,1,this.x,PLAYER_Y-170,-Math.PI/2);break;}
    case'echo':{const own=this.weapons[0];if(own)for(let i=0;i<Math.min(3,Math.floor(n));i++)this.fireWeapon(WEAPONS.find(w=>w.id===own.id)!,own.level);break;}
    case'cull':if(enemy&&!enemy.dead){const stacks=enemy.poison+enemy.burn+enemy.bleed;if(stacks>0){enemy.poison=enemy.burn=enemy.bleed=0;this.damageEnemy(enemy,Math.min(enemy.maxHp*(enemy.boss>=0?.025:.12),stacks*12*this.stats.statusPower*this.power()*n));this.effect(x,y,'nova','消融','#b6d990',70);}}break;
    case'bank':if(this.gold>=n){this.gold-=n;this.shield=Math.min(this.stats.shieldMax,this.shield+n*2);this.revision++;}break;
    case'cleanse':for(const b of this.bullets)if(Math.hypot(b.x-x,b.y-y)<(radius||1000))b.active=false;for(const target of this.enemies)if(target.boss<0&&Math.hypot(target.x-x,target.y-y)<(radius||1000)){target.barrier=0;target.snare=Math.max(target.snare,1);}this.effect(x,y,'nova','净空','#b9dbeb',200);break;
   }
  }
 }
 skill(){
  if(this.panel||this.phase!=='combat'||this.skillCD>0)return false;if(this.hero.skill==='jackpot'&&this.gold<15){this.note('掷金需要 15 金币');return false;}
  this.skillCD=this.hero.cooldown;this.bountyStep('caster');const damage=50*this.power();this.trigger('skill');this.effect(this.x,PLAYER_Y-60,'skill',this.hero.skillDesc.split('：')[0],this.hero.color,100);this.onSound?.('skill');
  switch(this.hero.skill){
   case'storm':for(let j=0;j<5;j++)for(let i=0;i<7;i++){const s=this.launch(WEAPONS[0],2,this.x,PLAYER_Y-j*24,-Math.PI/2+(i-3)*.14);s.pierce=1;}break;
   case'plague':for(const e of this.enemies)this.applyStatus(e,'poison',4);this.shield=Math.min(this.stats.shieldMax,this.shield+15);break;
   case'blizzard':for(const e of this.enemies){e.frozen=e.boss>=0?1:3;this.trigger('freeze',e);}break;
   case'quake':this.nova(W/2,H/2,800,damage*2);this.bullets.forEach(b=>b.active=false);break;
   case'jackpot':this.gold-=15;for(let i=0;i<12;i++){const s=this.launch(WEAPONS[10],2,this.x,PLAYER_Y-i*8,-Math.PI/2+(i-6)*.07);s.damage*=1.5;}break;
   case'blood':this.hp=Math.max(1,this.hp*.85);this.invincible=2;this.nova(W/2,H/2,800,damage*1.8);break;
   case'hex':this.baseCurse++;this.recalculate();this.nova(W/2,H/2,800,damage*2);break;
   case'carpet':for(let i=0;i<6;i++){const weapon=WEAPONS[9];const s=this.launch(weapon,3,60+i*120,240+this.rng.range(-70,70),-Math.PI/2);s.pierce=3;}break;
   case'turret':for(let i=0;i<3;i++)if(this.turrets.length<6)this.turrets.push({x:Math.max(30,Math.min(W-30,this.x+(i-1)*100)),y:PLAYER_Y-45,life:12,timer:0,weapon:WEAPONS[14],level:3});break;
   case'orbit':for(let i=0;i<12;i++)this.launch(WEAPONS[4],3,this.x,PLAYER_Y-i*6,-Math.PI/2+(i-6)*.12);break;
   case'thunder':{const target=[...this.enemies].sort((a,b)=>b.hp-a.hp)[0];if(target){this.damageEnemy(target,damage*3);this.chain(target.x,target.y,damage*2,800,target.uid);}break;}
   case'fortune':this.addGold(25);this.shield=Math.min(this.stats.shieldMax,this.shield+20);this.fortune++;break;
  }return true;
 }
 pause(){if(this.phase!=='combat')return;if(this.panel==='pause')this.open(null);else if(!this.panel)this.open('pause');}
}
function fxLegend(tag:Weapon['tag'],quality:number):Effect {
 const on:Hook=tag==='return'?'return':tag==='ice'?'freeze':tag==='shield'?'hurt':tag==='turret'?'hit':'crit';
 return{on,op:tag==='gold'?'gold':tag==='poison'?'poison':tag==='fire'?'fire':tag==='shield'?'shield':tag==='blood'?'heal':tag==='lightning'?'chain':'nova',amount:tag==='gold'?5:tag==='shield'?8:tag==='blood'?3:quality===4?1.2:.8,radius:85,cooldown:.7};
}
export function segmentDistance(px:number,py:number,ax:number,ay:number,bx:number,by:number){const dx=bx-ax,dy=by-ay;const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
