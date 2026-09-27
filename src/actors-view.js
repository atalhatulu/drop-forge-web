'use strict';
/* Player, enemy and portal sprites. */
(function(root){
function createActorsRenderer({ctx,getGame,mouse,WEAPON_SPRITES,currentRoom,BIOMES,VARIANTS,clamp}){
function drawPlayer(p){
 if(p.invuln>0&&Math.floor(p.invuln*14)%2)return;
 ctx.save();ctx.translate(Math.round(p.x+p.w/2),Math.round(p.y+p.h/2));ctx.rotate(p.spin||0);
 const t=getGame().elapsed,walking=p.grounded&&Math.abs(p.vx)>35,step=walking?Math.sin(t*15):0,bob=walking?Math.abs(Math.sin(t*15))*2:0;
 const wall=p.wallSide||0,air=!p.grounded,leg=air?4:step*5;
 // Pixel explorer with reactive helmet, scarf, face and animated limbs.
 ctx.fillStyle='#111a32';ctx.fillRect(-10,11+leg,9,12);ctx.fillRect(2,11-leg,9,12);
 ctx.fillStyle='#e5a360';ctx.fillRect(-11,20+leg,12,4);ctx.fillRect(2,20-leg,12,4);
 ctx.fillStyle=p.dash>0?'#b2f9ff':'#2e657a';ctx.fillRect(-13,-13-bob,26,27);
 ctx.fillStyle='#6be6b7';ctx.fillRect(-10,-11-bob,20,23);ctx.fillStyle='#9af5d0';ctx.fillRect(-8,-9-bob,6,13);
 ctx.fillStyle='#ec907d';ctx.fillRect(p.face>0?-19:13,-8-bob,6,10);ctx.fillStyle='#ffcd8d';ctx.fillRect(p.face>0?-18:13,2-bob,6,5);
 ctx.fillStyle='#162540';ctx.fillRect(-14,-24-bob,28,19);ctx.fillStyle='#ffe0b3';ctx.fillRect(-12,-23-bob,24,19);
 ctx.fillStyle='#ffeccf';ctx.fillRect(-9,-20-bob,18,10);
 const blink=Math.sin(t*1.7)> .994;ctx.fillStyle='#253b55';ctx.fillRect(-8,-15-bob,5,blink?1:5);ctx.fillRect(4,-15-bob,5,blink?1:5);
 ctx.fillStyle='#f0989b';ctx.fillRect(-11,-8-bob,5,3);ctx.fillRect(7,-8-bob,5,3);
 ctx.fillStyle='#415a86';ctx.fillRect(-14,-30-bob,28,10);ctx.fillStyle='#91c8df';ctx.fillRect(-10,-31-bob,20,4);
 ctx.fillStyle='#ffe79b';ctx.fillRect(p.face>0?7:-13,-28-bob,7,6);ctx.fillStyle='#fff8d7';ctx.fillRect(p.face>0?10:-12,-27-bob,2,2);
 ctx.fillStyle='#f27f8c';ctx.fillRect(-15,-4-bob,30,4);ctx.fillRect(p.face>0?-15:11,0-bob,5,8+Math.round(Math.sin(t*10)*2));
 if(wall){ctx.fillStyle='#c1efff';ctx.fillRect(wall>0?13:-18,-12,5,8);}
 if(p.dash>0){ctx.globalAlpha=.55;ctx.fillStyle='#a4f8ff';ctx.fillRect(-p.face*26,-9,13,4);ctx.fillRect(-p.face*34,3,17,3);ctx.globalAlpha=1;}
 ctx.save();ctx.rotate(Math.atan2(mouse.y-(p.y+p.h/2),mouse.x-(p.x+p.w/2))-(p.spin||0));
 const img=WEAPON_SPRITES[p.weapon];if(img instanceof HTMLCanvasElement){ctx.imageSmoothingEnabled=false;ctx.save();if(Math.cos(Math.atan2(mouse.y-(p.y+p.h/2),mouse.x-(p.x+p.w/2)))<0){ctx.scale(1,-1);}ctx.drawImage(img,0,0,img.width,img.height,1-(p.kick||0)*32,-13,48,25);ctx.restore();}
 else{ctx.fillStyle=p.weapon===null?'#d7f8ff':'#b1c5d8';ctx.fillRect(5,-3,29,5);}ctx.restore();ctx.restore();
}
function drawEnemy(e){
 ctx.save();const et=getGame().elapsed+(e.phase||0),stride=e.grounded?Math.sin(et*10)*Math.min(3,Math.abs(e.vx||0)/80):Math.sin(et*4)*2;ctx.translate(Math.round(e.x),Math.round(e.y+stride));if(e.hit>0)ctx.shadowColor='#fff0ce',ctx.shadowBlur=13;
 if(e.dodgeTime>0){ctx.globalAlpha=.36;ctx.fillStyle='#b8efff';ctx.fillRect(-e.vx*.055,0,e.w,e.h);ctx.globalAlpha=1;}ctx.fillStyle=({cave:{red:'#e7464b',blue:'#368df1',purple:'#a14be9',healer:'#65dca5',boss:'#a778ae'},forest:{red:'#bb5d4e',blue:'#49bd9a',purple:'#9c70bf',healer:'#9bdf65',boss:'#a3cc63'},crystal:{red:'#9361da',blue:'#70cfff',purple:'#cf84ff',healer:'#eb95ed',boss:'#ac82f4'},lava:{red:'#e46e43',blue:'#ffb25e',purple:'#e45d80',healer:'#eebc4b',boss:'#ff7842'}}[e.biome||'cave'][e.type]);ctx.fillRect(0,0,e.w,e.h);if(e.biome==='forest'){ctx.fillStyle='#65a86b';ctx.fillRect(4,-6,e.w-8,9);}if(e.biome==='crystal'){ctx.fillStyle='#e9b4ff';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(e.w*.48,-13);ctx.lineTo(e.w-3,0);ctx.fill();}if(e.biome==='lava'){ctx.fillStyle='#ffca70';ctx.fillRect(5,e.h*.65,e.w-10,4);}
 ctx.fillStyle='#1c2030';ctx.fillRect(e.w*.22,e.h*.27,6,6);ctx.fillRect(e.w*.64,e.h*.27,6,6);ctx.fillStyle='#fff1cf';ctx.fillRect(e.w*.22+1,e.h*.27+1,2,2);ctx.fillRect(e.w*.64+1,e.h*.27+1,2,2);ctx.fillStyle='#242238';ctx.fillRect(3,e.h-5,e.w*.3,5);ctx.fillRect(e.w*.68,e.h-5,e.w*.3,5);
 if(e.type==='red'){ctx.fillStyle='#ae262f';ctx.fillRect(-6,12,9,24);ctx.fillRect(e.w-3,12,9,24);ctx.fillStyle='#ffaba9';ctx.fillRect(5,3,e.w-10,5);}
 if(e.type==='blue'){ctx.save();ctx.globalAlpha=.45;ctx.fillStyle='#a0eaff';ctx.fillRect(-15,1+Math.sin(et*20)*3,15,5);ctx.fillRect(e.w,1-Math.sin(et*20)*3,15,5);ctx.restore();ctx.fillStyle='#7ad9ff';ctx.fillRect(-14,4,15,10);ctx.fillRect(e.w,4,15,10);ctx.fillStyle='#c0f3ff';ctx.fillRect(11,-6,10,7);}
 if(e.type==='purple'){ctx.fillStyle='#e6bbff';ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(e.w/2,-15);ctx.lineTo(e.w,7);ctx.fill();ctx.fillStyle='#e2a3ff';ctx.fillRect(e.w-2,12,7,20);}
 if(e.type==='healer'){ctx.save();ctx.globalAlpha=.4+.28*Math.sin(et*5);ctx.strokeStyle='#99ffd8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.w/2,e.h/2,e.w*.75,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.fillStyle='#c8ffe1';ctx.fillRect(4,-10,e.w-8,7);ctx.fillRect(e.w/2-3,-15,6,17);ctx.fillStyle='#a3ffd2';ctx.fillRect(6,13,e.w-12,5);}
 if(e.markTime>0){ctx.save();ctx.strokeStyle='#ffdc86';ctx.lineWidth=2;ctx.strokeRect(-8,-8,e.w+16,e.h+16);ctx.fillStyle='#ffe49e';ctx.textAlign='center';ctx.font='900 11px monospace';ctx.fillText('◎ '+Math.ceil(e.markTime)+'sn',e.w/2,-32);ctx.restore();}if(e.hunted){ctx.strokeStyle='#ffe493';ctx.lineWidth=3;ctx.strokeRect(-5,-5,e.w+10,e.h+10);ctx.fillStyle='#ffe493';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('HEDEF',e.w/2,-42);}if(e.type==='boss'){ctx.fillStyle='#d5acc9';ctx.fillRect(11,-15,13,18);ctx.fillRect(48,-15,13,18);}
 if(e.hit>0){ctx.save();ctx.globalAlpha=Math.min(.55,e.hit/.18*.5);ctx.fillStyle='#fff6dc';ctx.fillRect(0,0,e.w,e.h);ctx.restore();}ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.fillStyle='#e9e0f6';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText((e.variant||e.type)+' · LV '+(e.level||1),e.w/2,-18);if(e.windup>0){ctx.save();ctx.globalAlpha=.82;ctx.strokeStyle=e.type==='red'?'#ffba75':'#ff788d';ctx.lineWidth=3;if(e.type==='red'){ctx.strokeRect(-17,e.h-65,e.w+34,68);}else{const p=getGame().player,g=e.aimGenerator&&currentRoom().generator&&!currentRoom().generator.failed&&currentRoom().generator.time>0?currentRoom().generator:null,tx=(g?g.x:p.x+p.w/2)-e.x,ty=(g?g.y-18:p.y+p.h/2)-e.y;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(e.w/2,e.h/2);ctx.lineTo(tx,ty);ctx.stroke();ctx.setLineDash([]);}ctx.fillStyle='#ffde88';ctx.font='bold 10px monospace';ctx.fillText('!',e.w/2,-31);ctx.restore();}ctx.fillStyle='#151a23';ctx.fillRect(0,-11,e.w,5);ctx.fillStyle=e.type==='boss'?'#cf83b5':'#ef7471';ctx.fillRect(0,-11,e.w*(e.hp/e.maxHp),5);ctx.restore();
}
function drawPortal(q){
 ctx.save();ctx.translate(q.x,q.y);
 const col=({red:'#ff6469',blue:'#60b7ff',purple:'#d18dff',healer:'#72e8a9'})[q.type]||'#bf86f9';
 const biomeCol=BIOMES[q.biome||'cave'].accent,t=(getGame()?.elapsed||0),active=q.shield>0;
 // Anchored pixel-art stone frame with cycling energy channels.
 ctx.fillStyle='#15172a';ctx.fillRect(-28,-32,56,66);
 ctx.fillStyle=biomeCol;for(let k=0;k<4;k++){const yy=-29+k*16;ctx.fillRect(-29,yy,7,7);ctx.fillRect(22,yy,7,7);}
 ctx.fillStyle='#35354c';ctx.fillRect(-31,-36,62,7);ctx.fillRect(-31,30,62,8);
 for(let k=0;k<9;k++){const a=t*(active?-2:1.7)+k*Math.PI*2/9;const rr=active?27:20;ctx.globalAlpha=.4+.5*(.5+.5*Math.sin(t*3+k));ctx.fillStyle=active?'#a4efff':col;ctx.fillRect(Math.round(Math.cos(a)*rr)-2,Math.round(Math.sin(a)*rr*1.38)-2,4,4);}ctx.globalAlpha=1;
 ctx.save();ctx.beginPath();ctx.ellipse(0,0,18,26,0,0,Math.PI*2);ctx.clip();
 const gradient=ctx.createLinearGradient(-18,-27,18,27);gradient.addColorStop(0,'#110e25');gradient.addColorStop(.5,col);gradient.addColorStop(1,'#17102a');ctx.globalAlpha=.86;ctx.fillStyle=gradient;ctx.fillRect(-20,-28,40,56);ctx.globalAlpha=1;
 ctx.strokeStyle='#f4e8ff';ctx.lineWidth=2;for(let k=0;k<3;k++){const y=((t*33+k*24)%75)-37;ctx.beginPath();ctx.moveTo(-18,y);ctx.lineTo(18,y-12);ctx.stroke();}ctx.restore();
 ctx.strokeStyle=q.hit>0?'#ffffff':active?'#a1eeff':col;ctx.lineWidth=5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=active?21:13;ctx.beginPath();ctx.ellipse(0,0,20,28,0,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;
 if(active){ctx.strokeStyle='#c1f8ff';ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.lineDashOffset=-t*32;ctx.beginPath();ctx.ellipse(0,0,31,39,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 ctx.fillStyle='#11111e';ctx.fillRect(-32,-50,64,8);ctx.fillStyle=q.hp/q.maxHp>.35?col:'#ff7284';ctx.fillRect(-30,-48,60*clamp(q.hp/q.maxHp,0,1),4);ctx.strokeStyle='#bdc3db';ctx.lineWidth=1;ctx.strokeRect(-32,-50,64,8);
 ctx.textAlign='center';ctx.font='bold 10px monospace';ctx.fillStyle='#f3e7ff';ctx.fillText(VARIANTS[q.biome||'cave'][q.type]+' '+Math.ceil(q.hp)+'/'+q.maxHp,0,-57);
  const spawnRemaining=Math.max(0,q.time),spawnDuration=Math.max(.1,q.spawnDuration||getGame().settings.spawnDelay),progress=clamp(1-spawnRemaining/spawnDuration,0,1);
  const spawnLabel=spawnRemaining>0?'SPAWN '+spawnRemaining.toFixed(1)+'s':'SPAWN HAZIR';
  ctx.fillStyle='#071629';ctx.fillRect(-29,42,58,17);ctx.fillStyle='#9de9ff';ctx.font='bold 9px monospace';ctx.fillText(spawnLabel,0,51);
  ctx.fillStyle='#344b67';ctx.fillRect(-27,54,54,3);ctx.fillStyle=spawnRemaining>0?'#7bd2ff':'#a8f0a4';ctx.fillRect(-27,54,54*progress,3);
 if(active){ctx.fillStyle='#a8efff';ctx.fillText('KALKAN '+q.shield.toFixed(1)+'s',0,-72);}
 else if(q.shieldCooldown>0){ctx.fillStyle='#acbad0';ctx.fillText('KALKAN BEKLEME '+Math.ceil(q.shieldCooldown)+'s',0,-72);ctx.fillStyle='#384659';ctx.fillRect(-23,-67,46,3);ctx.fillStyle='#66bbd4';ctx.fillRect(-23,-67,46*(1-q.shieldCooldown/15),3);}
 else if(q.regenDelay===0&&q.hp<(q.regenCap??q.maxHp)){ctx.fillStyle='#a4ffd3';ctx.fillText('YENİLENİYOR',0,-72);}
 ctx.restore();
}
return {drawPlayer,drawEnemy,drawPortal};
}
root.DropForgeActorsView=Object.freeze({createActorsRenderer});
})(window);
