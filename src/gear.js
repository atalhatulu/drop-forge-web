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
root.DropForgeGear=Object.freeze({SLOTS,SLOT_NAMES,SETS,createGear,stats,randomGear});
})(window);
