'use strict';
/* Deterministic combat attachment effects, separately testable from the canvas runtime. */
(function(root){
function effectiveMods(slot){return [...new Set([...(slot?.mods||[]),...(slot?.traits?.slots||[slot?.traits?.main,...(slot?.traits?.supports||[])]).filter(Boolean)].filter(Boolean))];}
function shotProfile(slot,remainingAmmo,stats,spentAmmo=true){
 const mods=effectiveMods(slot),overheat=spentAmmo&&mods.includes('overheat')&&remainingAmmo===0&&stats.family!=='explosive',laserSweep=mods.includes('laserSweep');
 return {family:overheat?'explosive':laserSweep?'laser':stats.family,pellets:overheat||laserSweep?1:stats.pellets,...(laserSweep?{damageMultiplier:stats.family==='scatter'?3:1}:{})};
}
function bounceBullet(bullet,bounds){
 if(!(bullet.bounces>0))return false;
 const x=bullet.x<bounds.left||bullet.x>bounds.right,y=bullet.y<bounds.top||bullet.y>bounds.bottom;
 if(!x&&!y)return false;
 bullet.x=Math.max(bounds.left,Math.min(bounds.right,bullet.x));
 bullet.y=Math.max(bounds.top,Math.min(bounds.bottom,bullet.y));
 if(x)bullet.vx=-bullet.vx;
 if(y)bullet.vy=-bullet.vy;
 bullet.bounces--;
 return true;
}
function resolveAttachmentHit(enemy,bullet,now,stationary,roll){
 const mods=bullet.mods||[];
 let critical=false;
 if(mods.includes('hunterMark')){
  critical=(enemy.hunterMarkTime||0)>0;
  enemy.hunterMarkTime=5;
 }else if((enemy.hunterMarkTime||0)>0)critical=true;
 if(!critical&&stationary&&mods.includes('heavyStabilizer')&&roll<.25)critical=true;
 if(mods.includes('cryoCore')&&(!bullet.shotEffects?.cryoTargets||!bullet.shotEffects.cryoTargets.has(enemy))){
  if(bullet.shotEffects?.cryoTargets)bullet.shotEffects.cryoTargets.add(enemy);
  const within=now-(enemy.cryoLastHit??-100)<=3;
  enemy.cryoHits=within?(enemy.cryoHits||0)+1:1;
  enemy.cryoLastHit=now;
  enemy.cryoSlowTime=2;
  const freezeHits=mods.includes('lightGrip')?2:3;if(enemy.cryoHits>=freezeHits){enemy.cryoHits=0;enemy.freezeTime=Math.max(enemy.freezeTime||0,mods.includes('lightGrip')?2:1.5);}
 }
 return {critical,multiplier:critical?(enemy.hunterMarkTime>0&&mods.includes('heavyStabilizer')&&stationary?1.8:1.5):1};
}
function burstPlan(slot){
 return effectiveMods(slot).includes('tripleBurst')?{remaining:2,delay:.085}:null;
}
function overchargeInterval(player,slot,interval){
 if(!effectiveMods(slot).includes('overchargeGrip'))return interval;
 if((player.overchargeCooldown||0)<=0){
  player.overchargeTime=2;
  player.overchargeCooldown=10;
 }
 return player.overchargeTime>0?interval*.5:interval;
}
root.DropForgeAttachmentEffects=Object.freeze({shotProfile,bounceBullet,resolveAttachmentHit,burstPlan,overchargeInterval});
})(window);
