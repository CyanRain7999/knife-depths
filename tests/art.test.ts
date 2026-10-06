import { it, expect } from 'vitest';
import { HEROES } from '../src/data';
import { heroArt, HERO_ART_W, HERO_ART_H } from '../src/portraits';
it('all twelve portraits are distinct, animated and stay inside their sprite bounds',()=>{
 const drawings=new Set<string>();
 for(const hero of HEROES){const still=heroArt(hero.id);drawings.add(JSON.stringify(still));expect(new Set(still.map(r=>r.color)).size).toBeGreaterThanOrEqual(12);expect(heroArt(hero.id,1)).not.toEqual(still);
  for(const frame of[0,1])for(const r of heroArt(hero.id,frame)){expect(r.x).toBeGreaterThanOrEqual(0);expect(r.y).toBeGreaterThanOrEqual(0);expect(r.x+r.w).toBeLessThanOrEqual(HERO_ART_W);expect(r.y+r.h).toBeLessThanOrEqual(HERO_ART_H);}
 }expect(drawings.size).toBe(12);
});
