'use strict';
/* Seeded Canvas scenery: layered stone, mine scaffolds, cables and practical lights. */
(function(root){
function createProceduralBackground({ctx,W,H}){
function draw(room,seed,elapsed=0){
 ctx.save();
 let state=(seed^Math.imul((room?.id||0)+1,0x45d9f3b))>>>0;
 const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const biome=room?.biome||'cave',palettes={
  cave:{deep:'#101722',mid:'#203244',far:'#182532',near:'#111923',steel:'#354858',edge:'#7f93a0',warm:'#ffb85d',cool:'#63cfff',accent:'#d28e56'},
  forest:{deep:'#0c1917',mid:'#20352c',far:'#142720',near:'#101d19',steel:'#34483b',edge:'#7f9a75',warm:'#f0c071',cool:'#80dbad',accent:'#72b782'},
  crystal:{deep:'#111020',mid:'#282540',far:'#1b1a30',near:'#141426',steel:'#39354e',edge:'#aa8acb',warm:'#eca5ff',cool:'#73dfff',accent:'#b28ae8'},
  lava:{deep:'#1a1110',mid:'#43251c',far:'#281915',near:'#1b1312',steel:'#4b342e',edge:'#aa6c49',warm:'#ff9a4b',cool:'#ffcc71',accent:'#e46d40'}
 },p=palettes[biome]||palettes.cave,t=elapsed;
 ctx.fillStyle=p.deep;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(W*.52,H*.43,15,W*.52,H*.43,W*.77);glow.addColorStop(0,p.mid);glow.addColorStop(.55,p.far);glow.addColorStop(1,p.deep);ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 // Irregular roofline and distant rock terraces establish depth behind gameplay.
 ctx.fillStyle='#080e15';ctx.beginPath();ctx.moveTo(0,0);
 for(let x=0;x<=W+48;x+=48)ctx.lineTo(x,Math.min(192,48+rand()*98));
 ctx.lineTo(W,0);ctx.closePath();ctx.fill();
 for(let layer=0;layer<3;layer++){
  const y=H*(.48+layer*.12),height=28+layer*12;ctx.globalAlpha=.24-layer*.045;ctx.fillStyle=layer===0?p.steel:p.near;ctx.beginPath();ctx.moveTo(0,H);
  for(let x=0;x<=W+70;x+=70)ctx.lineTo(x,y+rand()*height);
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 }
 ctx.globalAlpha=1;
 // Mine supports and distant galleries use low contrast so sprites stay readable.
 ctx.save();ctx.globalAlpha=.54;ctx.lineCap='square';
 for(let i=0;i<5;i++){
  const x=38+i*258+rand()*22,top=80+rand()*65,bottom=H-78,width=13+rand()*8;
  ctx.fillStyle='#0b131b';ctx.fillRect(x,top,width,bottom-top);
  ctx.fillStyle=p.steel;ctx.fillRect(x+3,top,width-6,bottom-top);
  ctx.fillStyle=p.edge;ctx.globalAlpha=.32;ctx.fillRect(x+3,top,2,bottom-top);ctx.globalAlpha=.54;
  for(let y=top+34;y<bottom;y+=48){ctx.fillStyle='#101923';ctx.fillRect(x-8,y,width+16,5);ctx.fillStyle=p.edge;ctx.fillRect(x-8,y,2,5);}
 }
 for(let i=0;i<4;i++){
  const y=195+i*88,x0=rand()*45,x1=W-rand()*35;
  ctx.fillStyle='#0c141d';ctx.fillRect(x0,y,x1-x0,9);ctx.fillStyle=p.steel;ctx.fillRect(x0,y+2,x1-x0,4);
  ctx.strokeStyle='#617382';ctx.globalAlpha=.28;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y+9);ctx.lineTo(x1,y+9);ctx.stroke();ctx.globalAlpha=.54;
  for(let x=x0+20;x<x1;x+=92){ctx.fillStyle='#0b131a';ctx.fillRect(x,y+9,5,35+rand()*28);}
 }
 ctx.restore();
 // Hanging cables break the empty ceiling silhouette.
 ctx.save();ctx.strokeStyle='#070c11';ctx.lineWidth=4;ctx.globalAlpha=.72;
 for(let i=0;i<8;i++){
  const x=25+i*151+rand()*48,length=34+rand()*104;ctx.beginPath();ctx.moveTo(x,-3);
  ctx.bezierCurveTo(x+rand()*35,36,x-30+rand()*60,length-12,x+rand()*32,length);ctx.stroke();
  ctx.fillStyle='#667784';ctx.fillRect(x-3,length-2,7,4);
 }
 ctx.restore();
 // Lamp cones: broad, soft pools with a small crisp pixel fixture at each source.
 const lamps=[
  {x:W*.13,y:155,c:p.warm},{x:W*.39,y:105,c:p.warm},
  {x:W*.72,y:190,c:p.cool},{x:W*.91,y:126,c:p.warm}
 ];
 for(let i=0;i<lamps.length;i++){
  const lamp=lamps[i],pulse=.92+Math.sin(t*2.2+i*1.7)*.08,g=ctx.createRadialGradient(lamp.x,lamp.y,3,lamp.x,lamp.y,145*pulse);
  g.addColorStop(0,lamp.c+'55');g.addColorStop(.32,lamp.c+'20');g.addColorStop(1,lamp.c+'00');ctx.fillStyle=g;ctx.fillRect(lamp.x-150,lamp.y-8,300,190);
  ctx.fillStyle='#111923';ctx.fillRect(lamp.x-13,lamp.y-6,26,8);ctx.fillStyle=lamp.c;ctx.shadowColor=lamp.c;ctx.shadowBlur=14;ctx.fillRect(lamp.x-7,lamp.y+2,14,5);ctx.shadowBlur=0;
  ctx.fillStyle='#dce9ed';ctx.fillRect(lamp.x-2,lamp.y+3,4,3);
 }
 // Biome silhouettes add a distinct color identity without changing room geometry.
 if(biome==='forest'){
  for(let i=0;i<13;i++){const x=rand()*W,y=H*.48+rand()*H*.25,h=60+rand()*130;ctx.fillStyle=i%2?'#10231d':'#142b23';ctx.fillRect(x,y-h*.35,7,h*.8);ctx.beginPath();ctx.moveTo(x-22,y-h*.25);ctx.lineTo(x+4,y-h);ctx.lineTo(x+28,y-h*.24);ctx.closePath();ctx.fill();}
 }else if(biome==='crystal'){
  for(let i=0;i<12;i++){const x=rand()*W,y=H*.52+rand()*H*.25,h=22+rand()*62,w=7+rand()*15;ctx.globalAlpha=.34;ctx.fillStyle=i%2?'#ac75e8':'#68d8ff';ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x+w,y-h*.28);ctx.lineTo(x+w*.65,y);ctx.lineTo(x-w*.5,y);ctx.lineTo(x-w,y-h*.36);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
 }else if(biome==='lava'){
  ctx.save();ctx.globalAlpha=.25;ctx.strokeStyle='#f36e3e';ctx.shadowColor='#ff6a38';ctx.shadowBlur=12;ctx.lineWidth=3;
  for(let i=0;i<9;i++){const x=rand()*W,y=H*.61+rand()*H*.3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12+rand()*20,y+7);ctx.lineTo(x+18+rand()*26,y-2);ctx.stroke();}ctx.restore();
 }
 // Dark edge falloff protects readability under the HUD and at room borders.
 const vignette=ctx.createRadialGradient(W*.5,H*.46,H*.18,W*.5,H*.46,H*.79);vignette.addColorStop(0,'rgba(2,6,11,0)');vignette.addColorStop(1,'rgba(2,6,11,.58)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
 if(biome==='cave'&&room){ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#e4bc82';ctx.font='900 66px monospace';ctx.fillText('B'+room.stage,210,300);ctx.font='900 20px monospace';ctx.fillText('SEKTÖR',215,326);ctx.restore();}
 ctx.restore();
}
return draw;
}
root.DropForgeProceduralBackground=Object.freeze({createProceduralBackground});
})(window);
