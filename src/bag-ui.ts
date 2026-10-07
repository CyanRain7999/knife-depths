import type {Run} from './engine';
import type {InventoryOrder,Slot} from './types';
import {QUALITY,QUALITY_COLORS,SLOT_NAMES} from './data';
import {pixelIcon} from './art';
import {gearIcon} from './item-icons';
import {setById} from './sets';
import {GEAR_SLOTS,sortInventory,inventorySetHint} from './inventory';

export function bagView(run:Run,order:InventoryOrder,slot:Slot|'all',limit:number){
 const items=sortInventory(run.inventory,run.equipment,order,slot);
 return `<div class="bag-summary"><strong>库存 ${run.inventory.length} 件</strong><span>不限容量 · 换装保留旧装备</span></div>
 <div class="bag-equipped">${GEAR_SLOTS.map(s=>{const g=run.equipment[s];return `<button class="bag-worn" data-bag-slot="${s}" ${g?'':'disabled'}><span>${SLOT_NAMES[s]}</span>${g?gearIcon(g,44):pixelIcon('#a4b3a7','gear',28)}<strong>${g?g.def.name:'未穿戴'}</strong><small>${g?QUALITY[g.quality]+(g.def.cursed?' · 诅咒':''):'点击库存换装'}</small></button>`;}).join('')}</div>
 <div class="bag-order" role="group" aria-label="背包排序"><button data-bag-order="quality" class="${order==='quality'?'selected':''}" aria-pressed="${order==='quality'}">品质优先</button><button data-bag-order="set" class="${order==='set'?'selected':''}" aria-pressed="${order==='set'}">套装优先</button></div>
 <p class="bag-sort-note">${order==='quality'?'高品质排在前面，同品质优先显示最近获得。':'已穿戴系列排在前面，同系列聚在一起，方便补齐套装。'}</p>
 <div class="bag-filters" role="group" aria-label="装备部位">${(['all',...GEAR_SLOTS] as const).map(s=>`<button data-bag-filter="${s}" class="${slot===s?'selected':''}" aria-pressed="${slot===s}">${s==='all'?'全部':SLOT_NAMES[s]} <small>${s==='all'?run.inventory.length:run.inventory.filter(g=>g.def.slot===s).length}</small></button>`).join('')}</div>
 <div class="bag-items">${items.slice(0,limit).map(g=>{const set=setById(g.def.set);return `<button class="bag-item rarity-${g.quality}" data-bag-gear="${g.uid}" aria-label="查看${g.def.name}"><div class="bag-item-top">${gearIcon(g,56)}<span class="bag-quality">${QUALITY[g.quality]} · ${SLOT_NAMES[g.def.slot]}</span>${run.favoriteGear.has(g.uid)?'<b class="bag-lock">★</b>':''}</div><strong>${g.def.name}</strong><small>${set?.name||'散件装备'}${g.def.cursed?' · 诅咒':''}</small><span class="bag-piece-hint">${inventorySetHint(g,run.equipment)}</span><span class="bag-item-footer">${g.affixes.length} 词条 · 点击比较</span></button>`;}).join('')||'<div class="bag-empty">这里还没有装备。<br>掉落、商店和事件奖励会自动收进背包。</div>'}</div>
 ${items.length>limit?`<button id="bag-more" class="bag-more">继续显示 · 已展示 ${Math.min(items.length,limit)}/${items.length}</button>`:''}
 <div class="overlay-actions"><button id="bag-build" class="primary">被动构筑</button><button id="bag-sets">套装指南</button></div>`;
}
