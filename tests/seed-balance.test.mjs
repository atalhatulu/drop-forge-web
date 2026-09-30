import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const worldSource=readFileSync('src/world.js','utf8');
const gameSource=readFileSync('src/game.js','utf8');
const context={window:{}};
vm.runInNewContext(worldSource,context);
const {createMapGenerator}=context.window.DropForgeWorld;
const generate=createMapGenerator({W:1120,FLOOR:548,buildTerrain:()=>{},buildBiome:()=>{}});
const needed=[1,2,2,3];

function reachableBeforeBoss(rooms,stage){
 const seen=new Set([0]),queue=[0];
 for(const id of queue)for(const next of Object.values(rooms[id].links)){
  if(seen.has(next)||rooms[next].type==='boss'&&rooms[next].bossStage>=stage)continue;
  seen.add(next);queue.push(next);
 }
 return seen;
}

test('1,024 seeded expeditions contain reachable gates, quest rooms and an early treasure chest',()=>{
 for(const seed of [...Array.from({length:1024},(_,i)=>i+1),382711,12345678,999999]){
  const rooms=generate(seed);
  assert.ok(rooms.some(room=>room.stage===1&&room.type==='treasure'&&room.branchEnd&&!room.bossKey),`seed ${seed} lacks first-region treasure`);
  assert.ok(rooms.some(room=>room.secret?.kind==='module'&&room.stage===1),`seed ${seed} lacks first-region module`);
  assert.ok(rooms.some(room=>room.secret?.kind==='rune'&&room.stage>=2),`seed ${seed} lacks rune alcove`);
  assert.ok(rooms.some(room=>room.stage===3&&room.bossDefenseRequired),`seed ${seed} lacks third-region defense`);
  assert.deepEqual(Array.from(rooms.filter(room=>room.type==='boss'),room=>room.bossStage),[1,2,3,4]);
  for(let stage=1;stage<=4;stage++){
   const keys=rooms.filter(room=>room.bossKey&&room.keyStage===stage),reachable=reachableBeforeBoss(rooms,stage);
   assert.equal(keys.length,needed[stage-1],`seed ${seed} stage ${stage} key count`);
   assert.ok(keys.every(room=>reachable.has(room.id)),`seed ${seed} stage ${stage} has an inaccessible key`);
  }
 }
});

test('seeded room layouts, rewards and early treasure remain deterministic',()=>{
 for(const seed of [18,56,209,263,319,403,382711]){
  const digest=rooms=>rooms.map(room=>[room.id,room.x,room.y,room.type,room.reward,room.bossKey,room.secret?.kind]);
  assert.deepEqual(digest(generate(seed)),digest(generate(seed)));
 }
});

const start=gameSource.indexOf('function awardRoomReward(room){');
const end=gameSource.indexOf('function dropChest(room){',start);
assert.ok(start>=0&&end>start,'reward generator must be independently testable');
function rewardScenario({level=1,slots=[{weapon:0,mods:[]}],offers=[{type:'trait',id:'shockCore',weaponSlot:0,kind:'main'}],paused=false,chestUpgradeOpen=false}={}){
 const drops=[],opened=[],messages=[],game={seed:19,player:{slots},currentChestUpgradeChoices:null};
 const traits={choices(args){assert.equal(args.slots,slots);return offers;}};
 const fn=new Function('game','window','paused','chestUpgradeOpen','openWeaponRewardChoice','WEAPON_PROJECTILES','hash2','dropPickup','grantMastery','announce','availableChips','weightedLoot','W','FLOOR',gameSource.slice(start,end)+'return awardRoomReward;')(
  game,{DropForgeWeaponTraits:traits},paused,chestUpgradeOpen,()=>{if(paused||chestUpgradeOpen||!offers.length)return false;opened.push(offers);game.currentChestUpgradeChoices=offers;return true;},['kinetic'],()=>3,(...args)=>drops.push(args),()=>{},message=>messages.push(message),()=>[],()=>null,1120,548);
 fn({id:1,x:1,y:1,level,reward:'mod',type:'combat',branchEnd:false});
 return {drops,opened,messages,game};
}

test('room reward offers run traits immediately without dropping legacy attachments',()=>{
 const {drops,opened,messages,game}=rewardScenario();
 assert.equal(drops.length,0);
 assert.equal(opened.length,1);
 assert.deepEqual(opened[0],game.currentChestUpgradeChoices);
 assert.equal(opened[0][0].id,'shockCore');
 assert.ok(messages.some(message=>message.includes('SİLAHINI SEÇ')));
});

test('room reward gives scaled gold when no trait is eligible or a choice modal is already open',()=>{
 for(const options of [{offers:[]},{chestUpgradeOpen:true},{paused:true},{slots:[],offers:[]}]){
  const {drops,opened,game}=rewardScenario({...options,level:4});
  assert.equal(opened.length,0);
  assert.deepEqual(drops.map(drop=>drop[1]),['gold']);
  assert.equal(drops[0][5],115);
  assert.equal(game.currentChestUpgradeChoices,null);
 }
});

test('enemy health and damage increase across all four regions with a distinct fourth-region shield',()=>{
 const begin=gameSource.indexOf('function spawnEnemy(room,type,x,y){');
 const finish=gameSource.indexOf('function requiredBossKeys(stage){',begin);
 assert.ok(begin>=0&&finish>begin);
 const game={seed:1,settings:{enemyHp:.9}};
 const variants=Object.fromEntries(['cave','forest','crystal','lava'].map(biome=>[biome,{red:'red'}]));
 const spawn=new Function('game','rng','VARIANTS',gameSource.slice(begin,finish)+'return spawnEnemy;')(game,()=>()=>.5,variants);
 const enemies=[1,2,3,4].map(level=>spawn({id:level,level,biome:['cave','forest','crystal','lava'][level-1],enemies:[]},'red',200,400));
 for(let i=1;i<enemies.length;i++){
  assert.ok(enemies[i].hp>enemies[i-1].hp);
  assert.ok(enemies[i].damageScale>enemies[i-1].damageScale);
 }
 assert.ok(enemies.slice(0,3).every(enemy=>enemy.shield===0));
 assert.equal(enemies[3].shield,Math.round(enemies[3].maxHp*.5));
});
