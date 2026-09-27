'use strict';
/* Map canvas rendering, separate from map navigation and input state. */
(function(root){
function createMapRenderer({getGame,mapCanvas,mctx}){
function drawMap(){
 const game=getGame();if(!game)return;const c=mctx,w=mapCanvas.width,h=mapCanvas.height;c.clearRect(0,0,w,h);c.fillStyle='#0b111c';c.fillRect(0,0,w,h);
 const rooms=game.rooms,minX=Math.min(...rooms.map(r=>r.x)),maxX=Math.max(...rooms.map(r=>r.x)),minY=Math.min(...rooms.map(r=>r.y)),maxY=Math.max(...rooms.map(r=>r.y));
 const step=Math.min(55,(w-125)/(maxX-minX+1),(h-130)/(maxY-minY+1)),ox=(w-(maxX-minX)*step)/2+20,oy=71+(h-130-(maxY-minY)*step)/2;
 const zoneColors=['rgba(98,149,184,.16)','rgba(82,164,106,.16)','rgba(159,101,203,.16)','rgba(211,109,76,.16)'];
 const zoneNames=['I · TERK EDİLMİŞ MADEN · LV 1','II · ZEHİRLİ ORMAN · LV 2','III · MOR KRİSTAL · LV 3','IV · LAV ÇEKİRDEĞİ · LV 3'];
 for(let zone=0;zone<4;zone++){const top=zone===0?oy-step*.6:oy+step*(zone*5+.5),bottom=oy+step*(zone*5+5.5);
 c.fillStyle=zoneColors[zone];c.fillRect(5,top,w-10,bottom-top);
 c.fillStyle=['#b2d9f4','#aeefbb','#dec0ff','#ffc39f'][zone];c.font='bold 11px monospace';c.textAlign='left';c.fillText(zoneNames[zone],11,top+17);
 if(zone<3){c.strokeStyle='#a5bcd8';c.lineWidth=1;c.setLineDash([6,5]);c.beginPath();c.moveTo(7,bottom);c.lineTo(w-7,bottom);c.stroke();c.setLineDash([]);}
 }
 for(const room of rooms)for(const id of Object.values(room.links)){const next=rooms[id];if(id<=room.id)continue;c.strokeStyle=room.visited&&next.visited?'#6dcfae':'#354355';c.lineWidth=room.visited&&next.visited?4:2;c.setLineDash(room.visited&&next.visited?[]:[4,4]);c.beginPath();c.moveTo(ox+(room.x-minX)*step,oy+(room.y-minY)*step);c.lineTo(ox+(next.x-minX)*step,oy+(next.y-minY)*step);c.stroke();}c.setLineDash([]);
 for(const room of rooms){const x=ox+(room.x-minX)*step,y=oy+(room.y-minY)*step,sz=Math.max(12,step*(room.type==='boss'?1.18:.67)),known=room.discovered||room.visited,active=room.id===game.roomId;
 c.fillStyle=active?'#fff0a4':room.cleared?'#66c89e':room.visited?'#75a8d9':known?(room.type==='boss'?'#a77ebc':'#647c99'):'#263244';
 c.fillRect(x-sz/2,y-sz/2,sz,sz);c.strokeStyle=active?'#ffffff':known?'#afc0d2':'#47546a';c.lineWidth=active?3:1;c.strokeRect(x-sz/2,y-sz/2,sz,sz);
 c.textAlign='center';c.fillStyle=active?'#182235':known?'#f6f0de':'#79899b';c.font='bold '+Math.max(8,Math.min(12,step*.25))+'px monospace';
 c.fillText(active?'●':known?room.type==='boss'?'B'+room.bossStage:({defense:'K',hunt:'H',elite:'E',treasure:'T'})[room.type]||'·':'?',x,y+4);
 if(known&&room.type!=='boss'&&room.type!=='start'){c.fillStyle='#b9f4ca';c.font='bold 9px monospace';c.fillText(({ammo:'M',mod:'E',xp:'XP',health:'C'})[room.reward]||'',x,y+sz/2+10);}
 }
 c.textAlign='left';c.fillStyle='#aac4d7';c.font='bold 12px monospace';c.fillText('YÜZEY ↑  ·  '+rooms.length+' ODA  ·  4 BOSS  ·  4 BÖLGE  ·  DERİNLİK ↓',18,24);
}
return drawMap;
}
root.DropForgeMapView=Object.freeze({createMapRenderer});
})(window);
