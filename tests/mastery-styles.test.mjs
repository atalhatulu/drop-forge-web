import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const catalogContext={window:{}};
vm.runInNewContext(readFileSync('src/catalog.js','utf8'),catalogContext);
const catalog=catalogContext.window.DropForgeCatalog;
const statsContext={window:{}};
vm.runInNewContext(readFileSync('src/weapon-stats.js','utf8'),statsContext);
const {createWeaponStats,MASTERY_STYLES}=statsContext.window.DropForgeWeaponStats;

test('all thirteen weapons have distinct permanent focused and rapid styles',()=>{
 assert.equal(MASTERY_STYLES.length,13);
 assert.equal(new Set(Array.from(MASTERY_STYLES,pair=>pair.focused.name)).size,13);
 assert.equal(new Set(Array.from(MASTERY_STYLES,pair=>pair.rapid.name)).size,13);
 assert.ok(Array.from(MASTERY_STYLES,pair=>pair.focused.description&&pair.rapid.description).every(Boolean));
});
test('style choices require mastery four, keep run trait slots free and make different tradeoffs',()=>{
 let level=3,choice='focused';
 const stats=createWeaponStats({WEAPON_DAMAGE:catalog.WEAPON_DAMAGE,WEAPON_FIRE_RATES:catalog.WEAPON_FIRE_RATES,WEAPON_PROJECTILES:catalog.WEAPON_PROJECTILES,MAG_SIZE:[15,30,6,30,5,7,30,8,5,25,24,4,18],getMasteryLevel:()=>level,getMasteryStyle:()=>choice});
 const weapon={weapon:2,mods:[],traits:{main:null,supports:[],levels:{}}};
 const locked=stats(weapon);
 assert.equal(locked.masteryStyle,null,'a stored style must not activate below its unlock level');
 level=4;
 const focused=stats(weapon);
 assert.equal(focused.masteryStyle,'focused');
 assert.deepEqual(Array.from(weapon.traits.supports),[]);
 assert.equal(weapon.traits.main,null);
 choice='rapid';const rapid=stats(weapon);
 assert.ok(focused.damage>rapid.damage);
 assert.ok(focused.spread<rapid.spread);
 assert.ok(rapid.fireRate>focused.fireRate);
 assert.ok(rapid.mag>focused.mag,'scatter rapid style adds a shell');
 choice=null;const standard=stats(weapon);
 assert.equal(standard.masteryStyle,null);
 assert.ok(standard.damage<focused.damage&&standard.damage>rapid.damage);
});
test('explosive focused style boosts area while rapid style accelerates reloading',()=>{
 let choice='focused';
 const stats=createWeaponStats({WEAPON_DAMAGE:catalog.WEAPON_DAMAGE,WEAPON_FIRE_RATES:catalog.WEAPON_FIRE_RATES,WEAPON_PROJECTILES:catalog.WEAPON_PROJECTILES,MAG_SIZE:[15,30,6,30,5,7,30,8,5,25,24,4,18],getMasteryLevel:()=>4,getMasteryStyle:()=>choice});
 const gun={weapon:11,mods:[]},focused=stats(gun);
 choice='rapid';const rapid=stats(gun);
 assert.ok(focused.areaBonus>rapid.areaBonus);
 assert.ok(rapid.reload<focused.reload);
});
function loadProgress(initial={}){
 const saved=new Map(Object.entries(initial));
 const storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value),removeItem:key=>saved.delete(key)};
 const root={DropForgeCatalog:catalog};
 vm.runInNewContext(readFileSync('src/progression.js','utf8'),{window:root,localStorage:storage,Date,JSON});
 return {progress:root.DropForgeProgression,saved};
}
test('old XP and weapon unlocks remain intact while mastery styles persist and restore',()=>{
 const key='dropForge.masteryStyles.v1';
 const old={'dropForge.weaponMastery.v1':JSON.stringify({0:1500,1:540}), 'dropForge.unlockedWeapons.v1':JSON.stringify([0,1,7]),[key]:JSON.stringify({0:'focused',1:'invalid',7:'rapid',999:'focused'})};
 const {progress,saved}=loadProgress(old);
 assert.equal(progress.mastery[0],1500);
 assert.ok(progress.unlockedWeapons.has(7));
 assert.equal(progress.masteryStyles[0],'focused');
 assert.equal(progress.masteryStyles[1],undefined);
 assert.equal(progress.masteryStyles[7],'rapid');
 assert.equal(progress.masteryStyles[999],undefined);
 progress.masteryStyles[1]='rapid';progress.saveMasteryStyles();
 const again=loadProgress(Object.fromEntries(saved)).progress;
 assert.equal(again.masteryStyles[1],'rapid');
 assert.equal(again.mastery[0],1500);
 assert.ok(again.unlockedWeapons.has(7));
 assert.ok(again.ALL_PROGRESS_KEYS.includes(key),'manual export and reset include the new key');
});
test('hub style selection is permanent but never occupies an expedition trait slot',()=>{
 const source=readFileSync('src/game.js','utf8');
 const html=readFileSync('index.html','utf8');
 assert.match(source,/function chooseForgeStyle\(n,choice\)/);
 assert.match(source,/masteryLevel\(id\)<4/);
 assert.match(source,/saveMasteryStyles\(\)/);
 assert.match(source,/getMasteryStyle:id=>masteryStyles\[id\]/);
 assert.match(source,/masteryStyleHTML\(w\.weapon\)/);
 assert.match(source,/masteryStyleHTML\(id\)/);
 assert.match(html,/id="forgeStyle1"/);
 assert.match(html,/id="forgeStyle2"/);
});
