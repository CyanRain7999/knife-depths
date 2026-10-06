import {describe,it,expect} from 'vitest';
import {Run,PLAYER_Y} from '../src/engine';
import {ENEMIES,WEAPONS,regionName,bossPhaseName} from '../src/data';
import {freshSave} from '../src/save';
import {BOUNTIES,MUTATIONS,TOWER_LIMIT} from '../src/tower';
import {characterSVG,CHARACTER_STYLES} from '../src/chibi';
const make=()=>{const r=new Run('knife',freshSave(),20261006);r.weapons=[];r.spawnTimer=100;return r;};
const weapon=(id:string)=>WEAPONS.find(w=>w.id===id)!;
const mob=(r:Run,x=360,y=300,hp=10000)=>r.spawnEnemy({...ENEMIES[0],hp,speed:0,behavior:'walk'},x,y);
function sim(r:Run,time:number){for(let i=0;i<Math.ceil(time*60);i++)r.tick(1/60,0);}
describe('tower modes and rewards',()=>{
 it('continues beyond the old eighth floor, ends at 24 and keeps endless climbing',()=>{
  const r=make();r.floor=8;r.row=4;r.phase='between';r.next();expect(r.floor).toBe(9);expect(r.phase).toBe('combat');
  r.floor=TOWER_LIMIT;r.row=4;r.phase='between';r.next();expect(r.phase).toBe('victory');expect(r.floor).toBe(24);
  const e=new Run('knife',freshSave(),1,'endless');e.floor=24;e.row=4;e.phase='between';e.next();expect(e.floor).toBe(25);expect(e.phase).toBe('combat');
 });
 it('can spawn and phase all bosses through forty floors without invalid definitions',()=>{
  for(let floor=1;floor<=40;floor++){
   const r=make();r.floor=floor;r.startCombat('boss');r.open(null);r.weapons=[];
   expect(r.enemies).toHaveLength(floor>8&&floor%8===0?2:1);
   for(const e of r.enemies){expect(Number.isFinite(e.hp)).toBe(true);e.hp=e.maxHp*.2;}
   r.tick(.02,0);for(const e of r.enemies)expect(e.phase).toBe(floor>8||e.boss===7?2:1);
   expect(regionName(floor)).not.toContain('undefined');expect(bossPhaseName(r.bossId,2)).toBeTruthy();
  }
 });
 it('requires both bosses to die rather than clearing the second on the first kill',()=>{
  const r=make();r.floor=16;r.startCombat('boss');r.open(null);const [first,second]=r.enemies;
  r.damageEnemy(first,1e12);expect(first.dead).toBe(true);expect(second.dead).toBe(false);expect(r.phase).toBe('combat');
  r.loot=[];r.pendingLevels=0;r.damageEnemy(second,1e12);r.tick(.02,0);expect(r.phase).toBe('between');expect(r.bossKills).toBe(2);
 });
 it('pays a chosen bounty once and resets contracts on a new floor',()=>{
  const r=make();expect(r.takeBounty('hunter')).toBe(true);expect(r.takeBounty('breaker')).toBe(false);expect(r.claimBounty()).toBe(false);
  for(let i=0;i<20;i++)r.killEnemy(mob(r));const gold=r.gold;expect(r.claimBounty()).toBe(true);expect(r.gold).toBe(gold+68);expect(r.claimBounty()).toBe(false);
  r.floor=2;r.buildRoute();expect(r.bounty).toBeUndefined();expect(r.takeBounty('caster')).toBe(true);
  for(let i=0;i<3;i++){r.skillCD=0;r.skill();}const rolls=r.rerolls;expect(r.claimBounty()).toBe(true);expect(r.rerolls).toBe(rolls+2);expect(BOUNTIES).toHaveLength(3);
 });
 it('forges to a bounded tier and awakens a periodic extra volley',()=>{
  const r=make();r.weapons=[{id:'knife',level:5,timer:0,burst:0}];r.gold=5000;expect(r.forgeWeapon(0)).toBe(false);r.open('forge');
  for(let i=0;i<3;i++)expect(r.forgeWeapon(0)).toBe(true);expect(r.forgeWeapon(0)).toBe(false);expect(r.forgeWeapon(0,true)).toBe(true);expect(r.forgeWeapon(0,true)).toBe(false);
  const s=r.launch(weapon('knife'),5,r.x,PLAYER_Y,-Math.PI/2);expect(s.damage).toBeCloseTo(weapon('knife').damage*2.12*r.power()*1.54);expect(s.pierce).toBe(1);
  r.releaseAll();r.open(null);for(let i=0;i<4;i++){r.weapons[0].timer=0;r.tick(.01,0);}expect(r.shots.length).toBe(5);
 });
 it('reforges the same equipment definition and returns to the forge after a choice',()=>{
  const r=make();const gear=r.createGear(3);r.equip(gear);r.gold=1000;r.open('forge');expect(r.reforgeGear(gear.def.slot)).toBe(true);
  expect(r.loot[0].def.id).toBe(gear.def.id);expect(r.loot[0].quality).toBeGreaterThanOrEqual(gear.quality);r.chooseLoot(true);expect(r.panel).toBe('forge');
 });
 it('executes storm, rift and shield mutations while preserving a calm opening',()=>{
  const r=make();expect(r.mutation.id).toBe('calm');r.mutationId=MUTATIONS.findIndex(m=>m.id==='storm');r.mutationTimer=.01;r.tick(.02,0);expect(r.bullets.length).toBe(3);
  r.mutationId=MUTATIONS.findIndex(m=>m.id==='rift');r.mutationTimer=.01;r.tick(.02,0);expect(r.hazards.length).toBe(1);
  r.mutationId=MUTATIONS.findIndex(m=>m.id==='ward');expect(mob(r).barrier).toBe(1);r.floor=9;r.buildRoute();expect(r.mutation.id).not.toBe('calm');
 });
});
describe('new weapon mechanics',()=>{
 it('nets a group and slows their descent',()=>{
  const r=make(),e=r.spawnEnemy({...ENEMIES[0],hp:10000,speed:100},360,500);r.launch(weapon('silknet'),1,360,540,-Math.PI/2);r.tick(.05,0);expect(e.snare).toBeGreaterThan(2);
  const y=e.y;r.tick(.05,0);expect(e.y-y).toBeCloseTo(1.75);
 });
 it('gravity gathers mobs and pulses, while seeds poison and snare them',()=>{
  for(const id of ['singularity','sporeseed']){const r=make(),e=mob(r,435,500);const s=r.launch(weapon(id),1,360,500,-Math.PI/2);s.anchorY=500;sim(r,.8);
   expect(e.hp).toBeLessThan(e.maxHp);if(id==='singularity')expect(e.x).toBeLessThan(435);else{expect(e.poison).toBeGreaterThan(0);expect(e.snare).toBeGreaterThan(0);}
  }
 });
 it('prism links resilient anchors and also damages enemies on the line',()=>{
  const r=make(),a=mob(r,200,350),b=mob(r,520,350),middle=mob(r,360,350,1000);r.launch(weapon('conduit'),1,360,600,-Math.PI/2);sim(r,.8);
  for(const e of [a,b,middle])expect(e.hp).toBeLessThan(e.maxHp);expect(r.vfx.some(v=>v.kind==='chain')).toBe(true);
 });
 it('satellites absorb enemy projectiles and stay bounded under repeated casting',()=>{
  const r=make(),s=r.launch(weapon('starward'),1,360,PLAYER_Y-170,-Math.PI/2);s.seed=0;r.enemyBullet(460,PLAYER_Y-145,0,0,50);r.tick(.001,0);expect(r.bullets.length).toBe(0);
  for(let i=0;i<30;i++)r.fireWeapon(weapon('starward'),1);expect(r.shots.length).toBeLessThanOrEqual(13);
 });
 it('delays mirrored child shots and avoids recursive duplication',()=>{
  const r=make();r.launch(weapon('glassknife'),1,360,PLAYER_Y,-Math.PI/2);sim(r,.5);expect(r.shots.filter(s=>s.child)).toHaveLength(2);sim(r,.5);expect(r.shots).toHaveLength(3);
 });
 it('harpoons pull targets upward and wall discs gain power on reflection',()=>{
  const r=make(),e=mob(r,360,300);const hook=r.launch(weapon('anchor'),1,360,340,-Math.PI/2);r.tick(.05,0);expect(e.y).toBe(200);expect(hook.turned).toBe(true);
  const ring=r.launch(weapon('wallring'),1,715,550,-Math.PI/4),damage=ring.damage;r.tick(.05,0);expect(ring.vx).toBeLessThan(0);expect(ring.damage).toBeGreaterThan(damage);
 });
});
describe('new passive combinations and art',()=>{
 it('adds timed vulnerability and consumes poison in an abnormal damage burst',()=>{
  const r=make(),e=mob(r);r.addPassive('hexmark');r.trigger('crit',e);expect(e.mark).toBeCloseTo(.18);const hp=e.hp;r.damageEnemy(e,10);expect(e.hp).toBeCloseTo(hp-11.8);
  r.rng.next=()=>0;r.addPassive('dissolution');r.applyStatus(e,'poison',8);r.trigger('hit',e);expect(e.poison).toBe(0);expect(e.hp).toBeLessThan(hp-11.8);
 });
 it('spends gold on a shield, clears hostile bullets and deploys companion blades',()=>{
  const r=make();r.gold=150;r.shield=0;r.addPassive('coinwall');r.hurt(1);expect(r.gold).toBe(138);expect(r.shield).toBe(20);
  r.addPassive('clearair');r.addPassive('orbitalcraft');const e=mob(r);e.barrier=1;r.enemyBullet(r.x,PLAYER_Y,0,0,9);r.trigger('skill');expect(e.barrier).toBe(0);expect(r.bullets[0].active).toBe(false);expect(r.shots.filter(s=>s.weapon.pattern==='satellite')).toHaveLength(3);
  r.invincible=0;const hp=r.hp;r.tick(.01,0);expect(r.hp).toBe(hp);expect(r.bullets).toHaveLength(0);
 });
 it('keeps repeatable tower passives growing after regular build caps',()=>{
  const r=make();for(let i=0;i<10;i++)r.addPassive('towerwill');expect(r.passives.towerwill).toBe(10);expect(r.stats.damage).toBeCloseTo(1.4);expect(r.stats.maxHp).toBe(120);
 });
 it('exports twelve distinct self-contained chibi drawings without remote assets',()=>{
  const drawings=Object.keys(CHARACTER_STYLES).map(characterSVG);expect(new Set(drawings).size).toBe(12);for(const svg of drawings){expect(svg).toContain('viewBox="0 0 96 120"');expect(svg).not.toContain('href=');expect(svg).toContain('<ellipse');}
 });
});
