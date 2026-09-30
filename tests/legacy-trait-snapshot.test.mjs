import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const window = {};
vm.runInNewContext(readFileSync('src/weapon-traits.js', 'utf8'), {window});

test('legacy main and support traits can be snapshotted into three run sockets', () => {
 const slot = {traits: {main: 'shockCore', supports: ['stabilizer'], levels: {shockCore: 2, stabilizer: 1}}};
 const snapshot = window.DropForgeWeaponTraits.snapshot(slot);
 assert.deepEqual(Array.from(snapshot.slots), ['shockCore', 'stabilizer', null]);
 assert.equal(snapshot.levels.shockCore, 2);
 assert.equal(snapshot.levels.stabilizer, 1);
 assert.notEqual(snapshot.levels, slot.traits.levels);
});
