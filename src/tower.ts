export const TOWER_LIMIT=24;
export const MODES={tower:{name:'登塔远征',desc:'24 层 · 三章守层者'},endless:{name:'无尽深渊',desc:'无限层 · 极限构筑'},daily:{name:'每日试炼',desc:'同日种子相同 · 24 层'}} as const;
export const MUTATIONS=[
 {id:'calm',name:'平静',desc:'本层没有额外异变。',health:1,speed:1,gold:1},
 {id:'rush',name:'狂奔之潮',desc:'敌人移速 +25%，生命 -15%，金币 +15%。',health:.85,speed:1.25,gold:1.15},
 {id:'iron',name:'铁甲之夜',desc:'敌人生命 +30%，移速 -8%，金币 +20%。',health:1.3,speed:.92,gold:1.2},
 {id:'storm',name:'雷雨走廊',desc:'每 5 秒上方落下三道雷弹，金币 +25%。',health:1,speed:1,gold:1.25},
 {id:'wealth',name:'鎏金狂热',desc:'敌人生命 +20%，金币 +50%。',health:1.2,speed:1,gold:1.5},
 {id:'ward',name:'结界回廊',desc:'普通敌人自带一次格挡，金币 +30%；穿透可以破局。',health:.9,speed:1,gold:1.3},
 {id:'rift',name:'裂隙回声',desc:'每 6 秒预警一道底线裂隙，金币 +30%。',health:1,speed:1,gold:1.3},
] as const;
export const BOUNTIES=[
 {id:'hunter',name:'清场悬赏',desc:'本层累计击杀 20 个敌人。',goal:20,reward:'gold' as const},
 {id:'breaker',name:'精英猎手',desc:'本层击杀 1 个精英，领取史诗装备。',goal:1,reward:'gear' as const},
 {id:'caster',name:'技艺考验',desc:'本层释放 3 次技能，领取 2 次重选。',goal:3,reward:'reroll' as const},
] as const;
export function dailySeed(){const d=new Date();return Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);}
