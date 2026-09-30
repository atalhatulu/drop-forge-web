import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync('src/game.js','utf8');
const traits=readFileSync('src/weapon-traits.js','utf8');

test('run trait capacity is independent from the retired four attachment sockets',()=>{
 assert.doesNotMatch(game,/function modSlotUnlocked\(|function getModSlots\(|function installMod\(|function applyStashedMods\(/);
 assert.match(traits,/function state\(slot\)/);
 assert.match(traits,/slots\.some\(value=>!value\)/);
 assert.match(traits,/three equal sockets/);
 assert.match(traits,/next\.levels\[id\]=Math\.min\(3,/);
 assert.match(game,/Silah özellikleri seferde sandık, çark ve oda ödüllerinden kazanılır/);
});
test('permanent mastery never auto-installs an obsolete attachment',()=>{
 const start=game.indexOf('function grantMastery('),end=game.indexOf('let forgeFocusGun=',start);
 assert.ok(start>=0&&end>start);
 assert.doesNotMatch(game.slice(start,end),/applyStashedMods|EKLENTİ YUVASI AÇILDI/);
 assert.match(game,/if\(game\.inHub\)refreshForge\(\)/);
});
