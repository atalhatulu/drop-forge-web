/* Immutable combat data; loaded before the main game runtime. */
(function(root){
'use strict';
const PROJECTILE_FAMILIES={
 kinetic:{name:'STANDART',color:'#ffe2a1',trail:'#ff985b',radius:3,life:1.1},
 scatter:{name:'SAÇMALI',color:'#ffcd8c',trail:'#ec815a',radius:2,life:.58},
 pierce:{name:'DELİCİ',color:'#a3e9ff',trail:'#4f9bd8',radius:4,life:1.2},
 plasma:{name:'PLAZMA',color:'#dcb7ff',trail:'#9869ef',radius:5,life:1.0},
 laser:{name:'LAZER',color:'#76fff4',trail:'#29c6e8',radius:3,life:.72},
 explosive:{name:'PATLAYICI',color:'#ffb36d',trail:'#ff6148',radius:6,life:.93},
 arc:{name:'ELEKTRİK',color:'#aff9ff',trail:'#7f90ff',radius:5,life:.92}
};
// Kıvılcım/Vizir/Kısa Volt: standart; Kor/Nova: saçmalı; Yıldız/Uzak Yankı: delici; diğerleri: plazma.
const MODS={
 barrel:{name:'GÜÇ NAMLU',level:2,slot:0,description:'+%18 hasar'},
 rapidBarrel:{name:'SERİ NAMLU',level:2,slot:0,description:'+%12 atış hızı'},
 pierceBarrel:{name:'DELİCİ NAMLU',level:2,slot:0,description:'Kinetikte +1 delme · pompalıda %25 sıkı saçılma · patlayıcıda +%20 alan'},
 loader:{name:'HIZLI MEKANİZMA',level:4,slot:1,description:'%20 hızlı atış ve doldurma'},
 extendedMag:{name:'GENİŞ ŞARJÖR',level:4,slot:1,description:'+%35 şarjör kapasitesi'},
 efficientMechanism:{name:'VERİMLİ MEKANİZMA',level:4,slot:1,description:'%15 mühimmat tasarrufu'},
 core:{name:'FAZ ÇEKİRDEĞİ',level:6,slot:2,description:'+%25 hız · kinetikte +1 delme · enerjide +%25 alan'},
 shockCore:{name:'ŞOK ÇEKİRDEĞİ',level:6,slot:2,description:'+%12 isabet hasarı; yakın düşmana zincir'},
 burnCore:{name:'YANICI ÇEKİRDEK',level:6,slot:2,description:'İsabetten sonra 3 sn yanma'},
 stabilizer:{name:'DENGELEYİCİ',level:8,slot:3,description:'%30 daha az saçılma'},
 lightGrip:{name:'HAFİF KABZA',level:8,slot:3,description:'Hareketli atış bonusu +%25'},
 heavyGrip:{name:'AĞIR KABZA',level:8,slot:3,description:'%35 az geri tepme · isabette daha uzun sarsılma'}
};
const MOD_SLOT_NAMES=['NAMLU · HASAR / ATIŞ / DELME','MEKANİZMA · HIZ / ŞARJÖR / TASARRUF','ÇEKİRDEK · FAZ / ŞOK / YANMA','KABZA · DENGE / HAREKET / TEPKİ'];
const WEAPON_PROJECTILES=['kinetic','kinetic','scatter','plasma','pierce','kinetic','plasma','scatter','pierce','plasma','laser','explosive','arc'];
const WEAPON_TYPES=['TABANCA','HAFİF OTOMATİK','POMPALI','ENERJİ TÜFEĞİ','KESKİN NİŞANCI','AĞIR TABANCA','ENERJİ OTOMATİĞİ','POMPALI','KESKİN NİŞANCI','HAFİF OTOMATİK','LAZER TÜFEĞİ','PATLAYICI ATAR','ARK TÜFEĞİ'];
const WEAPON_FIRE_RATES=[.23,.115,.39,.14,.72,.3,.145,.48,.65,.095,.105,.82,.24];
const WEAPON_DAMAGE=[21,12,11,15,75,34,14,12,62,11,10,52,22];
root.DropForgeCatalog=Object.freeze({PROJECTILE_FAMILIES,MODS,MOD_SLOT_NAMES,WEAPON_PROJECTILES,WEAPON_TYPES,WEAPON_FIRE_RATES,WEAPON_DAMAGE});
})(window);
