'use strict';
/* Pure combat stat calculations shared by firing, HUD and workbench. */
(function(root){
function createWeaponStats({WEAPON_DAMAGE,WEAPON_FIRE_RATES,WEAPON_PROJECTILES,MAG_SIZE,getMasteryLevel=()=>1}){
function weaponStats(slot){const id=slot.weapon,mods=slot.mods||[],family=WEAPON_PROJECTILES[id],baseDamage=WEAPON_DAMAGE[id],baseInterval=WEAPON_FIRE_RATES[id],baseSpeed=family==='laser'?1750:family==='explosive'?670:family==='arc'?990:family==='scatter'?850:family==='pierce'?1220:family==='plasma'?760:930,baseMag=MAG_SIZE[id],pellets=family==='scatter'?5:1;
 const level=Math.max(1,Math.min(10,getMasteryLevel(id))),masteryDamage=1+(level-1)*.008,masteryFire=1+(level-1)*.003,masteryReload=1-(level-1)*.003;
 const damage=Math.round(baseDamage*masteryDamage*(mods.includes('barrel')?1.20:1)*(mods.includes('rapidBarrel')?.94:1)*(mods.includes('shockCore')?1.12:1));
 const interval=baseInterval*(mods.includes('loader')?.9:1)/(mods.includes('rapidBarrel')?1.18:1)*(mods.includes('barrel')?1.08:1)/masteryFire;
 const reload=.85*masteryReload*(mods.includes('loader')?.78:1)*(mods.includes('extendedMag')?1.18:1);
 const mag=mods.includes('extendedMag')?Math.ceil(baseMag*1.35):baseMag;
 const speed=Math.round(baseSpeed*(mods.includes('core')?1.25:1));
 const areaFamily=['explosive','plasma','arc'].includes(family),pierce=(family==='pierce'?1:0)+(mods.includes('core')&&!areaFamily?1:0)+(mods.includes('pierceBarrel')&&!['scatter','explosive'].includes(family)?1:0);
 const spread=(mods.includes('stabilizer')?(family==='scatter'?.58:.7):1)*(mods.includes('pierceBarrel')&&family==='scatter'?.75:1);
 const recoil=mods.includes('heavyGrip')?.65:1,movementBonus=mods.includes('lightGrip')?.25:.13,ammoSave=mods.includes('efficientMechanism')?.15:0;
 const areaBonus=(mods.includes('core')&&areaFamily?1.25:1)*(mods.includes('pierceBarrel')&&family==='explosive'?1.20:1)*(mods.includes('stabilizer')&&family==='explosive'?1.25:1);const staggerBonus=mods.includes('heavyGrip')?1.5:1;
 return {areaBonus,staggerBonus,masteryLevel:level,masteryDamage,masteryFire,masteryReload,damage,baseDamage,fireRate:1/interval,baseFireRate:1/baseInterval,interval,reload,baseReload:.85,speed,baseSpeed,pierce,basePierce:family==='pierce'?1:0,spread,mag,baseMag,pellets,shotDamage:damage*pellets,baseShotDamage:baseDamage*pellets,dps:damage*pellets/interval,baseDps:baseDamage*pellets/baseInterval,recoil,movementBonus,ammoSave,mods,family};
}
return weaponStats;
}
root.DropForgeWeaponStats=Object.freeze({createWeaponStats});
})(window);
