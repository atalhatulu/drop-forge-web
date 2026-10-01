import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const game=readFileSync('src/game.js','utf8');
const ai=readFileSync('src/enemy-ai.js','utf8');
const world=readFileSync('src/world.js','utf8');

test('finisher rewards preserve consumables and grant capped temporary shields',()=>{
 const begin=game.indexOf("if(e.finisherExecution){const reward=");
 const end=game.indexOf("\n const coins=",begin);
 assert.ok(begin>0&&end>begin);
 const code=game.slice(begin,end);
 assert.match(code,/reward===0.*'ammo'/);
 assert.match(code,/reward===1.*'health'/);
 assert.match(code,/reward===2.*'grenade'/);
 assert.match(code,/Math\.min\(45,\(p\.phaseShield\|\|0\)\+18\)/);
 for(let roll=0;roll<4;roll++){
  const drops=[],gameState={seed:123,player:{kills:9,phaseShield:40}};
  const trigger=new Function('e','game','room','hash2','dropPickup','floating','burst',code);
  trigger({finisherExecution:true,x:100,y:200,w:30,h:40},gameState,{},()=>roll,(...args)=>drops.push(args),()=>{},()=>{});
  if(roll===3){assert.equal(gameState.player.phaseShield,45);assert.equal(drops.length,0);}
  else{assert.equal(drops.length,1);assert.equal(drops[0][1],['ammo','health','grenade'][roll]);assert.equal(drops[0][4],true);}
 }
});
test('ranged attack alternation has readable warnings and lower multi-projectile damage',()=>{
 assert.match(ai,/alternateVolley=e\.type==='purple'&&pattern%2===1/);
 assert.match(ai,/droneBurst=e\.type==='blue'&&pattern%3===2/);
 assert.match(ai,/e\.attackPattern=pattern\+1/);
 assert.match(ai,/alternateVolley\?3:droneBurst\?2:1/);
 assert.match(ai,/alternateVolley\?\.65:droneBurst\?\.8:1/);
 assert.match(game,/ctx\.setLineDash\(\[8,6\]\)/);
 assert.match(game,/e\.type==='purple'\|\|e\.type==='blue'/);
});
test('new crossfire rooms have four extra valid layouts and never disturb boss topology',()=>{
 const root={window:{}};vm.runInNewContext(world,{window:root.window});
 const generator=root.window.DropForgeWorld.createMapGenerator({W:1120,FLOOR:548,buildTerrain:()=>{},buildBiome:()=>{}});
 const seenLayouts=new Set(),profiles=new Set();
 for(let seed=1;seed<=250;seed++){
  const rooms=generator(seed);
  for(const room of rooms){
   profiles.add(room.arenaProfile);seenLayouts.add(room.layout);
   for(const platform of room.platforms)assert.ok(platform.w>0&&platform.x>=0&&platform.x+platform.w<=1120,'seed '+seed+' room '+room.id);
   if(room.type==='boss')assert.equal(room.arenaProfile,'boss');
   if(room.arenaProfile==='crossfire')assert.ok(room.layout>=18&&room.layout<=21);
  }
 }
 for(let layout=18;layout<22;layout++)assert.ok(seenLayouts.has(layout),'extra layout '+layout+' is reachable');
 assert.ok(profiles.has('crossfire')&&profiles.has('vertical')&&profiles.has('cavern'));
});
test('electric shock, cryo, burn and critical impacts have distinct live render cues',()=>{
 assert.match(game,/shockFlashUntil/);
 assert.match(game,/DONDU/);
 assert.match(game,/SARSILDI/);
 assert.match(game,/#ff9d58/);
 assert.match(game,/#ffe17b/);
 assert.match(game,/#7df4ff/);
 assert.match(game,/shockCore'\)\)e\.shockFlashUntil=game\.elapsed\+\.3/);
});
