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

test('chest selection presents a main and support when both are available',()=>{
 const cards=traits.choices({slots:[gun()],projectiles,seed:11,hash:(_a,_b,c)=>c});
 assert.equal(cards.length,3);
 assert.equal(cards[0].kind,'main');
 assert.equal(cards[1].kind,'support');
 assert.equal(new Set(cards.map(card=>card.id)).size,3);
});
test('normal chest offers do not fall back to legacy attachment cards',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/choices\.splice\(0,choices\.length,\.\.\.choices\.filter\(item=>item\.type==='gear'\)\)/);
});

test('trait upgrades affect only their own weapon even when both guns share a trait',()=>{
 const context={window:{}};
 vm.runInNewContext(readFileSync('src/weapon-stats.js','utf8'),context);
 const stats=context.window.DropForgeWeaponStats.createWeaponStats({
  WEAPON_DAMAGE:[20],WEAPON_FIRE_RATES:[.25],WEAPON_PROJECTILES:['kinetic'],MAG_SIZE:[12],
  getModLevel:(id,slot)=>slot.traits?.levels?.[id]??3
 });
 const first=gun(),second=gun();
 assert.equal(traits.grant(first,'loader',projectiles),true);
 assert.equal(traits.grant(second,'loader',projectiles),true);
 assert.equal(traits.grant(first,'loader',projectiles),true);
 assert.equal(traits.grant(first,'loader',projectiles),true);
 assert.equal(first.traits.levels.loader,3);
 assert.equal(second.traits.levels.loader,1);
 assert.ok(stats(first).fireRate>stats(second).fireRate);
 assert.ok(stats(first).reload<stats(second).reload);
 assert.equal(stats(second).reload,stats({...second,traits:{main:null,supports:[],levels:{loader:1}}}).reload);
});
test('chest trait claims do not increase the legacy global mod level',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/getModLevel:\(id,slot\)=>slot\?\.traits\?\.levels\?\.\[id\]\?\?game\?\.modLevels\?\.\[id\]\?\?1/);
 assert.doesNotMatch(game,/game\.modLevels\[item\.id\]=Math\.max\(/);
});

test('TAB displays every weapon trait, level and remaining open support slot',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'shockCore',projectiles),true);
 assert.equal(traits.grant(w,'shockCore',projectiles),true);
 assert.equal(traits.grant(w,'stabilizer',projectiles),true);
 const html=traits.loadoutHTML(w);
 assert.match(html,/ANA DÖNÜŞÜM/);
 assert.match(html,/ELEKTRİK ZİNCİRİ · SEV 2\/3/);
 assert.match(html,/DENGELİ ATIŞ · SEV 1\/3/);
 assert.match(html,/DESTEK 2[^]*BOŞ · SANDIKTAN ÖZELLİK SEÇ/);
 assert.doesNotMatch(traits.loadoutHTML(gun()),/ELEKTRİK ZİNCİRİ · SEV/);
});
test('TAB shows run traits separately and prevents legacy editor overwriting their combat slot',()=>{
 const game=readFileSync('src/game.js','utf8');
 const css=readFileSync('styles/workbench.css','utf8');
 assert.match(game,/DropForgeWeaponTraits\.loadoutHTML\(w\)/);
 assert.match(game,/if\(w\.traits\?\.levels&&Object\.keys\(w\.traits\.levels\)\.some\(id=>modCatalog\[id\]\?\.slot===j\)\)continue/);
 assert.match(css,/\.weaponTraitRow/);
});
