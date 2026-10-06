import { describe, expect, it } from 'vitest';
import { Run, PLAYER_Y } from '../src/engine';
import { BOSSES, ENEMIES, WEAPONS } from '../src/data';
import { DIFFICULTY, floorValue } from '../src/balance';
import { freshSave, validateSave } from '../src/save';
import type { GameSpeed } from '../src/types';

const make=()=>new Run('knife',freshSave(),741);
describe('game speed',()=>{
 it('advances every integer speed at the correct rate, including cooldown and movement',()=>{
  for(const speed of [1,2,3,4,5] as GameSpeed[]){
   const r=make();r.meta.settings.gameSpeed=speed;r.spawnTimer=100;r.skillCD=10;
   const x=r.x;r.advance(1/60,1);
   expect(r.time).toBeCloseTo(speed/60);expect(r.roomTime).toBeCloseTo(speed/60);
   expect(r.skillCD).toBeCloseTo(10-speed/60);expect(r.x-x).toBeCloseTo(300*r.stats.move*speed/60);
  }
 });
 it('matches five normal simulation steps rather than discarding accelerated time',()=>{
  const fast=make(),normal=make();fast.meta.settings.gameSpeed=5;
  for(let frame=0;frame<30;frame++){
   fast.advance(1/60,0);for(let step=0;step<5;step++)normal.tick(1/60,0);
  }
  expect(fast.time).toBeCloseTo(normal.time);expect(fast.kills).toBe(normal.kills);
  expect(fast.enemies.map(e=>[e.uid,e.hp,e.y])).toEqual(normal.enemies.map(e=>[e.uid,e.hp,e.y]));
  expect(fast.shots.length).toBe(normal.shots.length);
 });
 it('freezes at every blocking panel and stops the remaining substeps on an upgrade',()=>{
  const r=make();r.meta.settings.gameSpeed=5;
  for(const panel of ['pause','level','loot','shop','event','map','bossintro'] as const){
   r.open(panel);const before=[r.time,r.x,r.skillCD,r.roomTime];r.advance(.05,1);
   expect([r.time,r.x,r.skillCD,r.roomTime]).toEqual(before);
  }
  r.open(null);r.gainXp(100);r.advance(.05,1);
  expect(r.panel).toBe('level');expect(r.time).toBeCloseTo(1/60);
 });
 it('does not skip enemies with a fast projectile at 5× and tolerates invalid frame deltas',()=>{
  const r=make();r.meta.settings.gameSpeed=5;r.weapons=[];r.spawnTimer=100;
  const enemy=r.spawnEnemy(ENEMIES[0],r.x,PLAYER_Y-65);r.launch(WEAPONS[0],1,r.x,PLAYER_Y,-Math.PI/2);
  r.advance(.05,0);expect(enemy.hp).toBeLessThan(enemy.maxHp);
  const time=r.time;for(const delta of [0,-1,NaN,Infinity])r.advance(delta,1);
  expect(r.time).toBe(time);expect(Number.isFinite(r.x)).toBe(true);
 });
 it('preserves speed in validated saves and keeps legacy or malformed saves at 1×',()=>{
  for(const speed of [1,2,3,4,5])expect(validateSave({version:1,settings:{gameSpeed:speed}}).settings.gameSpeed).toBe(speed);
  for(const speed of [undefined,0,6,2.5,'5',true,Infinity])expect(validateSave({version:1,settings:{gameSpeed:speed}}).settings.gameSpeed).toBe(1);
  expect(validateSave({version:1,settings:{sound:false}}).settings.sound).toBe(false);
 });
 it('keeps a crowded 5× fight finite and within the entity caps',()=>{
  const r=make();r.floor=8;r.meta.settings.gameSpeed=5;r.hp=1e6;r.stats.maxHp=1e6;
  for(let i=0;i<120;i++){const e=r.spawnEnemy(ENEMIES[i%ENEMIES.length],40+i%10*64,100+Math.floor(i/10)*25);e.hp=e.maxHp=1e9;}
  for(let i=0;i<650;i++)r.launch(WEAPONS[0],5,30+i%60*11,PLAYER_Y,-Math.PI/2);
  for(let frame=0;frame<20;frame++)r.advance(.05,0);
  expect(r.time).toBeCloseTo(5);expect(r.enemies.length).toBeLessThanOrEqual(130);
  expect(r.shots.length).toBeLessThanOrEqual(650);expect(r.bullets.length).toBeLessThanOrEqual(450);
  expect(r.shots.every(s=>Number.isFinite(s.x)&&Number.isFinite(s.y))).toBe(true);
 });
});
describe('dungeon growth',()=>{
 it('preserves the first room and grows normal enemies through rooms and floors',()=>{
  const r=make();r.rng.next=()=>.99;const def=ENEMIES[0];
  expect(r.spawnEnemy(def).maxHp).toBe(def.hp);
  r.row=3;expect(r.spawnEnemy(def).maxHp).toBeCloseTo(def.hp*1.18);
  r.row=0;let hp=0;
  for(let floor=1;floor<=8;floor++){r.floor=floor;const enemy=r.spawnEnemy(def);expect(enemy.maxHp).toBeGreaterThan(hp);hp=enemy.maxHp;}
  expect(hp).toBeCloseTo(def.hp*28);
 });
 it('gives elites, bosses and reinforced contracts separate health growth',()=>{
  const r=make();r.rng.next=()=>.99;r.floor=8;
  const normal=r.spawnEnemy(ENEMIES[4]),elite=r.spawnEnemy(ENEMIES[4],100,100,true);
  expect(elite.maxHp/normal.maxHp).toBe(5);
  const boss=r.spawnEnemy(ENEMIES[4],360,100,true,7);
  expect(boss.maxHp).toBeCloseTo(BOSSES[7].hp*6.2);
  r.strongBoss=true;const reinforced=r.spawnEnemy(ENEMIES[4],360,100,true,7);
  expect(reinforced.maxHp/boss.maxHp).toBeCloseTo(1.4);
 });
 it('lets a developed knife kill an opening mob but survive on a deep-floor mob',()=>{
  for(const floor of [1,8]){
   const r=make();r.rng.next=()=>.99;r.floor=floor;r.stats.damage=5;
   const enemy=r.spawnEnemy(ENEMIES[0]);const weapon=WEAPONS.find(w=>w.id==='knife')!;
   r.launch(weapon,5,r.x,PLAYER_Y,-Math.PI/2);r.damageEnemy(enemy,r.shots[0].damage);
   expect(enemy.dead).toBe(floor===1);
  }
 });
 it('scales incoming damage for melee, bullets and hazards via the same floor curve',()=>{
  const r=make();r.shield=0;r.stats.armor=0;r.hp=100;r.hurt(10);expect(r.hp).toBe(90);
  r.floor=8;r.hp=100;r.invincible=0;r.hurt(10);expect(r.hp).toBe(77.5);
  expect(floorValue(DIFFICULTY.enemyHealth,99)).toBeGreaterThan(28);
 });
});
