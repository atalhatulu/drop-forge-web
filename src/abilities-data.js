'use strict';
/* Gun-specific powers share combat state but their definitions do not. */
(function(root){
const WEAPON_ABILITIES=[
 {name:'ÜÇLÜ ATIŞ',cooldown:8,description:'Tek tıkla üç kinetik mermi.'},
 {name:'HIZ AŞIMI',cooldown:12,description:'2,2 saniye daha hızlı atış.'},
 {name:'ŞOK DALGASI',cooldown:10,description:'Önündeki düşmanları geri iter.'},
 {name:'PLAZMA MIZRAĞI',cooldown:11,description:'Delici ve geniş etkili enerji atışı.'},
 {name:'NÜFUZ ATIŞI',cooldown:13,description:'Beş düşmana kadar delici ağır mermi.'},
 {name:'SARSICI ATIŞ',cooldown:9,description:'Hedefi uzun süre sarsan ağır atış.'},
 {name:'PLAZMA YAĞMURU',cooldown:12,description:'Üç enerji mermisi aynı anda.'},
 {name:'SÜPÜRME',cooldown:10,description:'Geniş açıya dokuz saçma.'},
 {name:'AVCI İŞARETİ',cooldown:14,description:'Hedefi işaretle; bu silahtan %35 ek hasar.'},
 {name:'SERİ AŞIM',cooldown:9,description:'Tek sağ tıkla dört hızlı mermi.'},
 {name:'LAZER SÜPÜRME',cooldown:11,description:'Üç delici lazer hattı.'},
 {name:'KÜME BOMBA',cooldown:15,description:'Üç patlayıcı mermiyi yayar.'},
 {name:'ELEKTRİK SIÇRAMASI',cooldown:12,description:'Yakındaki dört düşmana zincir darbesi.'}
];
root.DropForgeAbilities=Object.freeze(WEAPON_ABILITIES.map(ability=>Object.freeze(ability)));
})(window);
