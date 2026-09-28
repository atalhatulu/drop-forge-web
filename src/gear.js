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
root.DropForgeGear=Object.freeze({SLOTS,SLOT_NAMES,SETS,createGear,stats,randomGear,drawPiece,icon,drawEquipped});
})(window);
