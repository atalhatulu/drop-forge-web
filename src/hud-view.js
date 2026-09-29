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
function drawGameHud(){const game=getGame(),room=currentRoom();if(game.inHub)return;const flow=game.flow||0;ctx.fillStyle='#102033';ctx.fillRect(16,67,190,13);ctx.fillStyle=flow>70?'#ffe097':'#7de1bd';ctx.fillRect(18,69,186*flow/100,9);ctx.strokeStyle='#91b5cc';ctx.strokeRect(16,67,190,13);ctx.textAlign='left';ctx.font='bold 10px monospace';ctx.fillStyle='#e5ffe9';ctx.fillText('FORGE FLOW '+Math.round(flow)+'%',18,63);if(!game.inHub){const stage=room.stage,keys=game.regionKeys[stage-1];ctx.fillStyle=bossGateReady(stage)?'#b9ffbd':'#ffe49a';ctx.font='bold 10px monospace';ctx.textAlign='right';ctx.fillText('B'+stage+' · ⚿ '+keys+'/'+requiredBossKeys(stage),W-24,60);ctx.textAlign='left';}if(!room.cleared&&room.arenaStarted){ctx.textAlign='right';ctx.font='bold 11px monospace';ctx.fillStyle=room.threatLevel>=2?'#ff9d75':'#ffe3a1';ctx.fillText('TEHDİT '+(room.threatLevel||0)+'/3 · '+Math.floor(room.threatTime||0)+'sn',W-24,79);ctx.textAlign='left';}if(!room.cleared){ctx.fillStyle='#e9a0a0';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('⚔ '+room.enemies.length+' DÜŞMAN · '+room.portals.filter(q=>q.alive).length+' PORTAL',W/2,59);ctx.textAlign='left';}if(room.generator){ctx.textAlign='center';ctx.font='bold 10px monospace';ctx.fillStyle=room.generator.failed?'#ff928d':'#a7f5c2';ctx.fillText(room.generator.failed?'JENERATÖR KAYIP':'JENERATÖR · '+room.generator.hp+' HP · '+Math.ceil(room.generator.time)+'sn',W/2,79);ctx.textAlign='left';}if(room.type==='hunt'&&!room.cleared){ctx.font='bold 10px monospace';ctx.fillStyle='#ffe09c';ctx.textAlign='center';ctx.fillText(room.enemies.some(e=>e.hunted&&e.alive)?'HEDEF CANLI':'HEDEF YOK EDİLDİ',W/2,79);ctx.textAlign='left';}if(room.type==='boss'&&room.enemies.length){ctx.textAlign='center';ctx.font='bold 10px monospace';ctx.fillStyle='#ffcf99';ctx.fillText('BOSS '+room.bossStage+'/4 · '+(room.enemies.find(e=>e.type==='boss')?.bossName||BIOMES[room.biome].name)+' · FAZ '+(room.enemies.find(e=>e.type==='boss')?.bossPhase||1)+'/2',W/2,101);ctx.textAlign='left';let e=room.enemies.find(e=>e.type==='boss');if(e){ctx.fillStyle='#1b1524';ctx.fillRect(290,83,540,12);ctx.fillStyle='#b57db9';ctx.fillRect(290,83,540*(e.hp/e.maxHp),12);ctx.strokeStyle='#cda5c8';ctx.strokeRect(290,83,540,12);}}}
function drawNearbyMinimap(room){
 const game=getGame();
 if(game.inHub||room.arenaStarted&&!room.cleared||room.enemies.some(e=>e.alive)||room.portals.some(q=>q.alive))return;
 const size=26,cx=W-106,cy=141,neighbors=Object.values(room.links).map(id=>game.rooms[id]).filter(Boolean),visible=[room,...neighbors],seen=new Set(visible.map(r=>r.id));
 ctx.save();ctx.globalAlpha=.76;ctx.fillStyle='#091422';ctx.fillRect(W-198,89,184,106);ctx.strokeStyle='#53738b';ctx.lineWidth=1;ctx.strokeRect(W-198,89,184,106);ctx.textAlign='left';ctx.fillStyle='#a8c9d7';ctx.font='bold 10px monospace';ctx.fillText('YAKIN ÇEVRE',W-188,104);
 for(const next of neighbors){const x=cx+(next.x-room.x)*size,y=cy+(next.y-room.y)*size;ctx.strokeStyle='#7895a6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.stroke();}
 for(const next of visible){if(!seen.has(next.id))continue;const x=cx+(next.x-room.x)*size,y=cy+(next.y-room.y)*size,active=next.id===room.id;ctx.fillStyle=active?'#f9e3a0':next.cleared?'#7dc5a5':next.type==='boss'?'#ad8cd5':'#7492ad';ctx.fillRect(x-7,y-7,14,14);ctx.strokeStyle=active?'#ffffff':'#b2c7d2';ctx.strokeRect(x-7,y-7,14,14);if(active){ctx.fillStyle='#152239';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('●',x,y+4);}}
 ctx.restore();
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
