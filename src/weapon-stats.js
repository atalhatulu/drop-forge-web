'use strict';
/* Pure combat stat calculations shared by firing, HUD and workbench. */
(function(root){
function createWeaponStats({WEAPON_DAMAGE,WEAPON_FIRE_RATES,WEAPON_PROJECTILES,MAG_SIZE,getMasteryLevel=()=>1,getMasteryTalents=()=>({}),getModLevel=()=>1}){
function weaponStats(slot){const scaled=(id,factor)=>Math.max(.2,1+(factor-1)*Math.max(1,Math.min(3,getModLevel(id)||1)));const id=slot.weapon,mods=slot.mods||[],family=WEAPON_PROJECTILES[id],baseDamage=WEAPON_DAMAGE[id],baseInterval=WEAPON_FIRE_RATES[id],baseSpeed=family==='laser'?1750:family==='explosive'?670:family==='arc'?990:family==='scatter'?850:family==='pierce'?1220:family==='plasma'?760:930,baseMag=MAG_SIZE[id],pellets=family==='scatter'?5:1;
 const level=Math.max(1,Math.min(10,getMasteryLevel(id))),talents=getMasteryTalents(id)||{},masteryDamage=1+(level-1)*.008,masteryFire=1+(level-1)*.003,masteryReload=1-(level-1)*.003;
 const damage=Math.round(baseDamage*masteryDamage*(mods.includes('barrel')?scaled('barrel',1.20):1)*(mods.includes('rapidBarrel')?scaled('rapidBarrel',.94):1)*(mods.includes('shockCore')?scaled('shockCore',1.12):1)*(mods.includes('shockMuzzle')?scaled('shockMuzzle',1.10):1)*(mods.includes('resonanceCore')?scaled('resonanceCore',1.20):1)*(level>=10&&talents[10]==='execution'?1.08:1));
 const interval=baseInterval*(mods.includes('loader')?scaled('loader',.9):1)/(mods.includes('rapidBarrel')?scaled('rapidBarrel',1.18):1)*(mods.includes('barrel')?scaled('barrel',1.08):1)/masteryFire;
 const reload=.85*masteryReload*(mods.includes('loader')?scaled('loader',.78):1)*(mods.includes('extendedMag')?scaled('extendedMag',1.18):1);
 const mag=mods.includes('extendedMag')?Math.ceil(baseMag*scaled('extendedMag',1.35)):baseMag;
 const speed=Math.round(baseSpeed*(mods.includes('core')?scaled('core',1.25):1));
 const areaFamily=['explosive','plasma','arc'].includes(family),pierce=(family==='pierce'?1:0)+(mods.includes('core')&&!areaFamily?1:0)+(mods.includes('pierceBarrel')&&!['scatter','explosive'].includes(family)?1:0)+(mods.includes('laserSweep')?2:0);
 const spread=(level>=6&&talents[6]==='precision'?.82:1)*(mods.includes('stabilizer')?scaled('stabilizer',family==='scatter'?.58:.7):1)*(mods.includes('steadyGrip')?scaled('steadyGrip',.72):1)*(mods.includes('pierceBarrel')&&family==='scatter'?scaled('pierceBarrel',.75):1);
 const recoil=(mods.includes('heavyGrip')?scaled('heavyGrip',.65):1)*(mods.includes('heavyStabilizer')?.8:1),movementBonus=(mods.includes('lightGrip')?.13+.12*Math.max(1,Math.min(3,getModLevel('lightGrip')||1)):.13)+(level>=6&&talents[6]==='mobility'?.08:0),ammoSave=(mods.includes('efficientMechanism')?.15*Math.max(1,Math.min(3,getModLevel('efficientMechanism')||1)):0)+(level>=10&&talents[10]==='sustain'?.08:0);
 const areaBonus=(mods.includes('core')&&areaFamily?scaled('core',1.25):1)*(mods.includes('pierceBarrel')&&family==='explosive'?scaled('pierceBarrel',1.20):1)*(mods.includes('stabilizer')&&family==='explosive'?scaled('stabilizer',1.25):1)*(mods.includes('shockMuzzle')?1.2:1);const staggerBonus=(mods.includes('heavyGrip')?scaled('heavyGrip',1.5):1)*(mods.includes('shockMuzzle')?1.3:1);
 return {areaBonus,staggerBonus,masteryLevel:level,masteryDamage,masteryFire,masteryReload,damage,baseDamage,fireRate:1/interval,baseFireRate:1/baseInterval,interval,reload,baseReload:.85,speed,baseSpeed,pierce,basePierce:family==='pierce'?1:0,spread,mag,baseMag,pellets,shotDamage:damage*pellets,baseShotDamage:baseDamage*pellets,dps:damage*pellets/interval,baseDps:baseDamage*pellets/baseInterval,recoil,movementBonus,ammoSave,mods,family};
}
return weaponStats;
}
root.DropForgeWeaponStats=Object.freeze({createWeaponStats});
})(window);
