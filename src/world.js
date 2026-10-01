'use strict';
/* Seeded map generation is isolated from the active game and rendering loop. */
(function(root){
function rng(seed){let a=(seed>>>0)||1;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const ri=(r,a,b)=>a+Math.floor(r()*(b-a+1)),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hash2(ix,iy,seed){let h=(seed^Math.imul(ix,374761393)^Math.imul(iy,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177);return (h^(h>>>16))>>>0;}
function createMapGenerator({W,FLOOR,buildTerrain,buildBiome}){
function makeMap(seed){const rand=rng(seed);const rooms=[],byPos=new Map();const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
// Placement and topology are separate: touching rooms do not gain an implicit door.
function occupied(x,y,w=1,h=1){for(const room of rooms)if(x<room.x+(room.mapW||1)&&x+w>room.x&&y<room.y+(room.mapH||1)&&y+h>room.y)return true;return false;}
function add(x,y,type,w=1,h=1){if(occupied(x,y,w,h))return null;let room={id:rooms.length,x,y,mapW:w,mapH:h,type,links:{},discovered:false,visited:false,cleared:type==='start',enemies:[],projectiles:[],portals:[],particles:[],chest:null,loot:[],rocks:[],props:[],platforms:[],breakables:[],cave:null,time:0,arenaStarted:false};rooms.push(room);for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)byPos.set(xx+','+yy,room);return room;}
const reverseDir={right:'left',left:'right',up:'down',down:'up'};
function connect(a,b){if(!a||!b||a===b)return false;const dx=b.x-a.x,dy=b.y-a.y,d=dx===1&&dy===0?'right':dx===-1&&dy===0?'left':dx===0&&dy===1?'down':dx===0&&dy===-1?'up':null;if(!d)return false;const reverse=reverseDir[d];if((a.links[d]!==undefined&&a.links[d]!==b.id)||(b.links[reverse]!==undefined&&b.links[reverse]!==a.id))return false;a.links[d]=b.id;b.links[reverse]=a.id;return true;}
function validateTopology(){const seen=new Set([0]),queue=[0];for(let i=0;i<queue.length;i++){const room=rooms[queue[i]];for(const [dir,id] of Object.entries(room.links)){const neighbor=rooms[id],dx=neighbor?.x-room.x,dy=neighbor?.y-room.y,expected=dir==='right'?[1,0]:dir==='left'?[-1,0]:dir==='down'?[0,1]:[0,-1];if(!neighbor||dx!==expected[0]||dy!==expected[1]||neighbor.links[reverseDir[dir]]!==room.id)throw new Error('Invalid room connection '+room.id+' '+dir);if(!seen.has(id)){seen.add(id);queue.push(id);}}}if(seen.size!==rooms.length)throw new Error('Unreachable rooms: '+(rooms.length-seen.size));}

// Twenty central rooms preserve boss progression; lateral routes extend at most three rooms.
const spine=[add(0,0,'start')];spine[0].spine=true;
for(let depth=1;depth<=20;depth++){const boss=depth%5===0,type=boss?'boss':depth%5===3?'elite':'combat',room=add(0,depth,type);room.spine=true;room.bossStage=boss?depth/5:0;connect(spine[spine.length-1],room);spine.push(room);}
// Alternate branch directions at adjacent depths to leave room for genuine side forks.
// Three distinct first-biome terminals provide the required boss keys.
const anchors=[1,3,4,6,8,9,11,13,14,16,18,19];
for(const depth of anchors){
 const anchor=spine[depth],side=(depth===1||depth===4||depth===8||depth===11||depth===14||depth===18)?1:-1;
 const length=depth<=4?2+ri(rand,0,1):1+ri(rand,0,2);
 let parent=anchor;
 for(let distance=1;distance<=length;distance++){
  const x=side*distance,y=depth,key=x+','+y;if(byPos.has(key))break;
  const room=add(x,y,'combat');if(!room||!connect(parent,room))break;room.branch=true;room.branchRoot=depth;parent=room;
 }
 // A second route can peel off the side corridor, instead of every branch ending in loot.
 if(depth<19&&rand()<.78){
  const forkX=side*(length>=2?2:1),forkY=depth+1,from=byPos.get(forkX+','+depth);
  if(from&&!byPos.has(forkX+','+forkY)){
   const fork=add(forkX,forkY,'combat');if(!fork||!connect(from,fork))continue;fork.branch=true;fork.branchRoot=depth;
   if(Math.abs(forkX)<3&&rand()<.62&&!byPos.has((forkX+side)+','+forkY)){
    const tip=add(forkX+side,forkY,'combat');if(tip&&connect(fork,tip)){tip.branch=true;tip.branchRoot=depth;}
   }
  }
 }
}
// A terminal is a navigation property, not automatically a treasure room.
validateTopology();
for(const room of rooms)if(room.branch){room.branchEnd=Object.keys(room.links).length===1;if(room.branchEnd&&rand()<.22)room.type='treasure';else if(rand()<.15)room.type='elite';}
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
 [[94,461,160],[284,387,148],[469,293,156],[674,387,148],[861,461,162],[149,207,141],[832,205,141]], // çatallı kanyon
 [[145,415,215],[765,415,215],[445,310,225],[455,205,205]], // merkezi kule ve iki siper
 [[100,470,230],[405,405,310],[790,470,225],[170,270,175],[770,265,170]], // geniş çapraz köprü
 [[90,255,200],[370,460,160],[605,460,160],[850,255,180],[443,322,235]], // iki yüksek balkon
 [[150,470,145],[330,375,160],[530,280,140],[720,375,160],[890,470,145]] // merkez yükseltisi
].map(pattern=>pattern.map(([x,y,w])=>({x,y,w})));
room.stage=Math.min(4,Math.max(1,Math.ceil(Math.max(1,room.y)/5)));room.level=Math.min(4,room.stage);room.biome=['cave','forest','crystal','lava'][room.stage-1];room.cave={seed:(seed^Math.imul(room.id+1,0x45d9f3b))>>>0};room.arenaProfile=room.type==='elite'||room.type==='assault'?'crossfire':room.type==='treasure'?'vault':room.type==='boss'?'boss':room.type==='combat'&&rr()<.35?'vertical':'cavern';room.layout=room.arenaProfile==='crossfire'?18+ri(rr,0,3):room.arenaProfile==='vertical'?ri(rr,0,5):ri(rr,0,layouts.length-1);room.platforms=room.type==='boss'?[{x:112,y:430,w:210},{x:402,y:354,w:310},{x:797,y:430,w:210},{x:463,y:235,w:194}]:layouts[room.layout].map(p=>({...p,x:p.x+ri(rr,-8,8),y:p.y+ri(rr,-6,6)}));
room.decor=Array.from({length:ri(rr,12,20)},()=>({x:ri(rr,65,W-65),y:ri(rr,90,FLOOR-85),r:ri(rr,5,18),kind:ri(rr,0,2)}));
room.breakables=[];room.props=Array.from({length:room.type==='boss'?1:ri(rr,4,7)},(_,i)=>({x:ri(rr,120,970),y:FLOOR-30,w:30,h:30,hp:36,maxHp:36,alive:true,hit:0,kind:room.biome==='crystal'?'crystal':room.biome==='forest'?'crate':i%2?'crystal':'crate'}));}
for(const room of rooms){room.doors={};for(const [d,id] of Object.entries(room.links)){const neighbor=rooms[id],pair=Math.min(room.id,id)*313+Math.max(room.id,id)*47,choice=(pair+seed)>>>0;room.doors[d]=(d==='left'||d==='right')?{x:d==='left'?49:W-49,y:[FLOOR-65,368,257][choice%3]}:{x:[285,560,830][choice%3],y:d==='up'?47:FLOOR-8};if((d==='left'||d==='right')&&room.doors[d].y<FLOOR-110){const x=d==='left'?39:W-222,ledgeY=room.doors[d].y+43;room.platforms.push({x,y:ledgeY,w:183});if(ledgeY<FLOOR-200){const stepX=d==='left'?198:W-353;room.platforms.push({x:stepX,y:Math.min(FLOOR-124,ledgeY+125),w:156});}}}}
for(let stage=1;stage<=4;stage++){const candidates=rooms.filter(room=>room.branchEnd&&room.stage===stage&&room.type!=='boss').sort((a,b)=>a.y-b.y||a.id-b.id);const required=[1,2,2,3][stage-1];if(candidates.length<required)throw new Error('Region '+stage+' needs '+required+' reachable key rooms');for(const room of candidates.slice(0,required)){room.bossKey=true;room.keyStage=stage;}if(stage===1){const mini=rooms.find(room=>room.stage===1&&room.branch&&!room.bossKey&&room.type!=='boss')||candidates[0];for(const room of candidates.slice(0,required))room.bossKey=false;mini.bossKey=true;mini.keyStage=1;mini.type='miniboss';mini.miniBossKind='brute';}if(stage===3){const defense=rooms.find(room=>room.stage===3&&room.spine&&room.type==='combat')||rooms.find(room=>room.stage===3&&room.spine&&room.type==='defense');if(defense){defense.type='defense';defense.bossDefenseRequired=true;}}}
// Guarantee the first region contains a chest-bearing treasure detour after key assignment.
if(!rooms.some(room=>room.stage===1&&room.type==='treasure')){const treasure=rooms.filter(room=>room.stage===1&&room.branchEnd&&!room.bossKey&&room.type!=='miniboss').sort((a,b)=>hash2(a.x,a.y,seed+5831)-hash2(b.x,b.y,seed+5831))[0];if(!treasure)throw new Error('Region 1 needs a non-key treasure terminal');treasure.type='treasure';}
for(const room of rooms){if(room.type==='combat'&&room.spine&&room.y===2)room.type='defense';else if(room.type==='combat'&&room.spine&&room.y===4)room.type='hunt';else if(room.type==='combat'&&room.id>4){const roll=hash2(room.x,room.y,seed+4517)%13;if(roll===0)room.type='defense';else if(roll===1)room.type='hunt';else if(roll===2)room.type='assault';else if(roll===3&&room.branchEnd&&!room.bossKey)room.type='gold';}if(room.branch&&!room.bossKey&&room.type==='elite'&&hash2(room.x,room.y,seed+1307)%3===0){room.type='miniboss';room.miniBossKind=['brute','warlock','riftcaller','brute'][room.stage-1];}room.reward=room.type==='gold'?'gold':['ammo','xp','mod','health'][hash2(room.x,room.y,seed+671)%4];buildTerrain(room);buildBiome(room);room.merchant=(room.type==='start'||room.type==='treasure'||room.type==='gold'||(room.type==='boss'&&room.bossStage<4))?{x:room.type==='start'?880:room.type==='treasure'?930:890,y:FLOOR}:null;room.wheel=(room.type==='treasure'&&hash2(room.x,room.y,seed+9823)%4===0)?{x:805,y:FLOOR-20,used:false,spinTime:0}:null;}// Rare, optional secret alcoves on side routes; each run has at most two.
const secretCandidates=rooms.filter(room=>room.branch&&!room.bossKey&&room.type!=='boss'&&room.type!=='miniboss'&&room.type!=='treasure'&&room.type!=='gold'&&room.type!=='start').sort((a,b)=>hash2(a.x,a.y,seed+7401)-hash2(b.x,b.y,seed+7401));
const firstBiomeSecret=secretCandidates.find(room=>room.stage===1)||rooms.find(room=>room.stage===1&&room.type!=='boss'&&room.type!=='start'&&!room.bossKey);const chosenSecrets=[...(firstBiomeSecret?[firstBiomeSecret]:[]),...secretCandidates.filter(room=>room!==firstBiomeSecret)].slice(0,Math.max(1,Math.min(secretCandidates.length,1+hash2(seed,31,7402)%2)));for(const room of chosenSecrets){room.secret={x:hash2(room.x,room.y,seed+7403)%2?185:935,opened:false,kind:room===firstBiomeSecret?'module':['gold','wheel','chest'][hash2(room.x,room.y,seed+7404)%3]};}
// A separate guaranteed rune alcove is placed after the first-biome module alcove.
const runeCandidates=rooms.filter(room=>room.branch&&!room.secret&&!room.bossKey&&room.stage>=2&&room.type!=='boss'&&room.type!=='miniboss'&&room.type!=='start').sort((a,b)=>hash2(a.x,a.y,seed+7417)-hash2(b.x,b.y,seed+7417));const runeRoom=runeCandidates[0]||rooms.find(room=>room.stage>=2&&!room.secret&&!room.bossKey&&room.type!=='boss'&&room.type!=='start');if(runeRoom)runeRoom.secret={x:hash2(runeRoom.x,runeRoom.y,seed+7418)%2?185:935,opened:false,kind:'rune'};
// Each run draws only a small subset of the event pool. Never replace key or boss rooms.
const eventPool=['defense','hunt','assault','treasure','elite'],eventCandidates=rooms.filter(room=>room.branch&&!room.bossKey&&(room.type==='combat'||room.type==='elite')&&!room.miniEvent).sort((a,b)=>hash2(a.x,a.y,seed+1821)-hash2(b.x,b.y,seed+1821));
const eventCount=Math.min(eventCandidates.length,2+hash2(seed,17,903)%3),usedEvents=new Set();
for(const room of eventCandidates.slice(0,eventCount)){const available=eventPool.filter(kind=>!usedEvents.has(kind));const pool=available.length?available:eventPool,kind=pool[hash2(room.x,room.y,seed+1822)%pool.length];usedEvents.add(kind);room.type=kind;room.miniEvent=true;room.eventKind=kind;room.eventTitle=({defense:'ACİL JENERATÖR',hunt:'KAÇAK HEDEF',assault:'PUSU',treasure:'KAYIP İKMALAT',elite:'ELİT NÖBETİ'})[kind];if(kind==='treasure'){room.reward='gold';room.merchant=null;room.wheel=null;}else if(kind==='defense')room.eventDuration=14+hash2(room.x,room.y,seed+1823)%7;}
// One optional side route per expedition is reserved for a blueprint-only clear reward.
const blueprintRooms=rooms.filter(room=>room.branch&&!room.bossKey&&!room.miniEvent&&!room.secret&&!['boss','miniboss','treasure','gold','start'].includes(room.type)).sort((a,b)=>hash2(a.x,a.y,seed+1881)-hash2(b.x,b.y,seed+1881));
const blueprintRoom=blueprintRooms[0]||rooms.filter(room=>room.branch&&!room.bossKey&&!room.secret&&!['boss','miniboss','treasure','gold','start'].includes(room.type)).sort((a,b)=>hash2(a.x,a.y,seed+1882)-hash2(b.x,b.y,seed+1882))[0];
if(blueprintRoom){blueprintRoom.blueprintRoom=true;blueprintRoom.reward='blueprint';blueprintRoom.miniEvent=false;blueprintRoom.eventKind=null;blueprintRoom.eventTitle=null;}
return rooms;}
return makeMap;
}
root.DropForgeWorld=Object.freeze({rng,ri,clamp,hash2,createMapGenerator});
})(window);
