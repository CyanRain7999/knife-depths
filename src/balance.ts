// Fixed floor scaling: enemies do not secretly scale with the player's build.
export const PASSIVE_MAX_STACKS=4;
// After level 5, the quadratic term spaces out late-game upgrade interruptions.
export function experienceForLevel(level:number){return 32+12*level+3*Math.max(0,level-5)**2;}
export const COMBAT_FEEL={
 playerShotSpeed:1.8,
 playerShotScale:3,
 heavyShotScale:3.4,
 playerShotRadius:9,
 heavyShotRadius:18,
 enemyBulletRadius:7,
 enemyEntryLine:150,
 enemyEntrySpeed:320,
} as const;
export const DIFFICULTY = {
 enemyHealth: [1, 1.8, 3.15, 5.1, 8.1, 12.5, 19, 28],
 bossHealth: [1, 1.2, 1.55, 2.1, 2.8, 3.7, 4.8, 6.2],
 enemyDamage: [1, 1.1, 1.24, 1.4, 1.58, 1.78, 2, 2.25],
 eliteHealth: [3.4, 3.6, 3.8, 4, 4.25, 4.5, 4.75, 5],
 roomHealthStep: .06,
} as const;
export function floorValue(values: readonly number[], floor: number, growth=.12) {
 const index=Math.max(0,Math.floor(floor)-1);
 return values[Math.min(values.length-1,index)]*Math.pow(1+growth,Math.max(0,index-values.length+1));
}
