import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const readProjectCss=()=>['styles/game.css','styles/quickbar.css','styles/workbench.css'].map(path=>readFileSync(path,'utf8')).join('\n');
const readBootScripts=()=>['src/catalog.js','src/progression.js','src/abilities-data.js','src/shop-data.js','src/mod-presentation.js','src/world.js','src/weapon-stats.js','src/enemy-ai.js','src/shop-view.js','src/map-view.js','src/biome-view.js','src/loadout-presentation.js','src/scene-props.js','src/loot-view.js','src/game.js'].map(path=>readFileSync(path,'utf8')).join('\n');

test('HTML loads split CSS and JS entrypoints', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /href="\.\/styles\/game\.css"/);
  assert.match(html, /src="\.\/src\/catalog\.js"[^]*src="\.\/src\/world\.js"[^]*src="\.\/src\/game\.js"/);
  assert.match(html, /href="\.\/styles\/quickbar\.css"/);
  assert.match(html, /href="\.\/styles\/workbench\.css"/);
  assert.match(html, /<canvas\b/i);
});

test('source files contain game logic and styles', () => {
  const js = readFileSync('src/game.js', 'utf8');
  const css = readProjectCss();
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
  const root={};new Function('window',readFileSync('src/weapon-stats.js','utf8'))(root);
  const getStats=root.DropForgeWeaponStats.createWeaponStats({WEAPON_DAMAGE:[30],WEAPON_FIRE_RATES:[.25],WEAPON_PROJECTILES:['kinetic'],MAG_SIZE:[15]});
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
  assert.match(source,/function forgeMods\(n\)/);
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
  assert.match(readFileSync('src/loadout-presentation.js','utf8'),/function enemyCodexHTML\(\)/);
  assert.match(source,/root\.insertAdjacentHTML\('beforeend',enemyCodexHTML\(\)\)/);
});

test('game script parses and combat systems are wired', () => {
  const source=readFileSync('src/game.js','utf8');
  assert.doesNotThrow(()=>new Function(source));
  assert.match(source,/function addFlow\(/);
  assert.match(readFileSync('src/enemy-ai.js','utf8'),/e\.windup=e\.type==='boss'/);
  assert.match(source,/function hitGenerator\(/);
  assert.match(readFileSync('src/loadout-presentation.js','utf8'),/function weaponStatHTML\(/);
  assert.match(readFileSync('src/loadout-presentation.js','utf8'),/synergyNote/);
  assert.match(source,/function roomRouteLabel\(/);
});

test('seeded map includes defense, hunt, and meaningful route rewards', () => {
  const source=readFileSync('src/game.js','utf8');
  const root={};new Function('window',readFileSync('src/world.js','utf8'))(root);
  const mapFactory=root.DropForgeWorld.createMapGenerator({W:1120,FLOOR:548,buildTerrain:()=>{},buildBiome:()=>{}});
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
  assert.match(source,/\$\('forgeGun'\+n\)\.onchange=/);
  assert.match(source,/refreshForge\(\);\s*function weaponName/);
});

test('four five-room regions form a boss-gated downward tree', () => {
 const source=readFileSync('src/game.js','utf8');
 const root={};new Function('window',readFileSync('src/world.js','utf8'))(root);
 const makeMap=root.DropForgeWorld.createMapGenerator({W:1120,FLOOR:548,buildTerrain:()=>{},buildBiome:()=>{}});
 const biomeNames=['cave','forest','crystal','lava'],back={left:'right',right:'left',up:'down',down:'up'};
 for(const seed of [1,42,97321,382711,12345678,333333,999999]){
  const rooms=makeMap(seed),bosses=rooms.filter(r=>r.type==='boss'),spine=rooms.filter(r=>r.spine);
  assert.deepEqual(bosses.map(r=>r.y),[5,10,15,20]);
  assert.deepEqual(bosses.map(r=>r.bossStage),[1,2,3,4]);
  assert.equal(spine.length,21);
  assert.ok(rooms.length>45 && rooms.some(r=>r.branchEnd&&r.type==='treasure'));
  assert.ok(rooms.every(r=>r.biome===biomeNames[r.stage-1]));
  assert.ok(rooms.every(r=>r.level===Math.min(4,r.stage)));
  assert.ok(rooms.every(r=>Object.entries(r.links).every(([dir,id])=>rooms[id].links[back[dir]]===r.id)));
  assert.deepEqual(makeMap(seed).map(r=>[r.x,r.y,r.type,r.biome,r.level]),rooms.map(r=>[r.x,r.y,r.type,r.biome,r.level]));
  for(const boss of bosses)assert.equal(boss.links.down,spine[boss.y+1]?.id,'boss has the sole route to next biome');
 }
});

test('victory is gated to fourth boss, and map reveals inactive nodes', () => {
  const source=readFileSync('src/game.js','utf8'),html=readFileSync('index.html','utf8');
  assert.match(source,/room\.type==='boss'&&room\.bossStage===4/);
  assert.match(readFileSync('src/map-view.js','utf8'),/known=room\.discovered\|\|room\.visited/);
  assert.match(readFileSync('src/map-view.js','utf8'),/known\?room\.type==='boss'/);
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
 assert.match(source,/\[1,1\.75,1\.75\*1\.75,1\.75\*1\.75\*1\.25\]/);
 assert.match(source,/damageScale:\[1,1\.28,1\.58,1\.85\]/);
 assert.match(readFileSync('src/enemy-ai.js','utf8'),/\[1,\.91,\.82,\.74\]\[\(e\.level\|\|1\)-1\]/);
 assert.match(source,/LV '\+\(e\.level\|\|1\)/);
});

test('each stat attachment occupies its own dedicated weapon slot', () => {
 const source=readFileSync('src/game.js','utf8'),catalog=readFileSync('src/catalog.js','utf8');
 assert.match(catalog,/barrel:\{name:'GÜÇ NAMLU',level:2,slot:0/);
 assert.match(catalog,/loader:\{name:'HIZLI MEKANİZMA',level:4,slot:1/);
 assert.match(catalog,/core:\{name:'FAZ ÇEKİRDEĞİ',level:6,slot:2/);
 assert.match(catalog,/stabilizer:\{name:'DENGELEYİCİ',level:8,slot:3/);
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
 assert.match(source,/Math\.random\(\)<\.6\)dropPickup\(room,'ammo'/);
 assert.match(source,/if\(item\.kind==='gold'\)\{p\.gold\+=/);
 assert.match(source,/function buyShopItem\(id\)/);
 assert.match(source,/p\.gold-=price/);
 assert.match(readFileSync('src/shop-view.js','utf8'),/function shopCanBuy\(id\)/);
 assert.match(html,/id="shopOverlay"/);
 assert.match(html,/id="shopItems"/);
});

test('dropping or replacing a weapon preserves installed attachments', () => {
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/room\.loot\.push\(\{weapon,ammo,reserve,mods:\[\.\.\.mods\]/);
 assert.match(source,/mods:\[\.\.\.\(item\.mods\|\|\[\]\)\]/);
 assert.match(source,/old\.ammo,old\.reserve,old\.mods\|\|\[\]/);
 assert.match(source,/p\.reserve,p\.slots\[p\.activeSlot\]\?\.mods\|\|\[\]/);
});

test('twelve attachment alternatives are grouped three per slot', () => {
 const source=readFileSync('src/catalog.js','utf8'),begin=source.indexOf('const MODS='),end=source.indexOf('const MOD_SLOT_NAMES=',begin);
 assert.ok(begin>=0&&end>begin);
 const mods=new Function(source.slice(begin,end)+'return MODS;')();
 assert.equal(Object.keys(mods).length,12);
 for(let slot=0;slot<4;slot++)assert.equal(Object.values(mods).filter(mod=>mod.slot===slot).length,3);
 assert.ok(Object.values(mods).every(mod=>mod.level===[2,4,6,8][mod.slot]));
 const runtime=readFileSync('src/game.js','utf8');
 assert.match(runtime,/m\.slot===j/);
 assert.match(runtime,/MODS\[next\]\.slot!==j/);
 assert.match(readFileSync('src/shop-data.js','utf8'),/for\(const \[id,mod\] of Object\.entries\(MODS\)\)/);
});
test('shared weapon stat calculations include shotgun damage, magazine, ammo savings and alternatives', () => {
 const source=readFileSync('src/game.js','utf8');
 const root={};new Function('window',readFileSync('src/weapon-stats.js','utf8'))(root);
 const stats=root.DropForgeWeaponStats.createWeaponStats({WEAPON_DAMAGE:[20,11],WEAPON_FIRE_RATES:[.25,.4],WEAPON_PROJECTILES:['kinetic','scatter'],MAG_SIZE:[15,6]});
 const base=stats({weapon:1,mods:[]}),custom=stats({weapon:1,mods:['rapidBarrel','extendedMag','shockCore','lightGrip']});
 assert.equal(base.shotDamage,55);
 assert.equal(custom.damage,12);
 assert.equal(custom.shotDamage,60);
 assert.equal(custom.mag,9);
 assert.equal(custom.baseMag,6);
 assert.equal(custom.ammoSave,0);
 assert.equal(custom.movementBonus,.25);
 assert.ok(custom.fireRate>base.fireRate);
 assert.ok(custom.dps>base.dps);
 const saver=stats({weapon:0,mods:[undefined,'efficientMechanism']});
 assert.equal(saver.ammoSave,.15);
 const piercer=stats({weapon:0,mods:['pierceBarrel',undefined,'core']});
 assert.equal(piercer.pierce,2);
});
test('shot simulation, reload, and live panels reuse the same weaponStats function', () => {
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/stForAmmo=weaponStats\(p\.slots\[p\.activeSlot\]\)/);
 assert.match(source,/shootTimer=stForAmmo\.interval/);
 assert.match(source,/p\.reloadDuration=st\.reload/);
 assert.match(source,/weaponStats\(p\.slots\[p\.activeSlot\]\)\.mag-p\.ammo/);
 assert.match(source,/slot\.ammo=weaponStats\(slot\)\.mag/);
 assert.match(source,/weaponStatHTML\(\{weapon:id,mods\}\)/);
 assert.match(readFileSync('src/loadout-presentation.js','utf8'),/statRow\('TAM İSABET'/);
 assert.match(readFileSync('src/loadout-presentation.js','utf8'),/statRow\('TEORİK DPS'/);
 assert.match(readFileSync('src/loadout-presentation.js','utf8'),/statRow\('ŞARJÖR',st\.baseMag,st\.mag\)/);
});
test('shock chain and burning effects are applied to enemy hits', () => {
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/function applyProjectileModEffects\(room,e,b\)/);
 assert.match(source,/b\.mods\?\.includes\('shockCore'\)/);
 assert.match(source,/b\.mods\?\.includes\('burnCore'\)/);
 assert.match(source,/applyProjectileModEffects\(room,e,bullet\)/);
 assert.match(source,/applyProjectileModEffects\(room,e,b\)/);
 assert.match(readFileSync('src/enemy-ai.js','utf8'),/if\(e\.burnTime>0\)/);
});

test('merchant can sell an alternative for an occupied mod slot', () => {
 const root={};new Function('window',readFileSync('src/shop-view.js','utf8'))(root);
 const player={gold:1000,kits:1,grenades:0,slots:[{weapon:0,mods:[undefined,undefined,'shockCore']}],weapon:0};
 const {shopCanBuy:canBuy}=root.DropForgeShopView.createShopView({getGame:()=>({player,stashedMods:[]}),getLegacy:()=>({marks:0}),getUnlockedWeapons:()=>new Set(),WEAPON_NAMES:[],PERMANENT_ITEMS:{},SHOP_ITEMS:{shockCore:{price:175},burnCore:{price:205}},MODS:{shockCore:{slot:2,level:6},burnCore:{slot:2,level:6}},AMMO_MAX:[240],masteryLevel:()=>9,$:()=>({})});
 assert.equal(canBuy('burnCore'),true);
 assert.equal(canBuy('shockCore'),false);
 player.gold=100;
 assert.equal(canBuy('burnCore'),false);
});
test('shock chains once and burn core applies a timed effect', () => {
 const source=readFileSync('src/game.js','utf8');
 const a=source.indexOf('function applyProjectileModEffects(room,e,b)'),b=source.indexOf('function projectileImpact(',a);
 assert.ok(a>=0&&b>a);
 const hits=[],apply=new Function('burst','hitEnemy',source.slice(a,b)+'return applyProjectileModEffects;')(
 ()=>{},(room,e,damage)=>{hits.push([e,damage]);e.hp-=damage;});
 const e={alive:true,x:100,y:100,w:20,h:20,hp:100},other={alive:true,x:160,y:100,w:20,h:20,hp:100},room={enemies:[e,other]};
 apply(room,e,{mods:['burnCore'],damage:50,hitTargets:new Set([e]),weapon:0});
 assert.equal(e.burnTime,3);
 assert.equal(e.burnDamage,6);
 const shock={mods:['shockCore'],damage:50,hitTargets:new Set([e]),weapon:0};
 apply(room,e,shock);
 assert.equal(hits.length,1);
 assert.equal(hits[0][0],other);
 assert.equal(hits[0][1],18);
 apply(room,e,shock);
 assert.equal(hits.length,1,'a projectile cannot shock the same target twice');
});

test('720p canvas, viewport HUD and grounded props are configured',()=>{
 const html=readFileSync('index.html','utf8'),css=readProjectCss(),js=readFileSync('src/game.js','utf8');
 assert.match(html,/id="game" width="1280" height="720"/);
 assert.match(js,/ctx\.setTransform\(canvas\.width\/W,0,0,canvas\.height\/H,0,0\)/);
 assert.match(css,/max-height:min\(calc\(100dvh - 182px\)/);
 assert.match(css,/object-fit:fill/);
 assert.match(readFileSync('src/world.js','utf8'),/y:FLOOR\}:null;room\.wheel/);
 assert.match(readFileSync('src/world.js','utf8'),/room\.type==='treasure'&&hash2\(room\.x,room\.y,seed\+9823\)%4===0/);
});
test('physical hub boots, target dummy handles practice and E portal starts the expedition',()=>{
 const source=readFileSync('src/game.js','utf8').replace(/\}\)\(\);\s*$/, 'window.__testHub={get game(){return game},get mastery(){return mastery},get mouse(){return mouse},get hubForgeOpen(){return hubForgeOpen},get helpOpen(){return helpOpen},openHubForge,applyHubForge,enterExpedition,openHelp,closeHelp,interact,fire,hitEnemy,update,draw,chosenForgeMods,openShop,closeShop,buyShopItem,useWeaponAbility,get legacy(){return legacy},get shopOpen(){return shopOpen}};})();');
 const nodes=new Map(),frames=[],ctx=new Proxy({},{get:(object,key)=>key==='createRadialGradient'||key==='createLinearGradient'?()=>({addColorStop(){}}):key==='measureText'?()=>({width:24}):()=>{},set:()=>true});
 class Node{
  constructor(id='',tag='DIV'){this.id=id;this.tagName=tag;this.value='';this.style={};this.classList={add(){},remove(){},toggle(){}};this.dataset={};this.children=[];this.firstChild={textContent:''};this.options=[];this.width=id==='game'?1280:1120;this.height=id==='game'?720:630;this.textContent='';}
  getContext(){return ctx}toDataURL(){return 'data:image/png;base64,'}
  append(element){this.children.push(element);if(element.id)nodes.set(element.id,element)}
  after(element){for(const child of element.children||[])if(child.id)nodes.set(child.id,child)}
  closest(){return new Node('label','LABEL')}querySelector(){return new Node()}addEventListener(){}setAttribute(){}
  focus(){}getBoundingClientRect(){return {left:0,top:0,width:1280,height:720}}insertAdjacentHTML(){}
 }
 Object.defineProperty(Node.prototype,'innerHTML',{get(){return this._html||''},set(html){this._html=html;if(this.tagName==='SELECT'){this.options=[...String(html).matchAll(/<option\b([^>]*)>/g)].map(m=>({value:(m[1].match(/value="([^"]*)"/)||[])[1]||'',disabled:/disabled/.test(m[1])}));this.value=this.options.find(item=>!item.disabled)?.value||'';}}});
 const grid=new Node('grid'),workbenchNodes=new Map();
 const doc={getElementById(id){if(!nodes.has(id)){nodes.set(id,new Node(id,/^forge(Gun|Mod|EditorSelect)[12](_[234])?$/.test(id)||id==='difficulty'?'SELECT':'DIV'));}return nodes.get(id)},querySelector(query){return query==='#forgePanel .forgeGrid'?grid:/^\[data-weapon-card="[12]"\]$/.test(query)?new Node('card'):null},querySelectorAll(query){if(!workbenchNodes.has(query))workbenchNodes.set(query,query==='.forgeAttachSlot'?Array.from({length:8},(_,i)=>{const node=new Node('attach'+i);node.dataset={gun:String(Math.floor(i/4)+1),slot:String(i%4)};return node;}):query==='[data-close-editor]'?[1,2].map(i=>{const node=new Node('close'+i);node.dataset.closeEditor=String(i);return node;}):query==='[data-focus-gun]'?[1,2].map(i=>{const node=new Node('focus'+i);node.dataset.focusGun=String(i);return node;}):query==='.forgeEditorChoices'?[1,2].map(i=>doc.getElementById('forgeEditorChoices'+i)):[]);return workbenchNodes.get(query)},createElement(tag){return new Node('',tag.toUpperCase())}};
 const storeWrites={},win={addEventListener(){},AudioContext:class{}},storage={getItem(){return null},setItem(key,value){storeWrites[key]=value}};
 new Function('document','window','localStorage','requestAnimationFrame','performance','HTMLCanvasElement',['src/catalog.js','src/progression.js','src/abilities-data.js','src/shop-data.js','src/mod-presentation.js','src/world.js','src/weapon-stats.js','src/enemy-ai.js','src/shop-view.js','src/map-view.js','src/biome-view.js','src/loadout-presentation.js','src/scene-props.js','src/loot-view.js'].map(path=>readFileSync(path,'utf8')).join('\n')+'\n'+source)(doc,win,storage,fn=>frames.push(fn),{now:()=>0},Node);
 const api=win.__testHub,game=api.game,room=game.rooms[0],player=game.player;
 assert.equal(game.inHub,true);assert.equal(game.roomId,0);
 assert.ok(room.dummy&&room.forge&&room.hubGate);assert.equal(room.merchant.permanent,true);
 assert.match(nodes.get('statusMessage').textContent,/HAZIRLIK/);
 api.legacy.marks=10;player.x=room.merchant.x-player.w/2;player.y=548-player.h;api.update(.016);
 assert.equal(room.interact.nearMerchant,true,'permanent hub merchant is reachable');api.interact();assert.equal(api.shopOpen,true);
 assert.equal(api.buyShopItem('hp'),true);assert.equal(api.legacy.hp,1);assert.equal(player.maxHp,110);
 assert.equal(api.buyShopItem('kits'),true);assert.equal(api.legacy.kits,1);assert.equal(player.kits,2);
 assert.match(storeWrites['dropForge.permanentForge.v1'],/"hp":1/,'permanent upgrades are saved to localStorage');api.closeShop();
 assert.ok(nodes.get('forgeGun1').options.length>=2);
 assert.doesNotThrow(()=>api.draw());
 api.openHelp();assert.equal(api.helpOpen,true);api.closeHelp();assert.equal(api.helpOpen,false);
 const initialXP=api.mastery[player.weapon]||0;
 player.x=room.dummy.x-110;player.y=548-player.h;api.mouse.x=room.dummy.x+25;api.mouse.y=room.dummy.y+30;api.fire();
 for(let i=0;i<20;i++)api.update(.016);
 assert.ok(room.dummy.total>0,'training dummy registers actual bullet damage');
 assert.equal(api.mastery[player.weapon]||0,initialXP,'training ammunition cannot farm persistent mastery');
 api.mastery[player.weapon]=90;player.x=room.forge.x-20;player.y=548-player.h;api.update(.016);
 assert.equal(room.interact.nearForge,true,'forge becomes interactive when approached');
 api.interact();assert.equal(api.hubForgeOpen,true,'E opens physical forge');
 const firstSocket=workbenchNodes.get('.forgeAttachSlot')[0];firstSocket.onclick();
 assert.equal(nodes.get('forgeEditor1').classList!==undefined,true);
 assert.match(nodes.get('forgeEditorChoices1').innerHTML,/data-mod-choice="barrel"/,'three mod cards appear in the chosen socket');
 assert.match(nodes.get('forgeEditorChoices1').innerHTML,/HASAR/,'the choice card shows the real before/after stat');
 nodes.get('forgeEditorChoices1').onclick({target:{closest(){return {dataset:{modChoice:'barrel',modGun:'1'}}}}});
 assert.equal(api.chosenForgeMods(1)[0],'barrel','clicking a mod card equips its category mod');
 nodes.get('startBtn').onclick();assert.equal(api.hubForgeOpen,false,'save button returns to testing');
 assert.equal(player.slots[0].mods[0],'barrel','hub saves the selected attachment into the real weapon');
 assert.equal(game.inHub,true);
 player.x=room.hubGate.x-40;player.y=548-player.h;api.update(.016);
 assert.equal(room.interact.nearHubGate,true,'portal becomes interactive when approached');
 api.interact();
 assert.equal(game.inHub,false);assert.equal(game.roomId,1);assert.equal(player.kits,2,'starter kit upgrade survives portal transition');
 assert.ok(room.doors.down,'normal return door restored after leaving training hub');
 const target=game.rooms[1].enemies[0];api.hitEnemy(game.rooms[1],target,9,'bullet',player.weapon);
 assert.ok(target.stagger>0&&Math.abs(target.knockVx)>0,'enemy hit feedback includes controlled recoil');
 const combat=game.rooms[1],gold={kind:'gold',artifact:25,x:500,y:548-14,grounded:true,vx:0,vy:0,taken:false};combat.loot.push(gold);
 player.x=120;player.y=548-player.h;api.update(.016);assert.equal(gold.x,500,'coins must stay where they land; no magnet');
 const wallet=player.gold;player.x=gold.x-player.w/2;player.y=548-player.h;api.update(.016);assert.equal(player.gold,wallet+25,'touching the coin collects it');assert.equal(gold.taken,true);
 player.abilityCooldowns=Array(13).fill(0);player.x=570;player.y=548-player.h;api.mouse.x=700;api.mouse.y=410;
 for(let id=0;id<13;id++){player.weapon=id;player.activeSlot=0;player.slots[0]={weapon:id,mods:[],ammo:40,reserve:100};game.bullets=[];assert.equal(api.useWeaponAbility(),true,'special ability for gun '+id+' activates');assert.ok(player.abilityCooldowns[id]>0,'special ability '+id+' enters its own cooldown');assert.equal(api.useWeaponAbility(),false,'ability cannot fire again before cooldown');}
 combat.cleared=true;combat.merchant={x:player.x+player.w/2,y:548};player.gold=200;api.openShop();assert.equal(api.shopOpen,true);assert.equal(api.buyShopItem('kit'),true);assert.equal(player.gold,145,'run merchant charges run gold');assert.equal(api.buyShopItem('xp'),false,'permanent mastery XP is unavailable in run merchant');api.closeShop();
 assert.doesNotThrow(()=>api.draw());
});

test('forced boss ammunition and health never reroll into grenades',()=>{
 const source=readFileSync('src/game.js','utf8');
 const a=source.indexOf('function dropPickup(room,kind,x,y,force=false,artifact=null)'),b=source.indexOf('function saveSlot()',a);
 assert.ok(a>=0&&b>a);
 const drop=new Function('Math','burst','WEAPON_PROJECTILES','game',source.slice(a,b)+'return dropPickup;')({random:()=>.01},()=>{},['kinetic'],{player:{weapon:0,slots:[]}});
 const room={loot:[]};
 drop(room,'ammo',100,100,true);
 drop(room,'health',110,100,true);
 assert.deepEqual(room.loot.map(item=>item.kind),['ammo','health']);
 drop(room,'ammo',120,100,false);
 assert.equal(room.loot[2].kind,'grenade','only ordinary, non-guaranteed pickups can reroll');
});

test('icon quick bar renders real weapon sprites, item art and readable counts',()=>{
 const html=readFileSync('index.html','utf8'),css=readProjectCss(),source=readFileSync('src/game.js','utf8');
 assert.match(html,/<nav class="inventory" aria-label="Hızlı envanter">/);
 for(let i=1;i<=5;i++)assert.match(html,new RegExp('id="slot'+i+'" class="invSlot'));
 assert.match(css,/\.inventorySlots\{display:flex/);
 assert.match(css,/\.inventory \.invSlot\.selected\{/);
 assert.match(css,/calc\(\(100dvh - 207px\)\*16\/9\)/);
 const start=source.indexOf('const HUD_SPRITE_URLS='),end=source.indexOf('function masteryProgress(',start);
 assert.ok(start>=0&&end>start);
 const elements=Array.from({length:5},()=>({dataset:{},innerHTML:'',className:'',ariaLabel:'',ariaPressed:'',title:''}));
 const render=new Function('$','WEAPON_SPRITES',source.slice(start,end)+'return renderQuickSlot;')(
 id=>elements[Number(id.slice(-1))-1],[{toDataURL:()=> 'data:image/png;base64,weapon0'},{toDataURL:()=> 'data:image/png;base64,weapon1'}]);
 render(1,{weapon:0,name:'KIVILCIM-15',sub:'15 / 120 MERMİ',selected:true});
 assert.match(elements[0].innerHTML,/weapon0/);
 assert.match(elements[0].innerHTML,/15 \/ 120 MERMİ/);
 assert.match(elements[0].className,/selected/);
 render(3,{name:'SAĞLIK KİTİ',sub:'Kullanıma hazır',icon:'kit',count:'2\/5'});
 assert.match(elements[2].innerHTML,/<svg class="itemIcon"/);
 assert.match(elements[2].innerHTML,/2\/5/);
 render(5,{name:'ÖZEL EŞYA',sub:'Boş',icon:'empty',empty:true});
 assert.match(elements[4].className,/empty/);
 assert.match(elements[4].ariaLabel,/ÖZEL EŞYA/);
 assert.match(source,/function setupHub\(\)/);
 assert.match(source,/function enterExpedition\(\)/);
});

test('weapon families give the same attachment different real combat effects',()=>{
 const root={};new Function('window',readFileSync('src/weapon-stats.js','utf8'))(root);
 const types=['kinetic','kinetic','scatter','plasma','pierce','kinetic','plasma','scatter','pierce','plasma','laser','explosive','arc'];
 const stats=root.DropForgeWeaponStats.createWeaponStats({WEAPON_DAMAGE:types.map(()=>25),WEAPON_FIRE_RATES:types.map(()=>.2),WEAPON_PROJECTILES:types,MAG_SIZE:types.map(()=>12)});
 const kinetic=stats({weapon:0,mods:['pierceBarrel']});
 const scatter=stats({weapon:2,mods:['pierceBarrel']});
 const explosive=stats({weapon:11,mods:['pierceBarrel']});
 assert.equal(kinetic.pierce,1,'kinetic receives real extra penetration');
 assert.equal(scatter.pierce,0,'shotgun receives tightening instead of piercing');
 assert.equal(scatter.spread,.75);
 assert.equal(explosive.pierce,0,'explosive receives blast radius instead of piercing');
 assert.equal(explosive.areaBonus,1.2);
 assert.equal(stats({weapon:12,mods:[undefined,undefined,'core']}).areaBonus,1.25);
 assert.equal(stats({weapon:12,mods:[undefined,undefined,'core']}).pierce,0);
 assert.equal(stats({weapon:0,mods:[undefined,undefined,'core']}).pierce,1);
 assert.equal(stats({weapon:2,mods:[undefined,undefined,undefined,'stabilizer']}).spread,.58);
 const grip=stats({weapon:0,mods:[undefined,undefined,undefined,'heavyGrip']});
 assert.equal(grip.spread,1,'heavy grip no longer copies stabilizer');
 assert.equal(grip.recoil,.65);assert.equal(grip.staggerBonus,1.5);
});
test('each shot can trigger at most one shock chain across shotgun pellets',()=>{
 const source=readFileSync('src/game.js','utf8'),start=source.indexOf('function applyProjectileModEffects(room,e,b)'),end=source.indexOf('function projectileImpact(',start);
 const hits=[],apply=new Function('burst','hitEnemy',source.slice(start,end)+'return applyProjectileModEffects;')(
 ()=>{},(room,target,damage)=>hits.push({target,damage}));
 const e={alive:true,x:100,y:100,w:20,h:20},other={alive:true,x:145,y:100,w:20,h:20},room={enemies:[e,other]},shotEffects={shockRemaining:1};
 for(let pellet=0;pellet<5;pellet++)apply(room,e,{mods:['shockCore'],weapon:2,damage:50,hitTargets:new Set([e]),shotEffects});
 assert.equal(hits.length,1);
 assert.equal(hits[0].damage,18);
 assert.equal(shotEffects.shockRemaining,0);
});
test('attachment cards display class-specific names, precise deltas and are available in the TAB inventory',()=>{
 const html=readFileSync('index.html','utf8'),css=readProjectCss(),source=readFileSync('src/game.js','utf8');
 for(let i=1;i<=2;i++)assert.match(html,new RegExp('id="forgeEditorChoices'+i+'"'));
 assert.match(css,/\.forgeModChoice\.chosen/);
 assert.match(source,/window\.DropForgeModPresentation/);
 assert.match(source,/function modDiffHTML\(id,currentMods,mod,slot\)/);
 assert.match(source,/data-mod-choice=/);
 assert.match(source,/modEffectForWeapon\(w\.weapon,current\)/);
 const presentation=readFileSync('src/mod-presentation.js','utf8');
 const root={DropForgeCatalog:{WEAPON_PROJECTILES:['kinetic','scatter','explosive','arc'],MODS:{pierceBarrel:{name:'DELİCİ NAMLU'},core:{name:'FAZ ÇEKİRDEĞİ'}},WEAPON_TYPES:['TABANCA','POMPALI','PATLAYICI','ARK']}};
 new Function('window',presentation)(root);
 const naming=root.DropForgeModPresentation;
 assert.equal(naming.modNameForWeapon(0,'pierceBarrel'),'DELİCİ NAMLU');
 assert.equal(naming.modNameForWeapon(1,'pierceBarrel'),'DARALTICI NAMLU');
 assert.equal(naming.modNameForWeapon(2,'pierceBarrel'),'GENİŞ ETKİ NAMLU');
 assert.match(naming.modEffectForWeapon(2,'core'),/alanını %25/);
});

test('every weapon has a distinct right-click ability with an independent cooldown',()=>{
 const source=readFileSync('src/game.js','utf8'),catalog=readFileSync('src/abilities-data.js','utf8');
 const root={};new Function('window',catalog)(root);
 const abilities=root.DropForgeAbilities;
 assert.match(source,/const WEAPON_ABILITIES=window\.DropForgeAbilities/);
 assert.equal(abilities.length,13);
 assert.equal(new Set(abilities.map(ability=>ability.name)).size,13);
 assert.ok(abilities.every(ability=>ability.cooldown>=8&&ability.cooldown<=15));
 assert.match(source,/canvas\.addEventListener\('mousedown',e=>\{if\(e\.button===0\)/);
 assert.match(source,/else if\(e\.button===2\)\{e\.preventDefault\(\);canvas\.focus\(\);useWeaponAbility\(\)/);
 assert.match(source,/p\.abilityCooldowns\[id\]=spec\.cooldown/);
 assert.match(source,/p\.abilityCooldowns=Array\(13\)\.fill\(0\);p\.abilityBuff=null;game\.inHub=false/);
 assert.match(source,/bullet\.weapon===8&&e\.markTime>0\?1\.35:1/);
});
test('preparation announcements are under the arena and gold requires player contact',()=>{
 const source=readFileSync('src/game.js','utf8'),html=readFileSync('index.html','utf8'),css=readProjectCss();
 const canvasEnd=html.indexOf('</main>'),status=html.indexOf('id="statusStrip"'),inventory=html.indexOf('class="inventory"');
 assert.ok(canvasEnd>=0&&status>canvasEnd&&inventory>status);
 assert.match(css,/#statusStrip\{display:flex/);
 assert.match(source,/function drawGameHud\(\)\{const room=currentRoom\(\);if\(game\.inHub\)return/);
 assert.match(source,/\$\('banner'\)\.classList\.add\('hidden'\)/);
 assert.match(source,/Gold remains physical: no magnet or remote collection/);
 assert.match(source,/item\.kind==='gold'\?Math\.abs\(p\.x\+p\.w\/2-item\.x\)<20/);
 assert.match(source,/dropPickup\(room,'gold',e\.x\+e\.w\/2/);
});
test('legacy merchant and run merchant spend different wallets and persist upgrades',()=>{
 const source=readFileSync('src/game.js','utf8'),html=readFileSync('index.html','utf8');
 assert.match(readFileSync('src/progression.js','utf8'),/LEGACY_KEY='dropForge\.permanentForge\.v1'/);
 assert.match(source,/function earnLegacy\(amount\)/);
 assert.match(source,/game\.player\.kills%5===0\)earnLegacy\(1\)/);
 assert.match(source,/e\.type==='boss'\)earnLegacy\(3\)/);
 assert.match(source,/room\.merchant=\{x:857,y:FLOOR,permanent:true\}/);
 assert.match(readFileSync('src/shop-view.js','utf8'),/const permanent=!!game\.rooms\?\.\[game\.roomId\]\?\.merchant\?\.permanent,items=permanent\?PERMANENT_ITEMS:SHOP_ITEMS/);
 assert.match(source,/p\.gold-=price/);
 assert.match(source,/legacy\.marks-=price;saveLegacy\(\)/);
 assert.match(source,/grantMastery\(p\.weapon,90,true\)/);
 assert.match(html,/id="shopTitle"/);
 assert.match(html,/id="shopDescription"/);
});

test('refactor loads catalog before runtime and keeps the same weapon/mod inventory',()=>{
 const html=readFileSync('index.html','utf8'),catalog=readFileSync('src/catalog.js','utf8'),runtime=readFileSync('src/game.js','utf8');
 const order=['styles/game.css','styles/quickbar.css','styles/workbench.css','src/catalog.js','src/progression.js','src/abilities-data.js','src/shop-data.js','src/mod-presentation.js','src/world.js','src/weapon-stats.js','src/enemy-ai.js','src/shop-view.js','src/map-view.js','src/biome-view.js','src/loadout-presentation.js','src/scene-props.js','src/loot-view.js','src/game.js'].map(asset=>html.indexOf('./'+asset));
 assert.ok(order.every(position=>position>=0));
 assert.ok(order.every((position,i)=>i===0||position>order[i-1]),'styles and scripts must load in dependency/cascade order');
 assert.match(runtime,/\}=window\.DropForgeCatalog/);
 const root={};new Function('window',catalog)(root);
 const data=root.DropForgeCatalog;
 assert.equal(Object.keys(data.MODs||data.MODS).length,12);
 assert.equal(data.WEAPON_PROJECTILES.length,13);
 assert.equal(data.WEAPON_TYPES.length,13);
 assert.equal(data.WEAPON_FIRE_RATES.length,13);
 assert.equal(data.WEAPON_DAMAGE.length,13);
 assert.equal(Object.keys(data.PROJECTILE_FAMILIES).length,7);
 assert.equal(Object.isFrozen(data),true);
});
test('split stylesheets have clear non-overlapping responsibilities',()=>{
 const base=readFileSync('styles/game.css','utf8'),quickbar=readFileSync('styles/quickbar.css','utf8'),workbench=readFileSync('styles/workbench.css','utf8');
 assert.ok(base.length>5000&&quickbar.length>2000&&workbench.length>4000);
 assert.match(base,/\.forgePanel/);
 assert.doesNotThrow(()=>{if(base.includes('/* Compact, illustrated quick bar:'))throw Error('quickbar still embedded in base')});
 assert.match(quickbar,/\.inventorySlots\{display:flex/);
 assert.match(workbench,/\.forgeAttachGrid\{display:grid/);
 assert.match(workbench,/#statusStrip\{display:flex/);
});


test('fourth region uses level four enemies with a separate shield pool', () => {
 const world=readFileSync('src/world.js','utf8'),game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(world,/room\.level=Math\.min\(4,room\.stage\)/);
 assert.match(game,/shield:\(room\.level===4\?Math\.round\(hp\*\.5\):0\)/);
 assert.match(game,/const shieldAbsorbed=Math\.min\(e\.shield\|\|0,amount\)/);
 assert.match(game,/e\.shield-=shieldAbsorbed/);
 assert.match(game,/const segments=e\.type==='boss'\?1:Math\.min\(3,e\.level\|\|1\)/);
 assert.match(game,/if\(e\.maxShield>0\)/);
 assert.match(ai,/e\.shield=\(e\.shield\|\|0\)-absorbed/);
});


test('first boss requires three reachable, guaranteed region-one keys', () => {
 const world=readFileSync('src/world.js','utf8'),game=readFileSync('src/game.js','utf8');
 assert.match(world,/filter\(room=>room\.branchEnd&&room\.stage===1\)/);
 assert.match(world,/slice\(0,3\)/);
 assert.match(world,/room\.bossKey=true/);
 assert.match(game,/function collectBossKey\(room\)/);
 assert.match(game,/room\.bossKeyCollected=true;game\.bossKeys\+\+/);
 assert.match(game,/room\.cleared=true;collectBossKey\(room\)/);
 assert.match(game,/game\.rooms\[id\]\.bossStage===1&&game\.bossKeys<3/);
});


test('tank charge telegraphs, hits once, and knocks the player back', () => {
 const ai=readFileSync('src/enemy-ai.js','utf8'),game=readFileSync('src/game.js','utf8');
 assert.match(ai,/e\.chargeWindup=\.62/);
 assert.match(ai,/e\.chargeDir\*650/);
 assert.match(ai,/!e\.chargeHit&&collideRect\(p,e\)/);
 assert.match(ai,/damagePlayer\(Math\.round\(35\*/);
 assert.match(ai,/p\.vx=e\.chargeDir\*530;p\.vy=-350/);
 assert.match(ai,/e\.chargeCooldown=3\.1/);
 assert.match(game,/chargeWindup:0,chargeTime:0/);
 assert.match(game,/e\.chargeWindup>0/);
});


test('blue flying enemies pursue and evade faster without removing attack windup', () => {
 const ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(ai,/e\.dodgeDir\*570:clamp\(dx\*1\.75,-245,245\)/);
 assert.match(ai,/e\.vy=-e\.dodgeDir\*440/);
 assert.match(ai,/Math\.sin\(e\.phase\*4\.2\)\*38\+clamp\(p\.y-115-e\.y,-115,115\)/);
 assert.match(ai,/e\.type==='blue'\?1\.45:2\.35/);
 assert.match(ai,/e\.type==='blue'\?\.42:\.36/);
});


test('purple mage projectiles explode with area damage and a visible blast', () => {
 const ai=readFileSync('src/enemy-ai.js','utf8'),game=readFileSync('src/game.js','utf8');
 assert.match(ai,/explosive:e\.type==='purple',blastRadius:e\.type==='purple'\?76:0/);
 assert.match(game,/function explodeMageBullet\(b\)/);
 assert.match(game,/room\.mageBlasts\.push\(/);
 assert.match(game,/if\(b\.explosive\)\{if\(out\|\|b\.life<=0\|\|nearGenerator\|\|nearPlayer\)/);
 assert.match(game,/Math\.hypot\(cx-b\.x,cy-b\.y\)<radius/);
 assert.match(game,/p\.dash<=0/);
 assert.match(game,/hitGenerator\(room,Math\.round\(b\.damage\*1\.4\)\)/);
});


test('enemy, chest and room rewards include diverse guaranteed and bonus loot', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/const bonus=hash2\(room\.x,room\.y,game\.seed\+9187\)%5/);
 assert.match(game,/bonus===0\)dropPickup\(room,'grenade'/);
 assert.match(game,/bonus===2&&room\.branchEnd\)dropPickup\(room,'artifact'/);
 assert.match(game,/if\(e\.type==='boss'\)\{dropPickup\(room,'artifact'/);
 assert.match(game,/if\(room\.type==='treasure'\)\{const accessory=/);
 assert.match(game,/if\(accessory\.length\)dropPickup\(room,'artifact'/);
 assert.match(game,/if\(rand\(\)<\.65\)dropPickup\(room,'grenade'/);
 assert.match(game,/if\(room\.type==='elite'\|\|room\.type==='hunt'\)dropPickup\(room,'gold'/);
});


test('first acquisition highlights new weapons mods and accessories once per run', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/seenLoot:new Set\(\),newLootGlow:0/);
 assert.match(game,/function highlightFirstLoot\(kind,id,name\)/);
 assert.match(game,/if\(game\.seenLoot\.has\(key\)\)return/);
 assert.match(game,/game\.seenLoot\.add\(key\);game\.newLootGlow=1\.8/);
 assert.match(game,/highlightFirstLoot\('mod',item\.artifact/);
 assert.match(game,/highlightFirstLoot\('artifact',item\.artifact/);
 assert.match(game,/highlightFirstLoot\('weapon',p\.weapon/);
 assert.match(game,/if\(game\.newLootGlow>0\)\{/);
});


test('enemy health scales by 75%, 75%, then 25% and level four adds shields', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/\[1,1\.75,1\.75\*1\.75,1\.75\*1\.75\*1\.25\]/);
 assert.match(game,/shield:\(room\.level===4\?Math\.round\(hp\*\.5\):0\)/);
 assert.match(game,/maxShield:\(room\.level===4\?Math\.round\(hp\*\.5\):0\)/);
 assert.match(game,/if\(boss\.maxShield>0\)boss\.shield=boss\.maxShield=Math\.round\(boss\.maxHp\*\.5\)/);
 assert.match(game,/if\(target\.maxShield>0\)target\.shield=target\.maxShield=Math\.round\(target\.maxHp\*\.5\)/);
});


test('portal shield triggers once at half health and overdrive speeds spawning after pause', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/shield:0,shieldTriggered:false,overdrive:false/);
 assert.match(game,/q\.hp>0&&q\.hp<=q\.maxHp\*\.5&&!q\.shieldTriggered/);
 assert.match(game,/q\.shield=2\.7;q\.overdrive=true;q\.time=Math\.max\(q\.time,q\.shield\)/);
 assert.match(game,/if\(portal\.shield>0\)continue;portal\.time=Math\.max\(0,portal\.time-dt\)/);
 assert.match(game,/portal\.spawnDuration=game\.settings\.spawnDelay\*\(portal\.overdrive\?\.6:1\)/);
 assert.doesNotMatch(game,/q\.burstHits>=4/);
});


test('room threat escalates every 30 seconds with capped movement and attack buffs', () => {
 const game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(game,/room\.threatTime=0;room\.threatLevel=0/);
 assert.match(game,/Math\.min\(3,Math\.floor\(room\.threatTime\/30\)\)/);
 assert.match(game,/TEHDİT SEVİYESİ/);
 assert.match(game,/TEHDİT '\+\(room\.threatLevel\|\|0\)\+'\/3/);
 assert.match(ai,/moveBoost=1\+threat\*\.12,attackBoost=1\+threat\*\.10/);
 assert.match(ai,/e\.fire=.*\/attackBoost/);
 assert.match(ai,/1\+threat\*\.08/);
});


test('each combat room starts with one healer without healer-to-healer loops', () => {
 const game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(game,/if\(room\.type==='treasure'\|\|room\.type==='gold'\)\{room\.cleared=true/);
 assert.match(game,/if\(!room\.enemies\.some\(e=>e\.type==='healer'\)\)spawnEnemy\(room,'healer'/);
 assert.match(game,/room\.enemyCap=Math\.max\(room\.enemyCap,room\.enemies\.length\)/);
 assert.match(game,/if\(room\.type==='hunt'\)\{const target=room\.enemies\[0\]/);
 assert.match(game,/portal\.type==='healer'&&room\.enemies\.some\(e=>e\.alive&&e\.type==='healer'\)/);
 assert.match(ai,/a\.alive&&a!==e&&a\.type!=='healer'&&a\.hp<a\.maxHp/);
});


test('forge supports per-weapon persistent builds and recommended loadouts', () => {
 const game=readFileSync('src/game.js','utf8'),progress=readFileSync('src/progression.js','utf8'),html=readFileSync('index.html','utf8');
 assert.match(progress,/dropForge\.weaponBuilds\.v1/);
 assert.match(progress,/savedBuilds,saveBuilds/);
 assert.match(game,/function setForgeBuild\(n,mods\)/);
 assert.match(game,/function restoreForgeBuild\(n\)/);
 assert.match(game,/function recommendedForgeBuild\(weapon\)/);
 assert.match(game,/savedBuilds\[weapon\]=chosenForgeMods\(n\)/);
 assert.match(game,/MODS\[mod\]\?\.slot===j&&MODS\[mod\]\.level<=masteryLevel\(weapon\)/);
 assert.equal((html.match(/data-build-action="save"/g)||[]).length,2);
 assert.equal((html.match(/data-build-action="load"/g)||[]).length,2);
 assert.equal((html.match(/data-build-action="recommend"/g)||[]).length,2);
});


test('wheel displays a timed animated 2D reward screen', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/w\.spinTime=2\.4;w\.spinDuration=2\.4;w\.spinAngle=0/);
 assert.match(game,/w\.spinAngle\+=\(15\*\(1-progress\)\*\*2\+1\.2\)\*dt/);
 assert.match(game,/function drawWheelScreen\(w\)/);
 assert.match(game,/ctx\.arc\(0,0,r,a,b\)/);
 assert.match(game,/drawGameHud\(\);drawNearbyMinimap\(room\);drawWheelScreen\(room\.wheel\)/);
 assert.match(game,/w\.resultLabel=announcementText;w\.resultTime=1\.8/);
});


test('chests offer varied useful fallback when mods or accessories are exhausted', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/!game\.stashedMods\.includes\(k\)/);
 assert.match(game,/eligible\.length&&game\.stashedMods\.length<12&&reward<\.55/);
 assert.match(game,/dropPickup\(room,'health',room\.chest\.x/);
 assert.match(game,/dropPickup\(room,'grenade',room\.chest\.x/);
 assert.match(game,/p\.slots\.some\(q=>q&&q\.reserve<AMMO_MAX\[q\.weapon\]\)/);
 assert.match(game,/p\.gold\+=bonus;for\(const slot of p\.slots\)if\(slot\)grantMastery\(slot\.weapon,25\)/);
 assert.match(game,/accessory\.length\)dropPickup\(room,'artifact'/);
});


test('melee blade and arc animate through combo swings with hit flash', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/duration:combo===3\?\.34:\.26,combo,range,hits:0/);
 assert.match(game,/if\(game\.slash\)game\.slash\.hits=hits/);
 assert.match(game,/head=-spread\+ease\*spread\*2/);
 assert.match(game,/tail=Math\.max\(-spread,head-/);
 assert.match(game,/if\(s\.hits\)\{ctx\.globalAlpha=fade\*\.7/);
 assert.match(game,/swing=active\?\(-\.95\+progress\*1\.9\)/);
});


test('merchant currency follows merchant type and permanent cores reward room milestones', () => {
 const game=readFileSync('src/game.js','utf8'),shop=readFileSync('src/shop-view.js','utf8');
 assert.match(game,/const p=game\.player,permanent=!!currentRoom\(\)\.merchant\?\.permanent/);
 assert.match(shop,/game\.rooms\?\.\[game\.roomId\]\?\.merchant\?\.permanent/);
 assert.match(game,/if\(room\.type==='treasure'\)\{earnLegacy\(1\);collectBossKey\(room\)/);
 assert.match(game,/if\(room\.type==='elite'\|\|room\.type==='hunt'\)earnLegacy\(1\)/);
 assert.match(game,/game\.earnedCores=\(game\.earnedCores\|\|0\)\+earned/);
 assert.match(shop,/BU SEFERLİK · Aldıkların sefer bitince sıfırlanır/);
 assert.match(shop,/ÇEKİRDEK/);
});


test('wheel screen stays hidden until E starts the wheel and closes after result', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/if\(!w\|\|!\(w\.spinTime>0\|\|w\.resultTime>0\)\)return/);
 assert.match(game,/if\(near\?\.nearWheel\)\{spinWheel\(room\);return;\}/);
 assert.match(game,/w\.spinTime=2\.4;w\.spinDuration=2\.4/);
 assert.match(game,/room\.wheel\.resultTime=Math\.max\(0,room\.wheel\.resultTime-dt\)/);
});


test('nearby minimap appears outside combat and only shows adjacent rooms', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/function drawNearbyMinimap\(room\)/);
 assert.match(game,/room\.arenaStarted&&!room\.cleared/);
 assert.match(game,/room\.enemies\.some\(e=>e\.alive\)/);
 assert.match(game,/Object\.values\(room\.links\)\.map\(id=>game\.rooms\[id\]\)/);
 assert.match(game,/drawGameHud\(\);drawNearbyMinimap\(room\);drawWheelScreen\(room\.wheel\)/);
});


test('collected boss keys follow the player outside combat and first boss gate shows key count', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/bossKeys:0,keyFollowers:\[\]/);
 assert.match(game,/game\.keyFollowers\.push\(\{x:game\.player\.x/);
 assert.match(game,/if\(!game\.inHub&&room\.cleared\)for\(let i=0;i<game\.keyFollowers\.length;i\+\+\)/);
 assert.match(game,/function drawFollowingKeys\(room\)/);
 assert.match(game,/drawFollowingKeys\(room\);drawPlayer\(game\.player\)/);
 assert.match(game,/needsKeys=target\.type==='boss'&&target\.bossStage===1/);
 assert.match(game,/ctx\.fillText\('⚿ '\+game\.bossKeys\+'\/'\+required/);
});


test('summoner enemy types spawn bounded blockers and temporary portals', () => {
 const game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(game,/type==='warlock'\?115:type==='riftcaller'\?90:type==='brute'\?225/);
 assert.match(game,/r\(\)<\.3,type=special\?\(r\(\)<\.5\?'warlock':'riftcaller'\)/);
 assert.match(ai,/if\(e\.type==='warlock'\)/);
 assert.match(ai,/active<2&&room\.enemies\.length/);
 assert.match(ai,/spawnEnemy\(room,'brute'/);
 assert.match(ai,/if\(e\.type==='riftcaller'\)/);
 assert.match(ai,/spawnLimit:3,owner:e/);
 assert.match(game,/portal\.spawnLimit&&portal\.produced>=portal\.spawnLimit/);
});


test('merchant cards prioritize short effects and actionable prices', () => {
 const shop=readFileSync('src/shop-view.js','utf8');
 assert.match(shop,/KALICI · Aldıkların tüm seferlerde geçerli/);
 assert.match(shop,/BU SEFERLİK · Aldıkların sefer bitince sıfırlanır/);
 assert.match(shop,/class="shopIcon"/);
 assert.match(shop,/class="shopEffect"/);
 assert.match(shop,/class="shopBuy"/);
 assert.match(shop,/YETERSİZ /);
 assert.match(shop,/title=/);
});


test('weapon mastery levels 1 through 10 improve damage fire rate and reload', () => {
 const source=readFileSync('src/weapon-stats.js','utf8');
 const context={window:{}};vm.runInNewContext(source,context);
 let level=1;const stats=context.window.DropForgeWeaponStats.createWeaponStats({WEAPON_DAMAGE:[40],WEAPON_FIRE_RATES:[.3],WEAPON_PROJECTILES:['kinetic'],MAG_SIZE:[20],getMasteryLevel:()=>level});
 const first=stats({weapon:0,mods:[]});level=5;const middle=stats({weapon:0,mods:[]});level=10;const last=stats({weapon:0,mods:[]});
 assert.ok(first.damage<middle.damage&&middle.damage<last.damage);
 assert.ok(first.fireRate<middle.fireRate&&middle.fireRate<last.fireRate);
 assert.ok(first.reload>middle.reload&&middle.reload>last.reload);
 assert.equal(first.masteryLevel,1);assert.equal(last.masteryLevel,10);
});


test('weapon sprites use distinct family silhouettes and individual signature marks', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/function makeForgeSprite\(i\)/);
 assert.match(game,/heavy=kind===2\|\|kind===5,precision=kind===3,energy=kind>=4/);
 assert.match(game,/if\(kind===0\)/);assert.match(game,/if\(kind===3\)/);assert.match(game,/if\(kind===6\)/);
 assert.match(game,/const marks=\[9,15,21,27,33,39,13,19,25,31,37,43,49\]/);
});


test('hub test lab configures weapon enemy level and count without progression rewards', () => {
 const html=readFileSync('index.html','utf8'),game=readFileSync('src/game.js','utf8');
 for(const id of ['testLabBtn','testLabOverlay','testLabWeapon','testLabEnemy','testLabLevel','testLabCount','startTestLab','stopTestLab'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(game,/function startCombatTest\(\)/);assert.match(game,/function stopCombatTest\(\)/);
 assert.match(game,/game\.testMode=true/);assert.match(game,/if\(game\.testMode\)\{burst\(room/);
 assert.match(game,/if\(game\.testMode\)\{p\.hp=/);
 assert.match(game,/room\.level=level;room\.enemyCap=12/);
 assert.match(game,/if\(testLabOpen\)closeTestLab\(\)/);
});


test('wheel rewards vary between spins and rare wheels appear only in treasure rooms', () => {
 const game=readFileSync('src/game.js','utf8'),world=readFileSync('src/world.js','utf8');
 assert.match(game,/game\.wheelSpins=\(game\.wheelSpins\|\|0\)\+1/);
 assert.match(game,/ÇARK ÖDÜLÜ · \+100 ALTIN/);
 assert.match(game,/if\(p\.kits<5\)/);
 assert.match(world,/room\.type==='treasure'&&hash2\(room\.x,room\.y,seed\+9823\)%4===0/);
});
test('first boss door consumes and animates three follower keys', () => {
 const game=readFileSync('src/game.js','utf8');
 assert.match(game,/!game\.rooms\[id\]\.keysConsumed/);
 assert.match(game,/game\.bossKeys=0;for\(const key of game\.keyFollowers\)/);
 assert.match(game,/game\.keyFollowers\.length=0/);
});


test('hunt target has more health speed attack tempo and damage', () => {
 const game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(game,/target\.maxHp=Math\.round\(target\.maxHp\*2\.5\)/);
 assert.match(game,/target\.moveMultiplier=1\.35;target\.attackMultiplier=1\.3;target\.damageScale\*=1\.45/);
 assert.match(ai,/\*\(e\.moveMultiplier\|\|1\)/);
 assert.match(ai,/e\.fire-=dt\*\(e\.attackMultiplier\|\|1\)/);
});
test('ground enemies drop through platforms to pursue player below', () => {
 const game=readFileSync('src/game.js','utf8'),ai=readFileSync('src/enemy-ai.js','utf8');
 assert.match(game,/!\(\(o\.dropThrough\|\|0\)>0\)/);
 assert.match(ai,/p\.y>e\.y\+e\.h\+85/);
 assert.match(ai,/e\.dropThrough=\.48/);
 assert.match(ai,/e\.dropThrough=Math\.max\(0/);
});


test('enemy ammo pickups match the equipped projectile family and refill matching weapons', () => {
 const game=readFileSync('src/game.js','utf8'),loot=readFileSync('src/loot-view.js','utf8');
 assert.match(game,/if\(kind==='ammo'\)artifact=WEAPON_PROJECTILES\[game\.player\.weapon/);
 assert.match(game,/const family=item\.artifact\|\|'kinetic',targets=p\.slots\.filter\(q=>q&&WEAPON_PROJECTILES\[q\.weapon\]===family/);
 for(const family of ['kinetic','scatter','pierce','plasma','laser','explosive','arc'])assert.match(loot,new RegExp(family+':\\['));
 assert.match(loot,/if\(item\.kind==='ammo'\)/);
});


test('gold vault and assault room events have distinct generation and gameplay', () => {
 const world=readFileSync('src/world.js','utf8'),game=readFileSync('src/game.js','utf8'),map=readFileSync('src/map-view.js','utf8');
 assert.match(world,/room\.type='assault'/);assert.match(world,/room\.type='gold'/);
 assert.match(world,/room\.type==='gold'\?'gold'/);
 assert.match(game,/room\.type==='treasure'\|\|room\.type==='gold'/);
 assert.match(game,/ALTIN KASASI · ALTINLARI TOPLA/);
 assert.match(game,/room\.type==='assault'\?3:2/);
 assert.match(map,/gold:'\$',assault:'!'/);
});
