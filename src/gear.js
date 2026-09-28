'use strict';
/* Run-only equipment: five slots, four coherent builds and full-set bonuses. */
(function(root){
const SLOTS=['helmet','armor','gloves','belt','boots'];
const SLOT_NAMES={helmet:'KASK',armor:'ZIRH',gloves:'ELDİVEN',belt:'KEMER',boots:'BOT'};
const SETS={
 bastion:{name:'KALE',color:'#9dd6ff',bonus:'5 PARÇA: +80 MAKS. CAN',hp:20,speed:0,ammo:0,leech:0},
 runner:{name:'RÜZGÂR',color:'#a4f6c1',bonus:'5 PARÇA: +%15 EK HIZ',hp:0,speed:.055,ammo:0,leech:0},
 arsenal:{name:'CEPHANELİK',color:'#ffd78e',bonus:'5 PARÇA: +%20 EK MERMİ TASARRUFU',hp:0,speed:0,ammo:.055,leech:0},
 vampire:{name:'KANBAĞI',color:'#ee9fc7',bonus:'5 PARÇA: ÖLDÜRMEDE +12 EK CAN',hp:0,speed:0,ammo:0,leech:3}
};
const CHIPS=Object.freeze({steel:{name:'ÇELİK REFLEKS',description:'Hasar öncesi 0,2 sn içinde hareket ettiysen alınan hasar %40 azalır.'},gravity:{name:'YERÇEKİMİ TABAN',description:'Yerdeyken ateş hızı +%25.'},kinetic:{name:'KİNETİK YÜK',description:'Her 10 öldürmeden sonraki atış kritik.'},blood:{name:'KAN KOKUSU',description:'Canı %30 altında olan düşmana ekstra hasar.'},momentum:{name:'MOMENTUM',description:'3 sn koşunca mermi hızı +%20.'},breath:{name:'İKİNCİ NEFES',description:'Can %20 altına düşünce bir kez hız patlaması.'},reflex:{name:'AYNA REFLEKS',description:'Kalkan kırılınca çevreye patlama.'},step:{name:'ÇİFT ADIM',description:'İkinci dash hakkı; ikinci dash %50 mesafe.'}});
function chipStats(chips){const result={hp:0,speed:0,ammo:0,leech:0};for(const id of Object.values(chips||{})){const chip=CHIPS[id];if(!chip)continue;for(const key of Object.keys(result))result[key]+=chip[key]||0;}return result;}
function createGear(set,slot){if(!SETS[set]||!SLOTS.includes(slot))return null;return {set,slot,id:set+'-'+slot};}
function stats(equipment){const result={hp:0,speed:0,ammo:0,leech:0,full:[]};for(const slot of SLOTS){const gear=equipment?.[slot],spec=gear&&SETS[gear.set];if(!spec||gear.slot!==slot)continue;result.hp+=spec.hp;result.speed+=spec.speed;result.ammo+=spec.ammo;result.leech+=spec.leech;}for(const [set,spec] of Object.entries(SETS))if(SLOTS.every(slot=>equipment?.[slot]?.set===set)){result.full.push(set);if(set==='bastion')result.hp+=80;if(set==='runner')result.speed+=.15;if(set==='arsenal')result.ammo+=.2;if(set==='vampire')result.leech+=12;}return result;}
function randomGear(rand=Math.random){const sets=Object.keys(SETS);return createGear(sets[Math.min(sets.length-1,Math.floor(rand()*sets.length))],SLOTS[Math.min(SLOTS.length-1,Math.floor(rand()*SLOTS.length))]);}
// Shared pixel-art silhouettes for the equipment UI and the in-game character.
function drawPiece(ctx,slot,color,x=0,y=0,scale=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#172338';ctx.strokeStyle='#172338';ctx.lineWidth=2;
 const rect=(a,b,w,h)=>{ctx.fillRect(a,b,w,h);ctx.strokeRect(a,b,w,h);};
 ctx.fillStyle=color;
 if(slot==='helmet'){rect(-12,-27,24,8);rect(-14,-21,5,9);rect(9,-21,5,9);rect(-7,-29,14,3);ctx.fillStyle='#e9f8ff';ctx.fillRect(-8,-22,16,3);}
 if(slot==='armor'){rect(-13,-13,26,23);rect(-17,-10,5,11);rect(12,-10,5,11);ctx.fillStyle='#e9f8ff';ctx.fillRect(-7,-9,14,4);ctx.fillStyle='#24364a';ctx.fillRect(-2,-4,4,10);}
 if(slot==='gloves'){rect(-19,-9,7,12);rect(12,-9,7,12);ctx.fillStyle='#e9f8ff';ctx.fillRect(-18,-7,5,3);ctx.fillRect(13,-7,5,3);}
 if(slot==='belt'){rect(-13,9,26,5);ctx.fillStyle='#e9f8ff';ctx.fillRect(-4,9,8,5);ctx.fillStyle='#24364a';ctx.fillRect(-2,10,4,3);}
 if(slot==='boots'){rect(-11,17,10,8);rect(2,17,10,8);ctx.fillStyle='#e9f8ff';ctx.fillRect(-11,23,11,2);ctx.fillRect(2,23,11,2);}
 ctx.restore();
}
function icon(item){if(!item||!SETS[item.set])return '';const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;drawPiece(ctx,item.slot,SETS[item.set].color,32,33,1.6);return canvas.toDataURL('image/png');}
function drawEquipped(ctx,equipment,bob=0,leg=0){for(const slot of ['boots','armor','belt','gloves','helmet']){const item=equipment?.[slot],set=item&&SETS[item.set];if(!set)continue;ctx.save();if(slot==='boots'){ctx.fillStyle=set.color;ctx.fillRect(-10,17+leg,9,7);ctx.fillRect(2,17-leg,9,7);}else{drawPiece(ctx,slot,set.color,0,-bob);}ctx.restore();}}

// Unarmored adult fighter: bare skin and plain white briefs. Armor adds the silhouette piece by piece.
function drawWarrior(ctx,equipment={},bob=0,leg=0,face=1,dashing=false){
 const r=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 const skin='#c88d67',light='#e5b18a',shade='#9c634e',dark='#302b32';
 // Legs and bare feet; boots replace the visible feet when equipped.
 r(shade,-10,10+leg,9,13);r(skin,-9,10+leg,7,12);
 r(shade,2,10-leg,9,13);r(skin,3,10-leg,7,12);
 r(light,-11,21+leg,11,4);r(light,2,21-leg,11,4);
 // White briefs remain visible until the belt or torso armor covers the waist.
 r('#e9edf0',-12,7-bob,24,9);r('#ffffff',-10,8-bob,20,5);
 r('#b5c1cb',-2,9-bob,4,5);
 // Lean, adult torso: unarmored shoulders do not have the armored silhouette.
 r(shade,-12,-13-bob,24,23);r(skin,-11,-12-bob,22,20);
 r(light,-9,-11-bob,8,6);r(light,2,-11-bob,7,6);
 r(shade,-1,-9-bob,2,10);r(shade,-8,0-bob,16,2);
 // Bare arms and hands.
 r(shade,-17,-10-bob,6,15);r(skin,-16,-9-bob,5,14);
 r(shade,11,-10-bob,6,15);r(skin,12,-9-bob,5,14);
 r(light,-17,4-bob,6,4);r(light,11,4-bob,6,4);
 // Adult face, short hair and visible brow; no default helmet or visor.
 r(shade,-11,-27-bob,22,17);r(skin,-10,-26-bob,20,15);
 r(dark,-11,-29-bob,22,6);r(dark,-12,-25-bob,4,6);
 r('#553a35',face>0?3:-8,-20-bob,5,2);
 r('#28303a',face>0?5:-7,-19-bob,3,2);
 r(shade,-4,-13-bob,9,2);
 // Each collected piece replaces the relevant exposed body area.
 drawEquipped(ctx,equipment,bob,leg);
}
root.DropForgeGear=Object.freeze({SLOTS,SLOT_NAMES,SETS,CHIPS,chipStats,createGear,stats,randomGear,drawPiece,icon,drawEquipped,drawWarrior});
})(window);
