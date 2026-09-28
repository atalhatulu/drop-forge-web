import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync('src/game.js','utf8');
const start=source.indexOf('function modSlotUnlocked(index, weaponId){');
const end=source.indexOf('function getModSlots(weapon){',start);
assert.ok(start>=0&&end>start,'slot rule remains an independently testable function');
let level=1;
const unlocked=new Function('masteryLevel','WEAPON_NAMES',source.slice(start,end)+'return modSlotUnlocked;')(()=>level,Array.from({length:13},(_,i)=>'Weapon '+i));

test('hub and expedition use identical level 2/4/6/8 slot thresholds',()=>{
 const expected={1:0,2:1,3:1,4:2,5:2,6:3,7:3,8:4,10:4};
 for(const [lv,count] of Object.entries(expected)){
  level=Number(lv);
  assert.equal([0,1,2,3].filter(i=>unlocked(i,0)).length,count,'mastery '+lv);
 }
});
test('slot eligibility rejects invalid weapon and slot identifiers',()=>{
 level=10;
 for(const slot of [-1,4,1.5,NaN])assert.equal(unlocked(slot,0),false);
 for(const weapon of [-1,13,1.4,NaN])assert.equal(unlocked(0,weapon),false);
});
test('room milestones no longer advertise cosmetic unlocks',()=>{
 assert.doesNotMatch(source,/unlockModSlot\(/);
 assert.doesNotMatch(source,/modUnlocks:/);
 assert.doesNotMatch(source,/SEFERDE AÇILIR/);
 assert.match(source,/Silah özellikleri seferde sandık, çark ve oda ödüllerinden kazanılır/);
 assert.match(source,/if\(game\.inHub\)refreshForge\(\)/);
 assert.doesNotMatch(source.slice(source.indexOf('function grantMastery('),source.indexOf('function modSlotUnlocked(')),/applyStashedMods/);
 assert.doesNotMatch(source,/YENİ EKLENTİ YUVASI AÇILDI/);
});
