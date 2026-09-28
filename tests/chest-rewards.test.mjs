import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(readFileSync('src/chest-rewards.js','utf8'),context);
const {selectChestChoices}=context.window.DropForgeChestRewards;
function choose(config={}){
 const player={slots:config.slots||[{weapon:0,mods:[]}],gearBag:Array(config.gearCount||0).fill({}),chipBag:config.chipBag||[],chips:config.chips||{helmet:null}};
 const pieces=config.pieces||[{id:'bastion-helmet',set:'bastion',slot:'helmet'},{id:'runner-boots',set:'runner',slot:'boots'},{id:'arsenal-belt',set:'arsenal',slot:'belt'}];
 let calls=0;
 return selectChestChoices({
  room:{x:1,y:4,id:4,type:config.type||'combat',reward:config.reward||'mod'},
  player,chipCatalog:{gravity:{},kinetic:{},blood:{}},seed:config.seed||42,
  hash:(x,y,z)=>Math.abs(z)>>>0,
  randomGear:()=>pieces[Math.min(pieces.length-1,Math.floor(calls++/2))]
 });
}
test('normal chests offer unique gear without reading legacy mod inventories',()=>{
 for(let seed=1;seed<=100;seed++){
  const choices=choose({seed});
  assert.equal(choices.length,3);
  assert.equal(new Set(choices.map(item=>item.id)).size,3);
  assert.ok(choices.every(item=>item.type==='gear'));
 }
 const full=choose({gearCount:20});
 assert.equal(full.length,0);
});
test('elite and chip chests exclude collected or equipped chips',()=>{
 const choices=choose({type:'elite',chipBag:['gravity'],chips:{helmet:'kinetic'}});
 assert.deepEqual(choices.map(item=>item.id),['blood']);
 assert.equal(choices[0].type,'chip');
 const exhausted=choose({type:'elite',chipBag:['gravity','kinetic','blood']});
 assert.ok(exhausted.every(item=>item.type==='gear'));
 assert.equal(choose({type:'elite',chipBag:['gravity','kinetic','blood'],gearCount:20}).length,0);
});
test('normal chest has a unique gear fallback when no weapon accepts traits',()=>{
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/const choices=selectChestChoices\(\{room,player:p,chipCatalog:GEAR\.CHIPS/);
 assert.match(source,/if\(traitChoices\.length\)choices\.splice\(0,choices\.length,\.\.\.traitChoices\)/);
 assert.match(source,/else choices\.splice\(0,choices\.length,\.\.\.choices\.filter\(item=>item\.type==='gear'\)\)/);
 assert.match(source,/p\.gold\+=20;\s*announce\('SANDIK · UYGUN EŞYA YOK/);
 assert.match(source,/DropForgeWeaponTraits\.grant\(w,item\.id,WEAPON_PROJECTILES\)/);
 assert.doesNotMatch(source,/data-chest-choice/);
 assert.match(source,/closeChestUpgradeModal\(\);\s*updateHud\(\)/);
});
test('pure chest reward selection has no legacy attachment dependency',()=>{
 const rewards=readFileSync('src/chest-rewards.js','utf8');
 assert.doesNotMatch(rewards,/stashedMods|modCatalog|modSlotUnlocked|masteryLevel|availableRewardMods|selectBossAttachment/);
 assert.match(rewards,/root\.DropForgeChestRewards=Object\.freeze\(\{selectChestChoices\}\)/);
});

test('wheel fallback pays gold instead of discarding a full gear bag or reserve',()=>{
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/if\(p\.gearBag\.length<20\)\{grantGear/);
 assert.match(source,/ZIRH ÇANTASI DOLU · \+85 ALTIN/);
 assert.match(source,/MÜHİMMAT DOLU · \+75 ALTIN/);
 assert.match(source,/w\.traitOffers=offers/);
 assert.match(source,/ÇARK ÖDÜLÜ · \+85 ALTIN/);
});
test('boss trait prize recomputes a compatible offer and grants it directly to the equipped weapon',()=>{
 const source=readFileSync('src/game.js','utf8');
 const render=source.slice(source.indexOf('if(game.pendingBossReward){'),source.indexOf('if(game.pendingRune){',source.indexOf('if(game.pendingBossReward){')));
 const claim=source.slice(source.indexOf("const bossButton=e.target.closest('button[data-boss-reward]')"),source.indexOf("const runeButton=e.target.closest('button[data-rune-slot]')"));
 assert.match(render,/DropForgeWeaponTraits\.choices/);
 assert.match(render,/data-boss-reward="trait"/);
 assert.doesNotMatch(render,/dataset\.attachment/);
 assert.match(claim,/DropForgeWeaponTraits\.grant\(slot,offer\.id,WEAPON_PROJECTILES\)/);
 assert.doesNotMatch(claim,/game\.stashedMods\.push\(id\)/);
 assert.match(claim,/game\.pendingBossReward=null;renderLoadout\(\)/);
});

test('gear fallback retries repeat draws without offering duplicate pieces',()=>{
 const choices=choose({pieces:[{id:'bastion-helmet',set:'bastion',slot:'helmet'},{id:'runner-boots',set:'runner',slot:'boots'}]});
 assert.equal(choices.length,2);
 assert.equal(new Set(choices.map(item=>item.id)).size,2);
});
test('gear fallback returns fewer offers if only one piece is available',()=>{
 const choices=choose({slots:[],pieces:[{id:'bastion-helmet',set:'bastion',slot:'helmet'}]});
 assert.equal(choices.length,1);
 assert.equal(choices[0].id,'bastion-helmet');
});

test('chest cards show run trait details and apply directly to the owning weapon',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/trait\.description/);
 assert.match(game,/weaponName\(slot\.weapon\)/);
 assert.match(game,/SİLAHA HEMEN UYGULA/);
 assert.match(game,/DropForgeWeaponTraits\.grant\(w,item\.id,WEAPON_PROJECTILES\)/);
 assert.doesNotMatch(game,/ÇANTAYA AL · TAB İLE TAK/);
});

