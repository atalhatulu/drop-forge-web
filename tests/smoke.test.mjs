import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(path,'utf8');
function load(path,window={}){vm.runInNewContext(read(path),{window});return window;}

test('browser entrypoint loads split runtime modules and current HUD styles',()=>{
 const html=read('index.html');
 for(const path of ['src/catalog.js','src/weapon-traits.js','src/chest-rewards.js','src/game.js','styles/hud-reference.css','styles/prep-reference.css'])assert.ok(html.includes(path),path+' is loaded');
 assert.match(html,/id="game"/);
});

test('runtime parses and exposes reward, finisher, and weapon ability flows',()=>{
 const game=read('src/game.js');
 assert.doesNotThrow(()=>new Function(game));
 for(const pattern of [/function awardRoomReward\(room\)/,/function openWeaponRewardChoice\(seed\)/,/function tryFinisher\(/,/useWeaponAbility\(\)/])assert.match(game,pattern);
});

test('all weapon groups generate unique compatible trait choices for shared sockets',()=>{
 const catalog=load('src/catalog.js').DropForgeCatalog,traits=load('src/weapon-traits.js').DropForgeWeaponTraits;
 assert.equal(catalog.WEAPON_TYPES.length,13);
 for(let id=0;id<13;id++){
  const weapon={weapon:id,mods:[],traits:null};
  const offers=traits.choices({slots:[weapon],projectiles:catalog.WEAPON_PROJECTILES,seed:id+40,hash:(_a,_b,c)=>c});
  assert.ok(offers.length<=3);
  assert.equal(new Set(offers.map(item=>item.id)).size,offers.length);
  assert.ok(offers.every(item=>traits.eligible(weapon,item.id,catalog.WEAPON_PROJECTILES)));
 }
});

test('empty sockets offer new traits and a full build offers upgrades only',()=>{
 const catalog=load('src/catalog.js').DropForgeCatalog,traits=load('src/weapon-traits.js').DropForgeWeaponTraits,weapon={weapon:0,mods:[],traits:null};
 for(const id of ['burnCore','loader','stabilizer'])assert.equal(traits.grant(weapon,id,catalog.WEAPON_PROJECTILES),true);
 assert.equal(traits.state(weapon).slots.length,3);
 const offers=traits.choices({slots:[weapon],projectiles:catalog.WEAPON_PROJECTILES,seed:12,hash:(_a,_b,c)=>c});
 assert.ok(offers.length>0&&offers.every(item=>item.upgrade&&item.level<=3));
});

test('trait upgrades change the owning weapon stats without affecting its partner',()=>{
 const stats=load('src/weapon-stats.js').DropForgeWeaponStats.createWeaponStats({WEAPON_DAMAGE:[22,12],WEAPON_FIRE_RATES:[.25,.1],WEAPON_PROJECTILES:['kinetic','scatter'],MAG_SIZE:[15,6],getModLevel:(id,slot)=>slot?.traits?.levels?.[id]||1});
 const first={weapon:0,mods:[],traits:{slots:['loader',null,null],levels:{loader:3}}},second={weapon:1,mods:[],traits:null};
 assert.ok(stats(first).fireRate>stats({weapon:0,mods:[]}).fireRate);
 assert.equal(stats(second).masteryLevel,1);
});

test('boss trait reward asks for a weapon target before opening its trait pool',()=>{
 const game=read('src/game.js');
 for(const pattern of [/function weaponRewardTargets\(\)/,/function openWeaponRewardChoice\(seed\)/,/openWeaponRewardChoice\(seed\)/,/data-boss-reward="trait"/])assert.match(game,pattern);
});

test('weapon drop snapshots are independent and preserve all three run sockets',()=>{
 const traits=load('src/weapon-traits.js').DropForgeWeaponTraits,source={weapon:0,mods:[],traits:null};
 for(const id of ['burnCore','loader','stabilizer'])assert.equal(traits.grant(source,id,['kinetic']),true);
 const dropped={weapon:source.weapon,mods:[...source.mods],traits:traits.snapshot(source)};
 source.traits.levels.burnCore=3;
 assert.equal(dropped.traits.levels.burnCore,1);
 assert.deepEqual(Array.from(dropped.traits.slots),['burnCore','loader','stabilizer']);
 assert.match(read('src/game.js'),/traits:window\.DropForgeWeaponTraits\.snapshot\(item\)/);
});

test('armor equipment uses five physical chip slots and multiple gear sets',()=>{
 const gear=load('src/gear.js').DropForgeGear;
 assert.equal(gear.SLOTS.length,5);
 assert.ok(Object.keys(gear.SETS).length>=4);
});

test('chest reward selection has no dependency on the retired mod bag',()=>{
 const rewards=read('src/chest-rewards.js');
 assert.doesNotMatch(rewards,/stashedMods|modSlotUnlocked|selectBossAttachment/);
 assert.match(rewards,/root\.DropForgeChestRewards/);
});
