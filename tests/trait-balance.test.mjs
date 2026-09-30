import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function load(path,root={}){
 vm.runInNewContext(readFileSync(path,'utf8'),{window:root});
 return root;
}
const catalog=load('src/catalog.js').DropForgeCatalog;
const traits=load('src/weapon-traits.js').DropForgeWeaponTraits;
const combat=load('src/attachment-effects.js').DropForgeAttachmentEffects;
const {createWeaponStats}=load('src/weapon-stats.js').DropForgeWeaponStats;
const mags=[15,30,6,30,5,7,30,8,5,25,24,4,18];
const stats=createWeaponStats({
 WEAPON_DAMAGE:catalog.WEAPON_DAMAGE,WEAPON_FIRE_RATES:catalog.WEAPON_FIRE_RATES,
 WEAPON_PROJECTILES:catalog.WEAPON_PROJECTILES,MAG_SIZE:mags,
 getModLevel:(id,slot)=>slot.traits?.levels?.[id]||1
});
const gun=id=>({weapon:id,mods:[],traits:null,rune:null});
const hash=(a,b,c)=>(Math.imul(c+1,2654435761)^(Math.imul(a+17,2246822519))^(b*3266489917))>>>0;

test('all thirteen weapons have valid projectile families and three unique eligible reward cards',()=>{
 assert.equal(catalog.WEAPON_PROJECTILES.length,13);
 for(let id=0;id<13;id++)for(let seed=1;seed<=128;seed++){
  const w=gun(id),cards=traits.choices({slots:[w],projectiles:catalog.WEAPON_PROJECTILES,seed,hash});
  assert.equal(cards.length,3,'weapon '+id+' seed '+seed);
  assert.equal(new Set(cards.map(card=>card.id)).size,3);
  assert.ok(cards.every(card=>traits.eligible(w,card.id,catalog.WEAPON_PROJECTILES)));
  assert.ok(cards.every(card=>traits.canGrant(w,card.id,catalog.WEAPON_PROJECTILES)));
  assert.ok(cards.every(card=>card.weaponSlot===0));
  if(catalog.WEAPON_PROJECTILES[id]==='explosive')assert.ok(cards.every(card=>card.id!=='overheat'));
 }
});

test('every allowed transformation combines safely with every support across all weapons',()=>{
 for(let id=0;id<13;id++)for(const main of Object.keys(traits.TRAITS).filter(key=>traits.TRAITS[key].kind==='main'))for(const support of Object.keys(traits.TRAITS).filter(key=>traits.TRAITS[key].kind==='support')){
  const w=gun(id);
  if(!traits.eligible(w,main,catalog.WEAPON_PROJECTILES))continue;
  assert.equal(traits.grant(w,main,catalog.WEAPON_PROJECTILES),true);
  if(!traits.eligible(w,support,catalog.WEAPON_PROJECTILES)||main===support)continue;
  assert.equal(traits.grant(w,support,catalog.WEAPON_PROJECTILES),true);
  const st=stats(w),profile=combat.shotProfile(w,1,st);
  for(const key of ['damage','fireRate','reload','mag','dps','movementBonus','ammoSave'])assert.ok(Number.isFinite(st[key]),'weapon '+id+' '+main+' '+support+' '+key);
  assert.ok(st.damage>=1&&st.fireRate>0&&st.reload>0&&st.mag>=1);
  assert.ok(st.ammoSave>=0&&st.ammoSave<=.8);
  assert.ok(catalog.PROJECTILE_FAMILIES[profile.family],'weapon '+id+' '+main+' '+support+' projectile family');
  assert.ok(profile.pellets>=1&&profile.pellets<=5);
  assert.equal(w.traits.slots.filter(Boolean).length,2);
  assert.equal(w.mods.length,0,'run traits never consume retired sockets');
 }
});

test('fully upgraded weapon falls back to gold instead of endless main replacement offers',()=>{
 const w=gun(0);
 for(const id of ['burnCore','loader','stabilizer'])for(let level=0;level<3;level++)assert.equal(traits.grant(w,id,catalog.WEAPON_PROJECTILES),true);
 assert.equal(traits.canGrant(w,'burnCore',catalog.WEAPON_PROJECTILES),false,'all three occupied sockets reject new mechanics');
 const options=traits.choices({slots:[w],projectiles:catalog.WEAPON_PROJECTILES,seed:44,hash});
 assert.equal(options.length,0,'ordinary rewards should fall back to gold on a fully developed gun');
 const newGun=gun(1),withSecond=traits.choices({slots:[w,newGun],projectiles:catalog.WEAPON_PROJECTILES,seed:44,hash});
 assert.ok(withSecond.length>0&&withSecond.every(card=>card.weaponSlot===1),'second gun remains eligible');
});

test('upgrade cards level occupied mechanics and never replace them',()=>{
 const w=gun(0);
 for(const id of ['burnCore','loader','stabilizer'])assert.equal(traits.grant(w,id,catalog.WEAPON_PROJECTILES),true);
 const cards=traits.choices({slots:[w],projectiles:catalog.WEAPON_PROJECTILES,seed:10,hash});
 assert.ok(cards.length>0);
 assert.ok(cards.every(card=>card.upgrade),'full builds only offer upgrades to installed mechanics');
 assert.ok(cards.every(card=>card.level<=3));
 assert.equal(traits.grant(w,cards[0].id,catalog.WEAPON_PROJECTILES),true);
 assert.equal(traits.state(w).slots.length,3,'upgrade retains the three-slot build');
});

test('five pellets in one shotgun shot count as a single cryo hit per target',()=>{
 const enemy={},shared={cryoTargets:new Set()};
 for(let pellet=0;pellet<5;pellet++)combat.resolveAttachmentHit(enemy,{mods:['cryoCore'],shotEffects:shared},pellet*.001,false,.5);
 assert.equal(enemy.cryoHits,1);
 assert.equal(enemy.freezeTime||0,0);
 for(let shot=1;shot<=2;shot++)combat.resolveAttachmentHit(enemy,{mods:['cryoCore'],shotEffects:{cryoTargets:new Set()}},shot,false,.5);
 assert.equal(enemy.freezeTime,1.5,'three separate shotgun triggers freeze');
 const second={};
 combat.resolveAttachmentHit(second,{mods:['cryoCore'],shotEffects:shared},.1,false,.5);
 assert.equal(second.cryoHits,1,'a separate enemy still receives a cryo stack');
 assert.match(readFileSync('src/attachment-effects.js','utf8'),/cryoTargets/);
});

test('light grip movement damage is earned only by equipping the trait',()=>{
 const w=gun(0);
 assert.equal(stats(w).movementBonus,0);
 assert.equal(traits.grant(w,'lightGrip',catalog.WEAPON_PROJECTILES),true);
 assert.equal(stats(w).movementBonus,.25);
 for(let i=0;i<2;i++)traits.grant(w,'lightGrip',catalog.WEAPON_PROJECTILES);
 assert.ok(stats(w).movementBonus>0.25);
});

test('same-weapon pickups cannot silently consume distinct legacy mods traits or runes',()=>{
 const equipped=gun(0),pickup=gun(0);
 assert.equal(traits.sameBuild(equipped,pickup),true);
 equipped.mods[0]='barrel';
 assert.equal(traits.sameBuild(equipped,pickup),false,'incoming empty mod cannot erase equipped barrel');
 assert.equal(traits.sameBuild(pickup,equipped),false,'comparison is symmetric');
 pickup.mods[0]='barrel';
 assert.equal(traits.sameBuild(equipped,pickup),true);
 traits.grant(equipped,'burnCore',catalog.WEAPON_PROJECTILES);
 assert.equal(traits.sameBuild(equipped,pickup),false);
 pickup.traits=traits.snapshot(equipped);
 assert.equal(traits.sameBuild(equipped,pickup),true);
 pickup.traits.levels.burnCore=2;
 assert.equal(traits.sameBuild(equipped,pickup),false,'trait levels distinguish builds');
 pickup.traits.levels.burnCore=1;
 pickup.rune='hunt';
 assert.equal(traits.sameBuild(equipped,pickup),false,'different runes distinguish builds');
 equipped.rune='hunt';
 assert.equal(traits.sameBuild(equipped,pickup),true);
 const source=readFileSync('src/game.js','utf8');
 assert.match(source,/sameBuild\(duplicate,item\)/);
 assert.match(source,/rune:item\.rune\|\|null/);
 assert.match(source,/traits:window\.DropForgeWeaponTraits\.snapshot\(item\)/);
});

test('two-weapon reward distribution reaches both equipped guns across deterministic seeds',()=>{
 const counts=[0,0],kinds={main:0,support:0};
 for(let seed=1;seed<=512;seed++){
  const guns=[gun(0),gun(11)];
  const offers=traits.choices({slots:guns,projectiles:catalog.WEAPON_PROJECTILES,seed,hash});
  assert.ok(offers.length>0&&offers.length<=3);
  assert.equal(new Set(offers.map(offer=>offer.weaponSlot+':'+offer.id)).size,offers.length);
  for(const offer of offers){
   counts[offer.weaponSlot]++;
   kinds[offer.kind]++;
   assert.ok(traits.canGrant(guns[offer.weaponSlot],offer.id,catalog.WEAPON_PROJECTILES));
   assert.ok(!(guns[offer.weaponSlot].weapon===11&&offer.id==='overheat'));
  }
 }
 assert.ok(counts.every(total=>total>=150),'both equipped guns must receive visible opportunities across seeds');
 assert.ok(kinds.main>0&&kinds.support>0,'reward rolls must include both transformation and support progression');
});
