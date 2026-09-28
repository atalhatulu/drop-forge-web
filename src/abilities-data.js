'use strict';
/* 13 distinct right-click weapon abilities transitioned into modifiable capabilities. */
(function(root){
const WEAPON_ABILITIES=[
 {id:0,name:'ÜÇLÜ KIVILCIM',cooldown:8,description:'Üç mermilik yaylı atış.'},
 {id:1,name:'HIZ AŞIMI',cooldown:9,description:'3 sn %50 atış hızı.'},
 {id:2,name:'ŞOK DALGASI',cooldown:11,description:'Geri iten yakın alan şoku.'},
 {id:3,name:'PLAZMA MIZRAĞI',cooldown:10,description:'Yüksek hasarlı delici plazma.'},
 {id:4,name:'NÜFUZ ATIŞI',cooldown:12,description:'Tüm hedefleri delip geçen keskin atış.'},
 {id:5,name:'SARSICI ATIŞ',cooldown:8,description:'Ağır sersemleten tek atış.'},
 {id:6,name:'PLAZMA YAĞMURU',cooldown:13,description:'Gökten plazma saçılımı.'},
 {id:7,name:'SÜPÜRME POMPASI',cooldown:10,description:'Geniş açılı süpürme atışı.'},
 {id:8,name:'AVCI İŞARETİ',cooldown:14,description:'Hedefi işaretleyip kritik açar.'},
 {id:9,name:'SERİ AŞIM',cooldown:9,description:'Anlık şarjör boşaltımı.'},
 {id:10,name:'LAZER SÜPÜRME',cooldown:11,description:'Önünü süpüren sürekli lazer.'},
 {id:11,name:'KÜME BOMBA',cooldown:15,description:'Parçalanan patlayıcı küme.'},
 {id:12,name:'ELEKTRİK SIÇRAMASI',cooldown:10,description:'Hedefler arası sıçrayan ark zinciri.'}
];
root.DropForgeAbilities=Object.freeze(WEAPON_ABILITIES);
})(window);
