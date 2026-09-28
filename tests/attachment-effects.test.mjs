import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(readFileSync('src/attachment-effects.js','utf8'),context);
const {shotProfile,bounceBullet,resolveAttachmentHit,burstPlan,overchargeInterval}=context.window.DropForgeAttachmentEffects;

test('overheat converts only the final shot into one explosive projectile',()=>{
 const slot={mods:['overheat']},stats={family:'scatter',pellets:5};
 assert.deepEqual({...shotProfile(slot,2,stats)},{family:'scatter',pellets:5});
 assert.deepEqual({...shotProfile(slot,0,stats)},{family:'explosive',pellets:1});
 assert.deepEqual({...shotProfile({mods:[]},0,stats)},{family:'scatter',pellets:5});
 assert.deepEqual({...shotProfile(slot,0,stats,false)},{family:'scatter',pellets:5});
});
test('mirror barrel ricochets once at the arena boundary',()=>{
 const b={x:18,y:220,vx:-140,vy:5,bounces:1},bounds={left:25,right:1095,top:25,bottom:548};
 assert.equal(bounceBullet(b,bounds),true);
 assert.equal(b.x,25);
 assert.equal(b.vx,140);
 assert.equal(b.bounces,0);
 b.x=18;
 assert.equal(bounceBullet(b,bounds),false);
});
test('attachment effects, gear pickup and chest failure handling are wired into gameplay',()=>{
 const g=readFileSync('src/game.js','utf8');
 assert.match(g,/shotProfile\(p\.slots\[p\.activeSlot\],p\.ammo,st,spentAmmo\)/);
 assert.match(g,/bounces:p\.slots\[p\.activeSlot\]\.mods\.includes\('mirrorBarrel'\)\?1:0/);
 assert.match(g,/bounceBullet\(bullet,\{left:25,right:W-25,top:25,bottom:FLOOR\}\)/);
 const grant=g.slice(g.indexOf('function grantGear('),g.indexOf('function earnLegacy(',g.indexOf('function grantGear(')));
 assert.doesNotMatch(grant,/unlockGear\(/);
 assert.match(g,/p\.gearBag\.push\(item\.artifact\);unlockGear\(item\.artifact\)/);
 assert.match(g,/p\.gearBag\.push\(item\);\s*unlockGear\(item\)/);
 assert.match(g,/ZIRH ÇANTASI DOLU[^]*?return;/);
 assert.match(g,/CHIP ÇANTASI DOLU[^]*?return;/);
 assert.match(g,/ÇANTA DOLU · EKLENTİ ALINAMADI[^]*?return;/);
});

test('hunter mark gives critical hits for five seconds without affecting unmarked enemies',()=>{
 const enemy={},marked=resolveAttachmentHit(enemy,{mods:['hunterMark']},1,false,.99);
 assert.equal(marked.multiplier,1.5);
 assert.equal(enemy.hunterMarkTime,5);
 assert.equal(resolveAttachmentHit(enemy,{mods:[]},2,false,.99).multiplier,1.5);
 enemy.hunterMarkTime=0;
 assert.equal(resolveAttachmentHit(enemy,{mods:[]},7,false,.99).multiplier,1);
});
test('cryo stacks three hits within three seconds and freezes, then resets',()=>{
 const enemy={},bullet={mods:['cryoCore']};
 resolveAttachmentHit(enemy,bullet,1,false,.5);
 resolveAttachmentHit(enemy,bullet,2,false,.5);
 assert.equal(enemy.freezeTime||0,0);
 resolveAttachmentHit(enemy,bullet,3,false,.5);
 assert.equal(enemy.freezeTime,1.5);
 assert.equal(enemy.cryoHits,0);
 const other={};resolveAttachmentHit(other,bullet,1,false,.5);
 resolveAttachmentHit(other,bullet,6,false,.5);
 assert.equal(other.cryoHits,1);
});
test('stationary stabilizer critical chance is limited to stopped players',()=>{
 const bullet={mods:['heavyStabilizer']};
 assert.equal(resolveAttachmentHit({},bullet,1,true,.1).critical,true);
 assert.equal(resolveAttachmentHit({},bullet,1,true,.3).critical,false);
 assert.equal(resolveAttachmentHit({},bullet,1,false,.1).critical,false);
});
test('critical ammo refund is capped and shared by shotgun pellet volley',()=>{
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/const spentAmmo=Math\.random\(\)>=/);
 assert.match(game,/shotProfile\(p\.slots\[p\.activeSlot\],p\.ammo,st,spentAmmo\)/);
 assert.match(game,/bullet\.shotEffects\.refunded/);
 assert.match(game,/p\.ammo<weaponStats\(slot\)\.mag/);
 const ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(ai,/if\(e\.freezeTime>0\)\{e\.vx=0;return;\}/);
 assert.match(ai,/e\.cryoSlowTime>0\?\.65:1/);
});

test('triple burst queues two follow-up rounds and does not queue ordinary weapons',()=>{
 assert.deepEqual({...burstPlan({mods:['tripleBurst']})},{remaining:2,delay:.085});
 assert.equal(burstPlan({mods:['loader']}),null);
 const g=readFileSync('src/game.js','utf8');
 assert.match(g,/function fire\(burstContinuation=false\)/);
 assert.match(g,/if\(game\.burstFire\)\{/);
 assert.match(g,/burst\.remaining--/);
 assert.match(g,/fire\(true\)/);
 assert.match(g,/if\(burstContinuation\)\{game\.burstFire=null;return;\}/);
});
test('laser sweep converts shotgun pellets to one powerful piercing beam',()=>{
 const shotgun=shotProfile({mods:['laserSweep']},3,{family:'scatter',pellets:5});
 assert.deepEqual({...shotgun},{family:'laser',pellets:1,damageMultiplier:3});
 const ordinary=shotProfile({mods:[]},3,{family:'scatter',pellets:5});
 assert.deepEqual({...ordinary},{family:'scatter',pellets:5});
 const game=readFileSync('src/game.js','utf8'),stats=readFileSync('src/weapon-stats.js','utf8');
 assert.match(game,/Math\.max\(st\.speed,1600\)/);
 assert.match(game,/shot\.damageMultiplier\|\|1/);
 assert.match(game,/b\.mods\?\.includes\('laserSweep'\)/);
 assert.match(stats,/mods\.includes\('laserSweep'\)\?2:0/);
});
test('overcharge doubles firing speed only during a two-second activation',()=>{
 const p={},slot={mods:['overchargeGrip']};
 assert.equal(overchargeInterval(p,slot,.2),.1);
 assert.equal(p.overchargeTime,2);
 assert.equal(p.overchargeCooldown,10);
 p.overchargeTime=0;p.overchargeCooldown=7;
 assert.equal(overchargeInterval(p,slot,.2),.2);
 assert.equal(overchargeInterval(p,{mods:[]},.2),.2);
 const stats=readFileSync('src/weapon-stats.js','utf8');
 assert.doesNotMatch(stats,/mods\.includes\('overchargeGrip'\)\?scaled\('overchargeGrip',1\.35\)/);
 const g=readFileSync('src/game.js','utf8');
 assert.match(g,/overchargeInterval\(p,slot,stForAmmo\.interval\)/);
 assert.match(g,/p\.overchargeTime=Math\.max\(0/);
});
