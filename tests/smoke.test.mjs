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

test('game script parses and combat systems are wired', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.doesNotThrow(()=>new Function(source));
  assert.match(source,/function addFlow\(/);
  assert.match(source,/e\.windup=e\.type==='boss'/);
  assert.match(source,/function hitGenerator\(/);
  assert.match(source,/function weaponStatHTML\(/);
  assert.match(source,/synergyNote/);
  assert.match(source,/function roomRouteLabel\(/);
});

test('seeded map includes defense, hunt, and meaningful route rewards', () => {
  const source=readFileSync('src/game.js','utf8');
  const rngStart=source.indexOf('function rng(seed)');
  const rngEnd=source.indexOf('function announce(',rngStart);
  const hashStart=source.indexOf('function hash2(');
  const hashEnd=source.indexOf('const BIOMES=',hashStart);
  const mapStart=source.indexOf('function makeMap(seed)');
  const mapEnd=source.indexOf('function buildGame(seed)',mapStart);
  assert.ok(rngStart>=0 && rngEnd>rngStart && hashStart>=0 && hashEnd>hashStart && mapStart>=0 && mapEnd>mapStart);
  const mapFactory=new Function('W','FLOOR',source.slice(rngStart,rngEnd)+source.slice(hashStart,hashEnd)+'function buildTerrain(r){}function buildBiome(r){}'+source.slice(mapStart,mapEnd)+'return makeMap;')(1120,548);
  const back={left:'right',right:'left',up:'down',down:'up'};
  for(const seed of [1,42,97321,382711,12345678]){
    const rooms=mapFactory(seed);
    assert.ok(rooms.some(r=>r.type==='defense'), 'defense room in seed '+seed);
    assert.ok(rooms.some(r=>r.type==='hunt'), 'hunt room in seed '+seed);
    assert.ok(rooms.every(r=>['ammo','xp','mod','health'].includes(r.reward)));
    assert.ok(rooms.every(r=>Object.entries(r.links).every(([dir,id])=>rooms[id].links[back[dir]]===r.id)));
    assert.deepEqual(mapFactory(seed).map(r=>[r.x,r.y,r.type,r.reward]),rooms.map(r=>[r.x,r.y,r.type,r.reward]));
  }
});

test('defense completion and route reward markup are present', () => {
  const source=readFileSync('src/game.js','utf8');
  const html=readFileSync('index.html','utf8');
  assert.match(source,/room\.generator\.time===0/);
  assert.match(source,/room\.generator\.failed/);
  assert.match(source,/awardRoomReward\(room\)/);
  assert.match(html,/id="mapRoute"/);
});

test('game boot keeps chest helper in a function and populates both starter selects', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.match(source,/function dropChest\(room\)\{/);
  assert.match(source,/for\(let i=1;i<=2;i\+\+\)\$\('forgeGun'\+i\)\.onchange=refreshForge/);
  assert.match(source,/refreshForge\(\);\s*function weaponName/);
});

test('four five-room regions form a boss-gated downward tree', () => {
 const source=readFileSync('src/game.js','utf8');
 const rngStart=source.indexOf('function rng(seed)'),rngEnd=source.indexOf('function announce(',rngStart);
 const hashStart=source.indexOf('function hash2('),hashEnd=source.indexOf('const BIOMES=',hashStart);
 const mapStart=source.indexOf('function makeMap(seed)'),mapEnd=source.indexOf('function buildGame(seed)',mapStart);
 const makeMap=new Function('W','FLOOR',source.slice(rngStart,rngEnd)+source.slice(hashStart,hashEnd)+'function buildTerrain(r){}function buildBiome(r){}'+source.slice(mapStart,mapEnd)+'return makeMap;')(1120,548);
 const biomeNames=['cave','forest','crystal','lava'],back={left:'right',right:'left',up:'down',down:'up'};
 for(const seed of [1,42,97321,382711,12345678,333333,999999]){
  const rooms=makeMap(seed),bosses=rooms.filter(r=>r.type==='boss'),spine=rooms.filter(r=>r.spine);
  assert.deepEqual(bosses.map(r=>r.y),[5,10,15,20]);
  assert.deepEqual(bosses.map(r=>r.bossStage),[1,2,3,4]);
  assert.equal(spine.length,21);
  assert.ok(rooms.length>45 && rooms.some(r=>r.branchEnd&&r.type==='treasure'));
  assert.ok(rooms.every(r=>r.biome===biomeNames[r.stage-1]));
  assert.ok(rooms.every(r=>r.level===Math.min(3,r.stage)));
  assert.ok(rooms.every(r=>Object.entries(r.links).every(([dir,id])=>rooms[id].links[back[dir]]===r.id)));
  assert.deepEqual(makeMap(seed).map(r=>[r.x,r.y,r.type,r.biome,r.level]),rooms.map(r=>[r.x,r.y,r.type,r.biome,r.level]));
  for(const boss of bosses)assert.equal(boss.links.down,spine[boss.y+1]?.id,'boss has the sole route to next biome');
 }
});

test('victory is gated to fourth boss, and map reveals inactive nodes', () => {
  const source=readFileSync('src/game.js','utf8'),html=readFileSync('index.html','utf8');
  assert.match(source,/room\.type==='boss'&&room\.bossStage===4/);
  assert.match(source,/known=room\.discovered\|\|room\.visited/);
  assert.match(source,/known\?room\.type==='boss'/);
  assert.match(html,/id="mapCanvas" width="900" height="920"/);
});

test('automatic kit and three-hit melee have visible feedback', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.match(source,/p\.hp>0&&p\.hp<p\.maxHp\*\.5&&p\.kits>0&&!nearbyGroundKit\(currentRoom\(\),p\)\)useKit\(true\)/);
  assert.match(source,/function useKit\(auto=false\)/);
  assert.match(source,/p\.meleeCombo=now</);
  assert.match(source,/combo===3\?57/);
  assert.match(source,/game\.muzzleFlash=/);
  assert.match(source,/flashTint='255,95,109'/);
});

test('ground healing works with a full bag without spending inventory', () => {
 const source=readFileSync('src/game.js','utf8');
 const start=source.indexOf('function nearbyGroundKit(room,p)'),end=source.indexOf('function useKit(auto=false)',start);
 assert.ok(start>=0&&end>start);
 const helpers=new Function('burst','floating','sound','updateHud',source.slice(start,end)+'return {nearbyGroundKit,consumeGroundKit};')(()=>{},()=>{},()=>{},()=>{});
 const player={x:90,y:80,w:25,h:43,hp:28,maxHp:100,kits:5},item={kind:'health',x:103,y:100,grounded:true,taken:false},room={loot:[item]};
 assert.equal(helpers.nearbyGroundKit(room,player),item);
 assert.equal(helpers.consumeGroundKit(room,item,player),true);
 assert.equal(player.hp,73);
 assert.equal(player.kits,5);
 assert.equal(item.taken,true);
 assert.equal(helpers.consumeGroundKit(room,item,player),false,'ground kit cannot be consumed twice');
});
test('enemy level scales HP, attack damage and fire rate', () => {
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/\[1,1\.42,1\.9\]\[\(room\.level\|\|1\)-1\]/);
 assert.match(source,/damageScale:\[1,1\.28,1\.58\]/);
 assert.match(source,/\[1,\.91,\.82\]\[\(e\.level\|\|1\)-1\]/);
 assert.match(source,/LV '\+\(e\.level\|\|1\)/);
});

test('each stat attachment occupies its own dedicated weapon slot', () => {
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/barrel:\{name:'GÜÇ NAMLU',level:2,slot:0/);
 assert.match(source,/loader:\{name:'HIZLI MEKANİZMA',level:4,slot:1/);
 assert.match(source,/core:\{name:'FAZ ÇEKİRDEĞİ',level:6,slot:2/);
 assert.match(source,/stabilizer:\{name:'DENGELEYİCİ',level:8,slot:3/);
 const start=source.indexOf('function installMod(slot,mod)'),end=source.indexOf('function applyStashedMods(',start);
 assert.ok(start>=0&&end>start);
 const install=new Function('MODS','masteryLevel','getModSlots',source.slice(start,end)+'return installMod;')(
 {barrel:{level:2,slot:0},loader:{level:4,slot:1},core:{level:6,slot:2},stabilizer:{level:8,slot:3}},()=>9,()=>4);
 const weapon={weapon:0,mods:[]};
 assert.equal(install(weapon,'loader'),true);
 assert.equal(weapon.mods[0],undefined);
 assert.equal(weapon.mods[1],'loader');
 assert.equal(install(weapon,'loader'),false);
 assert.equal(install(weapon,'barrel'),true);
 assert.equal(weapon.mods[0],'barrel');
});
test('gold and ammo enemy drops feed a real purchase panel', () => {
 const source=readFileSync('src/game.js','utf8'),html=readFileSync('index.html','utf8');
 assert.match(source,/dropPickup\(room,'gold',e\.x\+e\.w\/2/);
 assert.match(source,/Math\.random\(\)<\.44\)dropPickup\(room,'ammo'/);
 assert.match(source,/if\(item\.kind==='gold'\)\{p\.gold\+=/);
 assert.match(source,/function buyShopItem\(id\)/);
 assert.match(source,/p\.gold-=price/);
 assert.match(source,/function shopCanBuy\(id\)/);
 assert.match(html,/id="shopOverlay"/);
 assert.match(html,/id="shopItems"/);
});
