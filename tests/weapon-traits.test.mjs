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
test('a main transformation is applied without occupying a legacy socket and a second replaces it',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'shockCore',projectiles),true);
 assert.equal(w.mods[2],null);
 assert.equal(w.traits.main,'shockCore');
 assert.ok(traits.effectiveMods(w).includes('shockCore'));
 assert.equal(traits.grant(w,'burnCore',projectiles),true);
 assert.equal(w.mods[2],null);
 assert.equal(w.traits.main,'burnCore');
 assert.ok(!traits.effectiveMods(w).includes('shockCore'));
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
test('main transformation and support work together even when their legacy sockets match',()=>{
 const w=gun();
 assert.equal(traits.grant(w,'overheat',projectiles),true);
 assert.equal(traits.grant(w,'loader',projectiles),true);
 assert.equal(w.mods[1],null);
 assert.ok(traits.effectiveMods(w).includes('overheat'));
 assert.ok(traits.effectiveMods(w).includes('loader'));
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
 assert.equal(stats(second).reload,.85*.78);
});
test('chest trait claims do not increase the legacy global mod level',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/getModLevel:\(id,slot\)=>slot\?\.traits\?\.levels\?\.\[id\]\?\?1/);
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
test('TAB prioritizes run traits and shows old equipped attachments as read-only legacy items',()=>{
 const game=readFileSync('src/game.js','utf8');
 const css=readFileSync('styles/workbench.css','utf8');
 const start=game.indexOf('function renderLoadout(){'),end=game.indexOf('function toggleLoadout(force){',start);
 const tab=game.slice(start,end);
 assert.match(tab,/DropForgeWeaponTraits\.loadoutHTML\(w\)/);
 assert.match(tab,/SİLAHLAR & ÖZELLİKLER/);
 assert.match(tab,/legacyWeaponMods/);
 assert.doesNotMatch(tab,/legacyModArchive|game\.stashedMods/);
 assert.doesNotMatch(tab,/select\.dataset\.modSlot/);
 assert.doesNotMatch(tab,/BOŞTA EKLENTİ YOK/);
 assert.match(css,/\.legacyWeaponMods/);
});

test('a dropped weapon keeps an independent snapshot of all its run trait levels',()=>{
 const source=gun();
 traits.grant(source,'shockCore',projectiles);
 traits.grant(source,'shockCore',projectiles);
 traits.grant(source,'stabilizer',projectiles);
 const ground={weapon:source.weapon,mods:[...source.mods],traits:traits.snapshot(source)};
 assert.equal(ground.traits.levels.shockCore,2);
 assert.equal(ground.traits.supports[0],'stabilizer');
 source.traits.levels.shockCore=3;
 source.traits.supports.push('loader');
 assert.equal(ground.traits.levels.shockCore,2);
 assert.equal(ground.traits.supports.length,1);
 assert.equal(traits.hasInvestment(ground),true);
 assert.equal(traits.hasInvestment(gun()),false);
});
test('reforge gives three distinct main transformations for the newly picked-up gun only',()=>{
 const incoming=gun(1),old=gun();
 traits.grant(old,'shockCore',projectiles);
 const offers=traits.choices({slots:[old,incoming],projectiles,kind:'main',seed:43,hash:(_a,_b,c)=>c});
 assert.equal(offers.length,3);
 assert.ok(offers.every(offer=>offer.kind==='main'));
 assert.equal(new Set(offers.map(offer=>offer.id)).size,3);
 const forIncoming=traits.choices({slots:[null,incoming],projectiles,kind:'main',seed:43,hash:(_a,_b,c)=>c});
 assert.ok(forIncoming.every(offer=>offer.weaponSlot===1));
 assert.equal(forIncoming.length,3);
});
test('live swap retains old weapon traits on the ground and equips any traits on the pickup',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/old\.mods\|\|\[\],old\.traits,old\.rune\)/);
 assert.match(game,/sameBuild\(duplicate,item\)/);
 assert.match(game,/rune:item\.rune\|\|null/);
 assert.match(game,/traits:window\.DropForgeWeaponTraits\.snapshot\(item\)/);
 assert.match(game,/hasInvestment\(old\)/);
 assert.match(game,/openChestUpgradeModal\(offers\)/);
});

test('wheel offers three immediate traits after its result animation, never a legacy mod bag reward',()=>{
 const game=readFileSync('src/game.js','utf8');
 const start=game.indexOf('function resolveWheel(room){'),end=game.indexOf('const {drawGenerator',start);
 assert.ok(start>=0&&end>start);
 const wheel=game.slice(start,end);
 assert.match(wheel,/DropForgeWeaponTraits\.choices/);
 assert.match(wheel,/w\.traitOffers=offers/);
 assert.doesNotMatch(wheel,/game\.stashedMods\.push\(mod\)/);
 assert.match(game,/if\(w\.resultTime===0&&w\.traitOffers\?\.length\)/);
 assert.match(game,/openChestUpgradeModal\(offers\)/);
 assert.match(game,/labels=\['SİLAH','ÖZELLİK'/);
});
test('manual weapon drop preserves run traits just like a weapon swap',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/dropWeapon\(currentRoom\(\),p\.weapon,[^;]*p\.slots\[p\.activeSlot\]\?\.traits,p\.slots\[p\.activeSlot\]\?\.rune\)/);
});

test('same-socket main and support both change real projectile behavior and firing stats',()=>{
 const effectsContext={window:{}};
 vm.runInNewContext(readFileSync('src/attachment-effects.js','utf8'),effectsContext);
 const combat=effectsContext.window.DropForgeAttachmentEffects;
 const statsContext={window:{}};
 vm.runInNewContext(readFileSync('src/weapon-stats.js','utf8'),statsContext);
 const stats=statsContext.window.DropForgeWeaponStats.createWeaponStats({
  WEAPON_DAMAGE:[24],WEAPON_FIRE_RATES:[.4],WEAPON_PROJECTILES:['scatter'],MAG_SIZE:[6],
  getModLevel:(id,slot)=>slot.traits?.levels?.[id]??1
 });
 const weapon=gun();
 assert.equal(traits.grant(weapon,'overheat',projectiles),true);
 assert.equal(traits.grant(weapon,'loader',projectiles),true);
 assert.equal(combat.shotProfile(weapon,0,stats(weapon)).family,'explosive');
 assert.equal(stats(weapon).reload,.85*.78);
 assert.equal(weapon.mods[1],null,'run traits must never fill the old mechanism socket');
 const player={};
 const charged=gun();
 traits.grant(charged,'overchargeGrip',projectiles);
 assert.equal(combat.overchargeInterval(player,charged,.4),.2);
 assert.equal(player.overchargeTime,2);
});
