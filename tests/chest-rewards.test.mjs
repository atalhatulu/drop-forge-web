import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(readFileSync('src/chest-rewards.js','utf8'),context);
const {selectChestChoices,availableRewardMods,selectBossAttachment}=context.window.DropForgeChestRewards;
const mods={barrel:{slot:0,level:2},rapidBarrel:{slot:0,level:2},loader:{slot:1,level:4},extendedMag:{slot:1,level:4},core:{slot:2,level:6}};
function choose(config={}){
 const slot=config.slot||{weapon:0,mods:[null,null,null,null]};
 const player={slots:[slot],gearBag:Array(config.gearCount||0).fill({}),chipBag:config.chipBag||[],chips:{helmet:null}};
 return selectChestChoices({room:{x:1,y:4,id:4,type:config.type||'combat',reward:config.reward||'mod'},player,stashedMods:config.stashedMods||[],modCatalog:mods,chipCatalog:{gravity:{},kinetic:{},blood:{}},masteryLevel:()=>config.level??2,modSlotUnlocked:(j)=>[2,4,6,8][j]<=(config.level??2),seed:config.seed||42,hash:(x,y,s)=>Math.abs(s)>>>0,randomGear:()=>({id:'bastion-helmet',set:'bastion',slot:'helmet'}),random:()=>config.random??.2});
}
test('chest offers only attachable mods and never owned or already-slotted mods',()=>{
 for(let seed=1;seed<=300;seed++){
  const choices=choose({seed,level:2});
  assert.ok(choices.length>0&&choices.length<=3);
  assert.ok(choices.every(item=>item.type!=='mod'||['barrel','rapidBarrel'].includes(item.id)));
  assert.equal(new Set(choices.filter(item=>item.type==='mod').map(item=>item.id)).size,choices.filter(item=>item.type==='mod').length);
 }
 const choices=choose({level:2,stashedMods:['barrel']});
 assert.ok(choices.every(item=>item.type!=='mod'||item.id!=='barrel'));
});
test('full or blocked inventories receive no impossible chest options',()=>{
 assert.equal(choose({level:1,gearCount:20}).length,0);
 assert.equal(choose({level:2,gearCount:20,stashedMods:Array(12).fill('taken')}).length,0);
 const gear=choose({level:1});
 assert.ok(gear.length&&gear.every(item=>item.type==='gear'));
 const chips=choose({type:'elite',chipBag:['gravity','kinetic','blood'],level:1});
 assert.ok(chips.every(item=>item.type==='gear'));
});
test('elite chest excludes previously collected chips',()=>{
 const opts=choose({type:'elite',chipBag:['gravity']});
 assert.ok(opts.every(item=>item.type==='chip'&&item.id!=='gravity'));
});
test('chest rewards grant eligible traits, gear or chips without a legacy attachment claim',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/const choices=selectChestChoices\(/);
 assert.match(game,/choices\.splice\(0,choices\.length,\.\.\.choices\.filter\(item=>item\.type==='gear'\|\|item\.type==='chip'\)\)/);
 assert.match(game,/const traitChoices=window\.DropForgeWeaponTraits\.choices/);
 assert.match(game,/p\.gold\+=20;\s*announce\('SANDIK · UYGUN EŞYA YOK/);
 assert.match(game,/DropForgeWeaponTraits\.grant\(w,item\.id,WEAPON_PROJECTILES\)/);
 assert.doesNotMatch(game,/data-chest-choice/);
 assert.match(game,/closeChestUpgradeModal\(\);\s*updateHud\(\)/);
});

function rewardArgs({level=4,bag=[],slotMods=[null,null,null,null]}={}){
 return {player:{slots:[{weapon:0,mods:slotMods}]},stashedMods:bag,catalog:mods,masteryLevel:()=>level,modSlotUnlocked:j=>level>=[2,4,6,8][j]};
}
test('boss and wheel share ownership, capacity and slot validation',()=>{
 const options=availableRewardMods(rewardArgs());
 assert.ok(options.includes('barrel')&&options.includes('loader'));
 assert.equal(availableRewardMods(rewardArgs({bag:Array(12).fill('owned')})).length,0);
 assert.equal(availableRewardMods(rewardArgs({level:1})).length,0);
 assert.equal(availableRewardMods(rewardArgs({level:2,slotMods:['barrel']})).length,0);
 const choice=selectBossAttachment(rewardArgs(),123,2,()=>1);
 assert.equal(choice,options[1]);
 assert.equal(selectBossAttachment(rewardArgs({bag:Array(12).fill('owned')}),123,2,()=>1),null);
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

test('three-choice chest never offers the same gear twice when random gear repeats',()=>{
 const player={slots:[{weapon:0,mods:[null,null,null,null]}],gearBag:[],chipBag:[],chips:{}};
 const pieces=[
  {id:'bastion-helmet',set:'bastion',slot:'helmet'},
  {id:'runner-boots',set:'runner',slot:'boots'},
  {id:'arsenal-belt',set:'arsenal',slot:'belt'}
 ];
 let calls=0;
 const result=selectChestChoices({
  room:{x:2,y:3,id:7,type:'combat',reward:'mod'},player,
  stashedMods:[],modCatalog:{},chipCatalog:{},masteryLevel:()=>1,modSlotUnlocked:()=>false,
  seed:17,hash:()=>0,randomGear:()=>pieces[Math.min(2,Math.floor(calls++/2))],random:()=>0
 });
 assert.equal(result.length,3);
 assert.equal(new Set(result.map(item=>item.id)).size,3);
 assert.ok(result.every(item=>item.type==='gear'));
});
test('three-choice chest returns fewer options rather than repeating an unavailable gear selection',()=>{
 const player={slots:[],gearBag:[],chipBag:[],chips:{}};
 const result=selectChestChoices({
  room:{x:2,y:3,id:7,type:'combat',reward:'mod'},player,
  stashedMods:[],modCatalog:{},chipCatalog:{},masteryLevel:()=>1,modSlotUnlocked:()=>false,
  seed:17,hash:()=>0,randomGear:()=>({id:'bastion-helmet',set:'bastion',slot:'helmet'}),random:()=>0
 });
 assert.equal(result.length,1);
 assert.equal(result[0].id,'bastion-helmet');
});

test('chest cards show run trait details and apply directly to the owning weapon',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/trait\.description/);
 assert.match(game,/weaponName\(slot\.weapon\)/);
 assert.match(game,/SİLAHA HEMEN UYGULA/);
 assert.match(game,/DropForgeWeaponTraits\.grant\(w,item\.id,WEAPON_PROJECTILES\)/);
 assert.doesNotMatch(game,/ÇANTAYA AL · TAB İLE TAK/);
});

