'use strict';
/* Terrain and biome canvas rendering. */
(function(root){
function createBiomeRenderer({ctx,W,H,FLOOR,WALL,BIOMES}){
function drawTerrain(room){
 const bi=BIOMES[room.biome],rock=bi.rock[0],edge=bi.accent;
 ctx.fillStyle=rock;
 ctx.fillRect(0,0,W,WALL);ctx.fillRect(0,FLOOR,W,H-FLOOR);
 ctx.fillRect(0,WALL,WALL,FLOOR-WALL);ctx.fillRect(W-WALL,WALL,WALL,FLOOR-WALL);
 // An opening is only visual; the room-transition logic controls entry.
 ctx.fillStyle=bi.rock[1];ctx.fillRect(WALL,FLOOR,W-2*WALL,7);
 ctx.fillStyle=edge;ctx.globalAlpha=.55;
 ctx.fillRect(WALL,FLOOR,W-2*WALL,3);
 ctx.fillRect(WALL,WALL,3,FLOOR-WALL);
 ctx.fillRect(W-WALL-3,WALL,3,FLOOR-WALL);
 ctx.fillRect(WALL,WALL,W-2*WALL,3);
 ctx.globalAlpha=1;
 // Side door frames are unobstructed even when doors are high up.
 for(const [side,door] of Object.entries(room.doors||{})){
  if(side==='left'||side==='right'){
   const dx=side==='left'?0:W-WALL;
   ctx.fillStyle='#111824';ctx.fillRect(dx,door.y-42,WALL,84);
   ctx.fillStyle=edge;ctx.globalAlpha=.65;
   ctx.fillRect(side==='left'?WALL-3:W-WALL,door.y-44,3,88);ctx.globalAlpha=1;
  }else if(side==='up'){
   ctx.fillStyle='#111824';ctx.fillRect(door.x-47,0,94,WALL);
  }else if(side==='down'){
   ctx.fillStyle='#111824';ctx.fillRect(door.x-47,FLOOR,94,H-FLOOR);
  }
 }
}
function drawBiome(room){if(room.biome==='forest'){
  for(const h of room.hazards){const sway=Math.sin(room.time*2+h.phase)*4;
   ctx.save();ctx.translate(h.x,h.y);ctx.shadowColor='#6ee596';ctx.shadowBlur=13;ctx.fillStyle='#274f36';ctx.fillRect(-3,-h.h+5,6,h.h+12);
   for(let i=0;i<3;i++){ctx.fillStyle=i===1?'#9cfc8e':'#4cba75';ctx.beginPath();ctx.ellipse(sway+(i-1)*9,-h.h+9+i*7,12,6,(i-1)*.5,0,Math.PI*2);ctx.fill();}ctx.shadowBlur=0;ctx.restore();}
 }else if(room.biome==='lava'){for(const h of room.hazards){ctx.save();ctx.shadowColor='#ff733f';ctx.shadowBlur=22;ctx.fillStyle='#e85a2a';ctx.fillRect(h.x-h.w/2,h.y-h.h,h.w,h.h+13);ctx.fillStyle='#ffd283';ctx.fillRect(h.x-h.w/2+5,h.y-h.h+3,h.w-10,4);ctx.restore();}}for(const h of room.hazards||[])if(h.tesla){ctx.save();const active=h.active,pulse=(room.time*6)%6;ctx.translate(h.x-h.w/2,h.y-h.h);ctx.fillStyle='#1e293b';ctx.fillRect(0,0,h.w,h.h);ctx.strokeStyle=active?'#70e1ff':'#475569';ctx.lineWidth=2;ctx.strokeRect(0,0,h.w,h.h);if(active){ctx.shadowColor='#38bdf8';ctx.shadowBlur=16;ctx.strokeStyle='#bae6fd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,h.h/2);for(let k=1;k<5;k++)ctx.lineTo(k*(h.w/5),h.h/2+(k%2?6:-6)+Math.sin(room.time*20+k)*3);ctx.lineTo(h.w-4,h.h/2);ctx.stroke();ctx.fillStyle='#e0f2fe';ctx.fillRect(h.w/2-3,-8,6,8);}else{ctx.fillStyle='#0284c7';ctx.fillRect(h.w/2-2,h.h/2-2,4,4);}ctx.restore();}else if(room.biome==='crystal')for(const c of room.crystals)if(c.alive){ctx.save();ctx.translate(c.x,c.y);ctx.shadowColor='#be6fff';ctx.shadowBlur=22;ctx.fillStyle=c.flash>0?'#fff5ff':'#a460ec';ctx.beginPath();ctx.moveTo(0,-c.r*1.65);ctx.lineTo(c.r*.83,-c.r*.2);ctx.lineTo(c.r*.5,c.r*.85);ctx.lineTo(-c.r*.62,c.r*.6);ctx.lineTo(-c.r,-c.r*.28);ctx.closePath();ctx.fill();ctx.strokeStyle='#e8baff';ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.restore();}}
return {drawTerrain,drawBiome};
}
root.DropForgeBiomeView=Object.freeze({createBiomeRenderer});
})(window);
