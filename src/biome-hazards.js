'use strict';
/* Seeded biome hazard and crystal placement. */
(function(root){
function createBiomeHazards({rng,ri,FLOOR}){
function buildBiome(room){const rr=rng((room.cave.seed^0x5d8b4b3d)>>>0);room.hazards=[];room.crystals=[];
 if(room.biome==='forest'){
  for(let i=0;i<5;i++){const x=ri(rr,140,970),y=FLOOR-22;
   if(Object.values(room.doors).some(d=>Math.abs(d.x-x)<110&&Math.abs(d.y-y)<110))continue;
   room.hazards.push({x,y,w:ri(rr,24,43),h:ri(rr,24,42),phase:rr()*6.28});}
 }
 if(room.biome==='lava'){for(let i=0;i<4;i++){const x=ri(rr,165,945);if(Object.values(room.doors).some(d=>Math.abs(d.x-x)<115))continue;room.hazards.push({x,y:FLOOR-12,w:ri(rr,24,45),h:14,phase:rr()*6.28,lava:true});}}
 if(room.biome==='crystal'){
  for(let i=0;i<5;i++){const x=ri(rr,155,955),y=FLOOR-ri(rr,30,58);
   if(Object.values(room.doors).some(d=>Math.abs(d.x-x)<115&&Math.abs(d.y-y)<105))continue;
   room.crystals.push({x,y,r:ri(rr,15,22),hp:ri(rr,22,38),alive:true,flash:0});}
 }
}
return buildBiome;
}
root.DropForgeBiomeHazards=Object.freeze({createBiomeHazards});
})(window);
