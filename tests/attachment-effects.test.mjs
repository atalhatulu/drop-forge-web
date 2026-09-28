import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(readFileSync('src/attachment-effects.js','utf8'),context);
const {shotProfile,bounceBullet}=context.window.DropForgeAttachmentEffects;

test('overheat converts only the final shot into one explosive projectile',()=>{
 const slot={mods:['overheat']},stats={family:'scatter',pellets:5};
 assert.deepEqual({...shotProfile(slot,2,stats)},{family:'scatter',pellets:5});
 assert.deepEqual({...shotProfile(slot,0,stats)},{family:'explosive',pellets:1});
 assert.deepEqual({...shotProfile({mods:[]},0,stats)},{family:'scatter',pellets:5});
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
 assert.match(g,/shotProfile\(p\.slots\[p\.activeSlot\],p\.ammo,st\)/);
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
