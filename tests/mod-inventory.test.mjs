import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root={DropForgeCatalog:{ALL_MODS:{}}};
vm.runInNewContext(readFileSync('src/weapon-traits.js','utf8'),{window:root});
vm.runInNewContext(readFileSync('src/weapon-stats.js','utf8'),{window:root});
vm.runInNewContext(readFileSync('src/attachment-effects.js','utf8'),{window:root});
const traits=root.DropForgeWeaponTraits,projectiles=['kinetic'],gun=()=>({weapon:0,mods:['barrel',null,null,null]});

test('legacy installed parts and run traits coexist without using the old bag or sockets',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'overheat',projectiles),true);
 assert.equal(traits.grant(w,'loader',projectiles),true);
 assert.deepEqual(w.mods,['barrel',null,null,null],'legacy attachments retain their own sockets');
 assert.equal(w.traits.main,'overheat');
 assert.deepEqual([...w.traits.supports],['loader']);
 const effective=traits.effectiveMods(w);
 assert.ok(effective.includes('barrel')&&effective.includes('overheat')&&effective.includes('loader'));
 const stats=root.DropForgeWeaponStats.createWeaponStats({
  WEAPON_DAMAGE:[20],WEAPON_FIRE_RATES:[.3],WEAPON_PROJECTILES:projectiles,MAG_SIZE:[12],
  getModLevel:(id,slot)=>slot.traits?.levels?.[id]??1
 });
 assert.ok(stats(w).damage>stats({weapon:0,mods:[]}).damage);
 assert.ok(stats(w).fireRate>stats({weapon:0,mods:['barrel']}).fireRate);
 assert.equal(root.DropForgeAttachmentEffects.shotProfile(w,0,stats(w)).family,'explosive');
});

test('TAB no longer exposes legacy attachment swap or duplicate claims',()=>{
 const source=readFileSync('src/game.js','utf8');
 const start=source.indexOf('function renderLoadout(){'),end=source.indexOf('function toggleLoadout(force){',start);
 const tab=source.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(tab,/DropForgeWeaponTraits\.loadoutHTML\(w\)/);
 assert.doesNotMatch(tab,/data-mod-swap|data-mod-duplicate|data-chest-choice|select\.dataset\.modSlot/);
 assert.doesNotMatch(source,/function switchModFromBag\(|function applyModSwap\(/);
});

test('obsolete attachment pickups are redeemed once as gold instead of occupying a mod bag',()=>{
 const source=readFileSync('src/game.js','utf8');
 const a=source.indexOf("if(item.kind==='mod'){"),b=source.indexOf("else if(item.kind==='artifact'",a);
 const pickup=source.slice(a,b);
 assert.ok(a>=0&&b>a);
 assert.match(pickup,/p\.gold\+=15/);
 assert.match(pickup,/item\.taken=true/);
 assert.doesNotMatch(pickup,/game\.stashedMods\.push|game\.pendingMod/);
});
