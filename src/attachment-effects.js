'use strict';
/* Deterministic combat attachment effects, separately testable from the canvas runtime. */
(function(root){
function shotProfile(slot,remainingAmmo,stats){
 const overheat=(slot.mods||[]).includes('overheat')&&remainingAmmo===0&&stats.family!=='explosive';
 return {family:overheat?'explosive':stats.family,pellets:overheat?1:stats.pellets};
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
root.DropForgeAttachmentEffects=Object.freeze({shotProfile,bounceBullet});
})(window);
