import { it, expect } from 'vitest';
import { Run } from '../src/engine';
import { WEAPONS } from '../src/data';
import { freshSave } from '../src/save';
it('a moving, upgrading starter can clear the first room without meta bonuses',()=>{
 const outcomes=[];
 for(const id of ['knife','toxic','frost'])for(let seed=1;seed<=5;seed++){
  const r=new Run(id,freshSave(),seed);
  for(let frame=0;frame<100*60;frame++){
   if(r.phase==='dead'||r.phase==='between')break;
   if(r.panel==='level'){for(const gear of [...r.inventory])if(!r.equipment[gear.def.slot])r.equipFromInventory(gear.uid);const newWeapon=r.choices.findIndex(c=>c.kind==='weapon'&&!r.weapons.some(w=>w.id===c.id));r.chooseUpgrade(newWeapon>=0?newWeapon:0,0);continue;}
   const target=r.enemies.filter(e=>!e.dead).sort((a,b)=>b.y-a.y)[0];
   if(r.roomTime>4)r.skill();
   r.tick(1/60,0,target?.x);
  }
  outcomes.push({id,seed,phase:r.phase,kills:r.kills,hp:Math.ceil(r.hp),level:r.level,weapons:r.weapons.map(w=>WEAPONS.find(x=>x.id===w.id)!.name)});
 }
 console.log('Starter pacing:',JSON.stringify(outcomes));
 expect(outcomes.filter(o=>o.phase==='between').length).toBeGreaterThanOrEqual(10);
});
