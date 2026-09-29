/* Canvas overlays for the timed wheel and in-room status HUD. */
(function(root){
function createHudView({ctx,W,H,getGame,currentRoom,requiredBossKeys,bossGateReady,BIOMES}){
function drawWheelScreen(w){
 if(!w||!(w.spinTime>0||w.resultTime>0))return;
 const cx=W/2,cy=H/2+22,r=177,labels=['SİLAH BLUEPRINTİ','ÖZELLİK','SAĞLIK','MERMİ','BOMBA','SÜRPRİZ'],colors=['#e3a654','#6559ad','#4aa782','#438fb5','#b45e76','#b68c49'];
 ctx.save();ctx.fillStyle='rgba(5,9,22,.92)';ctx.fillRect(0,0,W,H);
 ctx.textAlign='center';ctx.fillStyle='#fbe6ac';ctx.font='bold 32px monospace';ctx.fillText(w.spinTime>0?'ŞANS ÇARKI':'ÖDÜL KAZANDIN',cx,89);
 ctx.fillStyle='#b7c9dc';ctx.font='16px monospace';ctx.fillText(w.spinTime>0?'ÇARK DÖNÜYOR · SONUCU BEKLE':'ÖDÜLÜN HAZIR',cx,122);
 ctx.save();ctx.translate(cx,cy);ctx.rotate(w.spinAngle||0);
 for(let i=0;i<labels.length;i++){const a=-Math.PI/2+i*Math.PI/3,b=a+Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,a,b);ctx.closePath();ctx.fillStyle=colors[i];ctx.fill();ctx.strokeStyle='#fce6af';ctx.lineWidth=3;ctx.stroke();ctx.save();ctx.rotate((a+b)/2);ctx.translate(r*.63,0);ctx.rotate(Math.PI/2);ctx.fillStyle='#fffaf0';ctx.font='bold '+(i===0?10:14)+'px monospace';ctx.fillText(labels[i],0,5);ctx.restore();}
 ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.fillStyle='#19243b';ctx.fill();ctx.strokeStyle='#ffe2a1';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#ffe2a1';ctx.font='bold 12px monospace';ctx.fillText('DF',0,5);ctx.restore();
 ctx.beginPath();ctx.moveTo(cx,cy-r-5);ctx.lineTo(cx-17,cy-r-37);ctx.lineTo(cx+17,cy-r-37);ctx.closePath();ctx.fillStyle='#fff0bf';ctx.fill();ctx.strokeStyle='#a96e31';ctx.lineWidth=3;ctx.stroke();
 if(w.resultTime>0){ctx.fillStyle='rgba(12,22,39,.95)';ctx.fillRect(115,H-103,W-230,61);ctx.fillStyle='#ffe5a2';ctx.font='bold 17px monospace';ctx.fillText(w.resultLabel||'ÇARK ÖDÜLÜ',cx,H-65);}
 ctx.restore();
}
function drawGameHud(){const game=getGame(),room=currentRoom();if(game.inHub)return;const flow=game.flow||0,stage=room.stage;ctx.save();ctx.textAlign='center';ctx.font='bold 13px monospace';ctx.fillStyle='#f4e2b8';ctx.fillText('LV '+room.level+' · TERK EDİLMİŞ MADEN',W/2,28);ctx.fillStyle='rgba(6,13,20,.78)';ctx.fillRect(W/2-118,37,236,9);ctx.fillStyle='#e2ad53';ctx.fillRect(W/2-115,39,230*flow/100,5);ctx.strokeStyle='rgba(227,190,123,.65)';ctx.strokeRect(W/2-118,37,236,9);ctx.fillStyle='#f3d997';ctx.font='bold 9px monospace';ctx.fillText('B'+stage+' · ODA '+(game.roomId+1)+' / '+game.rooms.length+' · '+Math.floor(flow)+'%',W/2,61);if(room.type==='boss'&&room.enemies.length){const e=room.enemies.find(e=>e.type==='boss');if(e){ctx.fillStyle='rgba(10,12,18,.9)';ctx.fillRect(W*.31,77,W*.38,12);ctx.fillStyle='#d94f51';ctx.fillRect(W*.31+2,79,(W*.38-4)*clamp(e.hp/e.maxHp,0,1),8);ctx.strokeStyle='#d9b484';ctx.strokeRect(W*.31,77,W*.38,12);ctx.fillStyle='#ffe1bf';ctx.font='bold 10px monospace';ctx.fillText('BOSS · '+(e.bossName||BIOMES[room.biome].name),W/2,73);}}ctx.restore();}
function drawNearbyMinimap(room){
 const game=getGame();if(game.inHub)return;
 const x=W-236,y=18,w=220,h=128,cx=x+w/2,cy=y+74,size=23,neighbors=Object.values(room.links).map(id=>game.rooms[id]).filter(Boolean),visible=[room,...neighbors],seen=new Set(visible.map(r=>r.id));
 ctx.save();ctx.fillStyle='rgba(8,15,21,.9)';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(48,64,72,.72)';ctx.fillRect(x+2,y+2,w-4,20);ctx.strokeStyle='#92754f';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h);ctx.textAlign='left';ctx.fillStyle='#e2c79a';ctx.font='bold 10px monospace';ctx.fillText('LV '+room.level+' · '+BIOMES[room.biome].name.toUpperCase(),x+10,y+15);
 for(const next of neighbors){const nx=cx+(next.x-room.x)*size,ny=cy+(next.y-room.y)*size;ctx.strokeStyle='#76674f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(nx,ny);ctx.stroke();ctx.strokeStyle='#c2a474';ctx.lineWidth=1;ctx.stroke();}
 for(const next of visible){if(!seen.has(next.id))continue;const nx=cx+(next.x-room.x)*size,ny=cy+(next.y-room.y)*size,active=next.id===room.id;ctx.fillStyle=active?'#f5d17b':next.type==='boss'?'#e75c50':next.cleared?'#7dbb9b':'#596b70';ctx.fillRect(nx-6,ny-6,12,12);ctx.strokeStyle=active?'#fff0c4':'#b8aa8e';ctx.strokeRect(nx-6,ny-6,12,12);if(next.type==='boss'){ctx.fillStyle='#201614';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('B',nx,ny+3);}}
 ctx.fillStyle='#d9c7a7';ctx.textAlign='left';ctx.font='bold 9px monospace';ctx.fillText('ODALAR '+visible.filter(r=>r.cleared).length+' TEMİZLENDİ',x+10,y+h-8);if(!room.cleared&&room.arenaStarted){ctx.textAlign='right';ctx.fillStyle=room.threatLevel>=2?'#ff9579':'#ffd17c';ctx.fillText('TEHDİT '+(room.threatLevel||0)+'/3 · '+Math.floor(room.threatTime||0)+'sn',x+w-9,y+h-8);}ctx.restore();
}
function drawRoomObjective(){
 const game=getGame();if(!game||game.inHub)return;const room=currentRoom();let label='';
 if(room.blueprintRoom)label=room.cleared?'BLUEPRINT KAZANILDI':'BLUEPRINT · ODAYI TEMİZLE';
 else if(room.type==='defense')label=room.generator?.failed?'JENERATÖR DÜŞTÜ · KALAN DÜŞMANLARI TEMİZLE':room.generator?.time>0?'JENERATÖRÜ KORU · '+Math.ceil(room.generator.time)+' SN':'SAVUNMA TAMAM · DÜŞMANLARI TEMİZLE';
 else if(room.type==='hunt')label=room.enemies.some(enemy=>enemy.hunted&&enemy.alive)?'İŞARETLİ HEDEFİ YOK ET · PORTALLAR KAPANIR':'HEDEF YOK EDİLDİ';
 else if(room.type==='assault')label='PUSU · '+room.portals.filter(portal=>portal.alive).length+' / 3 GEÇİT AÇIK';
 else if(room.type==='miniboss')label='MİNİ BOSS · MUHAFIZI YEN';
 else if(room.type==='elite')label='ELİT ARENA · TEHDİTİ TEMİZLE';
 else if(room.miniEvent)label=room.eventTitle||'MİNİ ETKİNLİK';
 else if((room.type==='treasure'||room.type==='gold')&&room.chest&&!room.chest.opened)label='SANDIK · YAKLAŞ VE E İLE AÇ';
 if(!label)return;ctx.save();ctx.font='bold 11px monospace';const width=Math.min(W-36,Math.max(220,ctx.measureText(label).width+26)),x=(W-width)/2,y=H-38;ctx.fillStyle='rgba(9,15,22,.88)';ctx.strokeStyle=room.blueprintRoom?'#d4ad63':'#648093';ctx.lineWidth=1;ctx.fillRect(x,y,width,25);ctx.strokeRect(x,y,width,25);ctx.fillStyle=room.blueprintRoom?'#f4d891':'#d9e8ef';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,W/2,y+13,width-14);ctx.restore();
}
return Object.freeze({drawWheelScreen,drawGameHud,drawNearbyMinimap,drawRoomObjective});
}
root.DropForgeHudView=Object.freeze({createHudView});
})(window);
