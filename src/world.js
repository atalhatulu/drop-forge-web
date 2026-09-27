'use strict';
/* Seeded map generation is isolated from the active game and rendering loop. */
(function(root){
function rng(seed){let a=(seed>>>0)||1;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash2(ix,iy,seed){let h=(seed^Math.imul(ix,374761393)^Math.imul(iy,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}
function createMapGenerator({W,FLOOR,buildTerrain,buildBiome}){
function makeMap(seed){const rand=rng(seed);const rooms=[],byPos=new Map();const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
function add(x,y,type){let room={id:rooms.length,x,y,type,links:{},discovered:false,visited:false,cleared:type==='start',enemies:[],projectiles:[],portals:[],particles:[],chest:null,loot:[],rocks:[],props:[],platforms:[],breakables:[],cave:null,time:0,arenaStarted:false};rooms.push(room);byPos.set(x+','+y,room);return room;}
function connect(a,b){const dx=b.x-a.x,dy=b.y-a.y;let d=dx===1?'right':dx===-1?'left':dy===1?'down':'up',reverse={right:'left',left:'right',up:'down',down:'up'}[d];a.links[d]=b.id;b.links[reverse]=a.id;}
// One downward spine, four five-room regions; branches are dead ends and cannot bypass bosses.
const spine=[add(0,0,'start')];spine[0].spine=true;
for(let depth=1;depth<=20;depth++){const boss=depth%5===0,type=boss?'boss':depth%5===3?'elite':'combat',room=add(0,depth,type);room.spine=true;room.bossStage=boss?depth/5:0;connect(spine[spine.length-1],room);spine.push(room);}
for(let depth=1;depth<=19;depth++){if(depth%5===0)continue;const anchor=spine[depth],side=rand()<.5?-1:1,count=rand()<.68?2:1;for(let branch=0;branch<count;branch++){const dir=branch===0?side:-side,length=1+(rand()<.55?1:0)+(rand()<.15?1:0);let parent=anchor;for(let distance=1;distance<=length;distance++){const x=dir*distance,y=depth;if(byPos.has(x+','+y))break;const leaf=distance===length,room=add(x,y,leaf?'treasure':rand()<.16?'elite':'combat');room.branch=true;room.branchEnd=leaf;room.branchRoot=depth;connect(parent,room);parent=room;}}}
for(const room of rooms){const rr=rng((seed^Math.imul(room.id+1,0x9e3779b1))>>>0);room.rocks=[];// Room silhouettes are seeded and vary between terraces, shafts, bridges and split caverns.
const layouts=[
 // 18 ayrı siluet: basamaklar, yüksek kuleler, köprüler, çatallı yollar ve iniş kuyuları.
 [[92,461,174],[303,404,155],[504,347,149],[710,291,148],[902,231,140]], // yukarı çıkan merdiven
 [[90,229,151],[285,293,152],[495,353,145],[700,410,154],[906,464,142]], // aşağı inen merdiven
 [[105,453,166],[302,353,146],[486,249,150],[674,353,150],[869,453,159]], // merkezi zirve
 [[96,244,157],[301,351,148],[492,457,147],[684,349,153],[890,243,149]], // merkezi çukur
 [[91,461,159],[282,461,150],[464,393,165],[665,393,162],[865,461,164],[463,245,165]], // çift teras
 [[90,452,159],[285,361,139],[480,275,143],[670,362,146],[860,452,153],[479,164,142]], // yüksek kubbe
 [[110,455,155],[295,354,135],[480,451,158],[664,351,139],[851,456,160],[381,243,126],[739,240,127]], // kırık köprü
 [[97,469,176],[306,411,167],[530,411,168],[755,471,165],[435,293,134],[594,218,139]], // asma kat
 [[98,460,159],[290,386,147],[481,311,150],[676,388,150],[866,462,156],[350,208,147],[731,209,142]], // iki galeri
 [[104,452,155],[314,450,141],[513,344,142],[708,450,139],[902,452,145],[420,237,150],[620,231,150]], // sütunlar
 [[93,454,167],[286,346,151],[478,454,159],[681,346,151],[887,454,159],[378,226,147],[776,220,142]], // zikzak
 [[109,470,162],[312,404,154],[517,336,151],[722,404,154],[918,470,121],[307,216,145],[715,216,143]], // kaldera
 [[100,457,180],[333,457,174],[565,457,174],[803,457,173],[220,328,156],[744,328,157],[473,211,171]], // geniş arena
 [[102,459,174],[337,378,161],[578,295,157],[821,213,156],[103,253,155],[819,454,159]], // ters köşe
 [[93,281,158],[297,361,157],[503,453,157],[709,361,157],[914,281,142],[413,188,141],[619,186,141]], // U geçidi
 [[90,464,175],[285,398,158],[480,329,160],[676,262,157],[872,194,156],[101,206,156]], // uzun tırmanış
 [[102,452,165],[306,452,159],[518,452,156],[734,452,153],[928,452,119],[211,317,139],[474,239,151],[759,317,138]], // alçak labirent
 [[94,461,160],[284,387,148],[469,293,156],[674,387,148],[861,461,162],[149,207,141],[832,205,141]] // çatallı kanyon
].map(pattern=>pattern.map(([x,y,w])=>({x,y,w})));
room.stage=Math.min(4,Math.max(1,Math.ceil(Math.max(1,room.y)/5)));room.level=Math.min(4,room.stage);room.biome=['cave','forest','crystal','lava'][room.stage-1];room.cave={seed:(seed^Math.imul(room.id+1,0x45d9f3b))>>>0};room.layout=ri(rr,0,layouts.length-1);room.platforms=room.type==='boss'?[{x:112,y:430,w:210},{x:402,y:354,w:310},{x:797,y:430,w:210},{x:463,y:235,w:194}]:layouts[room.layout].map(p=>({...p,x:p.x+ri(rr,-8,8),y:p.y+ri(rr,-6,6)}));
room.decor=Array.from({length:ri(rr,12,20)},()=>({x:ri(rr,65,W-65),y:ri(rr,90,FLOOR-85),r:ri(rr,5,18),kind:ri(rr,0,2)}));
room.breakables=[];room.props=Array.from({length:room.type==='boss'?1:ri(rr,4,7)},(_,i)=>({x:ri(rr,120,970),y:FLOOR-30,w:30,h:30,hp:36,maxHp:36,alive:true,hit:0,kind:room.biome==='crystal'?'crystal':room.biome==='forest'?'crate':i%2?'crystal':'crate'}));}
for(const room of rooms){room.doors={};for(const [d,id] of Object.entries(room.links)){const neighbor=rooms[id],pair=Math.min(room.id,id)*313+Math.max(room.id,id)*47,choice=(pair+seed)>>>0;room.doors[d]=(d==='left'||d==='right')?{x:d==='left'?49:W-49,y:[FLOOR-65,368,257][choice%3]}:{x:[285,560,830][choice%3],y:d==='up'?47:FLOOR-8};if((d==='left'||d==='right')&&room.doors[d].y<FLOOR-110){const x=d==='left'?39:W-222;room.platforms.push({x,y:room.doors[d].y+43,w:183});}}}
for(const room of rooms){if(room.type==='combat'&&room.spine&&room.y===2)room.type='defense';else if(room.type==='combat'&&room.spine&&room.y===4)room.type='hunt';else if(room.type==='combat'&&room.id>4){const roll=hash2(room.x,room.y,seed+4517)%13;if(roll===0)room.type='defense';else if(roll===1)room.type='hunt';}room.reward=['ammo','xp','mod','health'][hash2(room.x,room.y,seed+671)%4];if(room.branchEnd)room.reward=['mod','xp','health'][hash2(room.x,room.y,seed+223)%3];buildTerrain(room);buildBiome(room);room.merchant=(room.type==='start'||room.type==='treasure'||(room.type==='boss'&&room.bossStage<4))?{x:room.type==='start'?880:room.type==='treasure'?930:890,y:FLOOR}:null;room.wheel=(room.type==='treasure'||(room.type==='combat'&&hash2(room.x,room.y,seed+9823)%5===0))?{x:805,y:FLOOR-20,used:false,spinTime:0}:null;}return rooms;}
return makeMap;
}
root.DropForgeWorld=Object.freeze({rng,ri,clamp,hash2,createMapGenerator});
})(window);
