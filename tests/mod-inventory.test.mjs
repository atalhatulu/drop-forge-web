import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync('src/game.js','utf8');
const start=source.indexOf('function switchModFromBag(select){');
const end=source.indexOf('function toggleLoadout(force){',start);
assert.ok(start>=0&&end>start,'inventory functions can be isolated for transactional tests');
const mods={barrel:{slot:0,level:2},rapidBarrel:{slot:0,level:2},loader:{slot:1,level:4}};
function harness({bag=[],equipped,level=4}={}){
 const announcements=[],game={player:{slots:[{weapon:0,mods:equipped===undefined?[]:[equipped],ammo:8,reserve:18}],activeSlot:0,ammo:8,reserve:18,gold:0,x:0,y:0},stashedMods:[...bag],modLevels:{}};
 const funcs=new Function('game','ALL_MODS','MODS','modSlotUnlocked','masteryLevel','renderLoadout','announce','floating','weaponStats','AMMO_MAX','updateHud',
 source.slice(start,end)+'return {switchModFromBag,applyModSwap};')(
  game,mods,mods,()=>true,()=>level,()=>{},message=>announcements.push(message),()=>{},()=>({mag:15}),[240],()=>{});
 return {game,announcements,...funcs};
}
test('a mod from the bag can be installed into an empty weapon slot exactly once',()=>{
 const {game,applyModSwap}=harness({bag:['barrel']});
 assert.equal(applyModSwap(0,0,'barrel','',false),true);
 assert.equal(game.player.slots[0].mods[0],'barrel');
 assert.equal(game.stashedMods.length,0);
 assert.equal(applyModSwap(0,0,'barrel','',false),false,'repeated claim is rejected');
 assert.equal(game.stashedMods.length,0);
});
test('unequipping with a full mod bag is rejected without losing or duplicating items',()=>{
 const bag=Array.from({length:12},(_,i)=>'other-'+i);
 const {game,switchModFromBag,applyModSwap,announcements}=harness({bag,equipped:'barrel'});
 switchModFromBag({dataset:{weaponSlot:'0',modSlot:'0'},value:''});
 assert.match(announcements.join(' '),/ÇANTASI DOLU/);
 assert.equal(applyModSwap(0,0,'','barrel',false),false);
 assert.equal(game.stashedMods.length,12);
 assert.equal(game.player.slots[0].mods[0],'barrel');
});
test('stale or ineligible pending swaps do not remove the last unrelated bag mod',()=>{
 const {game,applyModSwap}=harness({bag:['loader'],equipped:'barrel'});
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),false);
 assert.deepEqual(game.stashedMods,['loader']);
 assert.equal(game.player.slots[0].mods[0],'barrel');
 assert.equal(game.player.gold,0);
 assert.equal(applyModSwap(0,0,'loader','barrel',true),false,'wrong slot is rejected');
 assert.deepEqual(game.stashedMods,['loader']);
});
test('confirmed swap consumes one new mod and scraps the old mod once',()=>{
 const {game,applyModSwap}=harness({bag:['rapidBarrel'],equipped:'barrel'});
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),true);
 assert.equal(game.player.slots[0].mods[0],'rapidBarrel');
 assert.deepEqual(game.stashedMods,[]);
 assert.equal(game.player.gold,10);
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),false);
 assert.equal(game.player.gold,10);
});

test('a full mod bag can swap one carried mod for an equipped mod without changing capacity',()=>{
 const bag=['rapidBarrel',...Array.from({length:11},(_,i)=>'other-'+i)];
 const {game,applyModSwap}=harness({bag,equipped:'barrel'});
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',false),true);
 assert.equal(game.player.slots[0].mods[0],'rapidBarrel');
 assert.equal(game.stashedMods.length,12);
 assert.ok(game.stashedMods.includes('barrel'));
 assert.ok(!game.stashedMods.includes('rapidBarrel'));
 assert.equal(game.player.gold,0);
});
test('a full mod bag can confirm a scrap swap without overflowing or paying twice',()=>{
 const bag=['rapidBarrel',...Array.from({length:11},(_,i)=>'other-'+i)];
 const {game,applyModSwap}=harness({bag,equipped:'barrel'});
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),true);
 assert.equal(game.stashedMods.length,11);
 assert.equal(game.player.slots[0].mods[0],'rapidBarrel');
 assert.equal(game.player.gold,10);
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),false);
 assert.equal(game.player.gold,10);
});
test('a swap rejected after equipment changes preserves the mod bag and gold',()=>{
 const {game,applyModSwap}=harness({bag:['rapidBarrel'],equipped:'barrel'});
 game.player.slots[0].mods[0]='loader';
 assert.equal(applyModSwap(0,0,'rapidBarrel','barrel',true),false);
 assert.deepEqual(game.stashedMods,['rapidBarrel']);
 assert.equal(game.player.slots[0].mods[0],'loader');
 assert.equal(game.player.gold,0);
});
