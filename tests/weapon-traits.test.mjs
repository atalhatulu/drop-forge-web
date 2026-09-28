import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root={DropForgeCatalog:{ALL_MODS:{
 shockCore:{slot:2},burnCore:{slot:2},cryoCore:{slot:2},hunterMark:{slot:2},
 laserSweep:{slot:0},overheat:{slot:1},loader:{slot:1},extendedMag:{slot:1},
 efficientMechanism:{slot:1},stabilizer:{slot:3},lightGrip:{slot:3},overchargeGrip:{slot:3}
}}};
vm.runInNewContext(readFileSync('src/weapon-traits.js','utf8'),{window:root});
const traits=root.DropForgeWeaponTraits,projectiles=['kinetic','scatter','explosive'];
const gun=(weapon=0)=>({weapon,mods:[null,null,null,null]});

test('trait cards are limited to three unique, currently compatible weapon offers',()=>{
 const cards=traits.choices({slots:[gun(),gun(1)],projectiles,seed:42,hash:(_a,_b,c)=>c});
 assert.ok(cards.length>0&&cards.length<=3);
 assert.equal(new Set(cards.map(card=>card.weaponSlot+':'+card.id)).size,cards.length);
 assert.ok(cards.every(card=>traits.canGrant([gun(),gun(1)][card.weaponSlot],card.id,projectiles)));
});
test('a main transformation is applied immediately and a second one replaces it',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'shockCore',projectiles),true);
 assert.equal(w.mods[2],'shockCore');
 assert.equal(w.traits.main,'shockCore');
 assert.equal(traits.grant(w,'burnCore',projectiles),true);
 assert.equal(w.mods[2],'burnCore');
 assert.equal(w.traits.main,'burnCore');
 assert.equal(w.traits.levels.shockCore,undefined);
});
test('supports are capped at two and a duplicate increases trait level without taking a new slot',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'loader',projectiles),true);
 assert.equal(traits.grant(w,'stabilizer',projectiles),true);
 assert.equal(traits.grant(w,'lightGrip',projectiles),false);
 assert.equal(traits.grant(w,'loader',projectiles),true);
 assert.equal(w.traits.levels.loader,2);
 assert.equal(w.traits.supports.length,2);
 assert.equal(traits.grant(w,'loader',projectiles),true);
 assert.equal(traits.grant(w,'loader',projectiles),false);
});
test('a main and support cannot silently overwrite the same combat slot',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'overheat',projectiles),true);
 assert.equal(traits.grant(w,'loader',projectiles),false);
 assert.equal(w.mods[1],'overheat');
 assert.equal(traits.grant(gun(2),'overheat',projectiles),false);
});
test('chest UI grants traits directly rather than routing them into the mod bag',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/DropForgeWeaponTraits\.choices/);
 assert.match(game,/DropForgeWeaponTraits\.grant\(w,item\.id,WEAPON_PROJECTILES\)/);
 assert.match(game,/SİLAHA HEMEN UYGULA/);
});
