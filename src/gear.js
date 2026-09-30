'use strict';
/* Run-only equipment: five slots, four coherent builds and full-set bonuses. */
(function(root){
const SLOTS=['helmet','armor','gloves','belt','boots'];
const SLOT_NAMES={helmet:'KASK',armor:'ZIRH',gloves:'ELDİVEN',belt:'KEMER',boots:'BOT'};
const SETS={
 bastion:{name:'KALE',color:'#9dd6ff',bonus:'5 PARÇA: HASAR SONRASI ZIRH',hp:20,speed:0,ammo:0,leech:0},
 runner:{name:'RÜZGÂR',color:'#a4f6c1',bonus:'5 PARÇA: DASH SONRASI HIZLI ATIŞ',hp:0,speed:.055,ammo:0,leech:0},
 arsenal:{name:'CEPHANELİK',color:'#ffd78e',bonus:'5 PARÇA: MÜHİMMAT KUTUSU +%50',hp:0,speed:0,ammo:.055,leech:0},
 vampire:{name:'KANBAĞI',color:'#ee9fc7',bonus:'5 PARÇA: ÖLDÜRMEDE +3 CAN',hp:0,speed:0,ammo:0,leech:0}
};
const CHIPS=Object.freeze({
 steel:{name:'ÇELİK REFLEKS',description:'Hasar öncesi 0,2 sn içinde hareket ettiysen alınan hasar %40 azalır.',slots:['armor','boots']},gravity:{name:'YERÇEKİMİ TABAN',description:'Yerdeyken ateş hızı +%25.',slots:['boots']},kinetic:{name:'KİNETİK YÜK',description:'Her 10 öldürmeden sonraki atış kritik.',slots:['gloves']},blood:{name:'KAN KOKUSU',description:'Canı %30 altında olan düşmana ekstra hasar.',slots:['helmet']},momentum:{name:'MOMENTUM',description:'3 sn koşunca mermi hızı +%20.',slots:['belt','boots']},breath:{name:'İKİNCİ NEFES',description:'Can %20 altına düşünce bir kez hız patlaması.',slots:['armor']},reflex:{name:'AYNA REFLEKS',description:'Kalkan kırılınca çevreye patlama.',slots:['armor','gloves']},step:{name:'ÇİFT ADIM',description:'İkinci dash hakkı; ikinci dash %50 mesafe.',slots:['boots']},
 pickupMagnet:{name:'MANYETİK KEMER',description:'Yakındaki altın, mühimmat ve ganimet sana doğru çekilir.',slots:['belt']},mirrorPlate:{name:'AYNA GÖĞÜSLÜĞÜ',description:'Hasar alınca yakındaki düşmana hasarın %45’ini yansıtır. 3 sn bekleme.',slots:['armor']},dashRam:{name:'KOÇ BOTLARI',description:'Dash ile çarptığın düşmanı hasar verip savurur.',slots:['boots','gloves']},impactSole:{name:'SERT İNİŞ',description:'Yüksekten yere indiğinde yakındaki düşmanları sarsar.',slots:['boots']},finisherSight:{name:'AVCI VİZÖRÜ',description:'Finisher menzili artar; menzildeki sersem düşman belirginleşir.',slots:['helmet']},finisherHarvest:{name:'HASAT ELDİVENİ',description:'Finisher yaptığında 12 can yeniler.',slots:['gloves']},finisherStep:{name:'İNFaz TOKASI',description:'Finisher sonrası bir dash hakkın yenilenir.',slots:['belt','boots']},lastStand:{name:'SON SAVUNMA',description:'Canın kritik seviyeye indiğinde ilk darbeyi kısmen emer. Oda başına bir kez.',slots:['armor']},ammoScavenger:{name:'YAĞMACI KESESİ',description:'Mühimmat ganimeti daha fazla cephane verir.',slots:['belt']},counterPulse:{name:'KARŞI DARBE',description:'Hasar aldığında yakındaki düşmanları kısa süre sersemletir.',slots:['armor','gloves']},vaultSpring:{name:'SIÇRAMA YAYI',description:'Havadayken bir ek zıplama hakkı kazanırsın.',slots:['boots']},
 guardCapacitor:{name:'KORUYUCU KAPASİTÖR',description:'Dash sonrası 1,1 sn boyunca alınan hasar %35 azalır.',slots:['armor','gloves']},
 phaseBattery:{name:'FAZ BATARYASI',description:'Her dash sonraki darbede 18 hasar emer.',slots:['armor','belt']},
 executionReservoir:{name:'İNFaz HAZNESİ',description:'Finisher sonrası aktif silahına 4 mermi geri yükler.',slots:['gloves','belt']},
});
function chipStats(chips){const result={hp:0,speed:0,ammo:0,leech:0};for(const id of Object.values(chips||{})){const chip=CHIPS[id];if(!chip)continue;for(const key of Object.keys(result))result[key]+=chip[key]||0;}return result;}
function createGear(set,slot){if(!SETS[set]||!SLOTS.includes(slot))return null;return {set,slot,id:set+'-'+slot};}
function stats(equipment){const result={hp:0,speed:0,ammo:0,leech:0,full:[]};for(const slot of SLOTS){const gear=equipment?.[slot],spec=gear&&SETS[gear.set];if(!spec||gear.slot!==slot)continue;result.hp+=spec.hp;result.speed+=spec.speed;result.ammo+=spec.ammo;result.leech+=spec.leech;}for(const [set] of Object.entries(SETS))if(SLOTS.every(slot=>equipment?.[slot]?.set===set))result.full.push(set);return result;}
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

// A compact sci-fi salvage runner. Equipment recolors and layers onto this shared silhouette.
function drawWarrior(ctx,equipment={},bob=0,leg=0,face=1,dashing=false){
 const r=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
 const ink='#101b29',shadow='#1b2c3c',steel='#344b5d',edge='#637d8c',light='#9fb6bd',glow='#75e7e2',warm='#f2bf67';
 // Reinforced boots and articulated legs keep the runner readable while moving.
 r(ink,-12,17+leg,12,9);r(shadow,-10,12+leg,9,9);r(steel,-9,13+leg,6,6);r(warm,-9,20+leg,5,2);r(ink,-13,24+leg,14,4);r(light,-11,25+leg,10,1);
 r(ink,1,17-leg,12,9);r(shadow,3,12-leg,9,9);r(steel,4,13-leg,6,6);r(warm,4,20-leg,5,2);r(ink,0,24-leg,14,4);r(light,2,25-leg,10,1);
 // Dark undersuit, chest plate, shoulder guards and a compact utility belt.
 r(ink,-13,-14-bob,26,25);r(shadow,-10,-12-bob,20,19);r(steel,-9,-11-bob,18,12);r(edge,-8,-11-bob,16,2);
 r('#24394a',-7,-8-bob,14,8);r(glow,-2,-8-bob,4,8);r('#b4d1d0',-1,-7-bob,2,4);
 r(ink,-17,-11-bob,7,9);r(steel,-16,-10-bob,6,6);r(warm,-15,-10-bob,3,2);
 r(ink,10,-11-bob,7,9);r(steel,10,-10-bob,6,6);r(warm,12,-10-bob,3,2);
 r(shadow,-15,-3-bob,5,12);r(steel,-14,-2-bob,3,8);r(shadow,10,-3-bob,5,12);r(steel,11,-2-bob,3,8);
 r(ink,-13,6-bob,26,5);r(warm,-3,7-bob,6,4);r('#fff0b2',-1,8-bob,2,2);
 r(ink,-17,5-bob,6,5);r(steel,-16,5-bob,4,4);r(ink,11,5-bob,6,5);r(steel,12,5-bob,4,4);
 // Small salvage pack and hose sit behind the shoulders.
 r(ink,-20,-10-bob,5,17);r('#283c4b',-19,-8-bob,3,11);r(glow,-19,-5-bob,2,3);r(warm,-19,4-bob,2,3);
 // Sealed helmet with a broad luminous visor; no exposed face or hair.
 r(ink,-12,-29-bob,24,19);r(steel,-10,-28-bob,20,4);r(edge,-7,-30-bob,14,3);r('#192d3d',-10,-23-bob,20,9);
 r(glow,-9,-22-bob,18,5);r('#d7ffff',-7,-21-bob,12,2);r('#3b9ea9',5,-20-bob,4,2);
 r(warm,-13,-22-bob,3,6);r('#fff0b2',-12,-21-bob,1,3);r(ink,-8,-13-bob,16,3);
 if(dashing){const trail=-face;r('#d8ffff',trail*20,-3-bob,4,9);r(glow,trail*23,0-bob,3,7);}
 // Collected pieces keep their set colors and layer over the base suit.
 drawEquipped(ctx,equipment,bob,leg);
}
root.DropForgeGear=Object.freeze({SLOTS,SLOT_NAMES,SETS,CHIPS,chipStats,createGear,stats,randomGear,drawPiece,icon,drawEquipped,drawWarrior});
})(window);
