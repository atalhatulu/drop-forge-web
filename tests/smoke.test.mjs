import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('HTML loads split CSS and JS entrypoints', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /href="\.\/styles\/game\.css"/);
  assert.match(html, /src="\.\/src\/game\.js"/);
  assert.match(html, /<canvas\b/i);
});

test('source files contain game logic and styles', () => {
  const js = readFileSync('src/game.js', 'utf8');
  const css = readFileSync('styles/game.css', 'utf8');
  assert.ok(js.length > 50000);
  assert.ok(css.length > 5000);
});

test('portals resume spawning after the concurrent enemy dies', () => {
  const source = readFileSync('src/game.js', 'utf8');
  const start = source.indexOf('for(const portal of room.portals){if(!portal.alive)continue;');
  const end = source.indexOf('for(const c of room.crystals)', start);
  assert.ok(start >= 0 && end > start, 'portal update block exists');
  const tick = new Function('room', 'game', 'dt', 'spawnEnemy', source.slice(start, end));
  const portal = {alive:true,type:'red',time:0,spawnDuration:1,max:1,produced:99,x:150,y:200};
  const room = {portals:[portal],enemies:[],enemyCap:3};
  const game = {settings:{cap:3,spawnDelay:2}};
  const spawnEnemy = (r,type) => { const enemy={type,alive:true};r.enemies.push(enemy);return enemy; };
  tick(room,game,.1,spawnEnemy);
  assert.equal(room.enemies.length,1);
  tick(room,game,3,spawnEnemy);
  assert.equal(room.enemies.length,1,'concurrent spawn limit applies');
  room.enemies.length=0;
  tick(room,game,.1,spawnEnemy);
  assert.equal(room.enemies.length,1,'the portal spawns again after its previous enemy dies');
  assert.equal(portal.time,2);
});

test('attachment stats reflect actual game modifiers', () => {
  const source = readFileSync('src/game.js', 'utf8');
  const start=source.indexOf('function weaponStats(slot)');
  const end=source.indexOf('function statRow(',start);
  assert.ok(start>=0 && end>start);
  const getStats=new Function('WEAPON_DAMAGE','WEAPON_FIRE_RATES','WEAPON_PROJECTILES','MAG_SIZE',source.slice(start,end)+'return weaponStats;')([30],[.25],['kinetic'],[15]);
  const basic=getStats({weapon:0,mods:[]});
  const upgraded=getStats({weapon:0,mods:['barrel','loader','core','stabilizer']});
  assert.equal(basic.damage,30);
  assert.equal(upgraded.damage,35);
  assert.equal(upgraded.fireRate,5);
  assert.equal(upgraded.reload,.68);
  assert.equal(upgraded.pierce,1);
  assert.equal(upgraded.spread,.7);
});

test('starter loadout exposes four attachment slots for both weapons', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.match(source,/function ensureForgeModSlots\(\)/);
  assert.match(source,/for\(let j=2;j<=4;j\+\+\)/);
  assert.match(source,/mods:chosenForgeMods\(i\+1\)/);
});

test('empty weapon warning is throttled while mouse is held', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.match(source,/p\.emptyWarningTime=2\.8/);
  assert.match(source,/emptyWarningTime\|\|0/);
  assert.match(source,/emptyWarningTime=Math\.max\(0/);
});

test('more initial ammunition and biome enemy codex are enabled', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.match(source,/MAG_SIZE\[weapon\]\*7/);
  assert.match(source,/function enemyCodexHTML\(\)/);
  assert.match(source,/root\.insertAdjacentHTML\('beforeend',enemyCodexHTML\(\)\)/);
});
