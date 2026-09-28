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
test('chest opening and legacy bag claims retain rewards until actually received',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/const choices=selectChestChoices\(/);
 assert.match(game,/p\.gold\+=20;\s*announce\('SANDIK · UYGUN EŞYA YOK/);
 assert.match(game,/if\(game\.stashedMods\.length>=12\|\|game\.stashedMods\.includes\(pick\)/);
 assert.match(game,/EKLENTİ ALINAMIYOR · ÇANTANI DÜZENLE',2/);
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
 assert.match(source,/game\.modLevels\[mod\]\?\?=1/);
});
test('boss claim recomputes the offer and only consumes a valid rewarded attachment',()=>{
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/const id=selectBossAttachment\(/);
 assert.match(source,/id!==valid\)return;game\.stashedMods\.push\(id\)/);
 assert.match(source,/game\.pendingBossReward=null;renderLoadout\(\)/);
});
