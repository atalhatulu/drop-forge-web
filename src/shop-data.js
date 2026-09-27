'use strict';
/* Prices and stock catalogs are independent of merchant UI and player state. */
(function(root){
const {MODS,MOD_SLOT_NAMES}=root.DropForgeCatalog;
const SHOP_ITEMS={ammo:{name:'MÜHİMMAT KASASI',price:40,description:'Her iki silaha +5 şarjörlük yedek mermi.'},kit:{name:'SAĞLIK KİTİ',price:55,description:'+1 sağlık kiti. Çanta sınırı 5.'},grenade:{name:'EL BOMBASI',price:35,description:'+1 bomba. Çanta sınırı 3.'},barrel:{name:'GÜÇ NAMLU',price:100,description:'+%18 hasar · Namlu yuvası'},loader:{name:'HIZLI MEKANİZMA',price:130,description:'%20 hızlı atış ve doldurma · Mekanizma yuvası'},core:{name:'FAZ ÇEKİRDEĞİ',price:165,description:'+%25 mermi hızı, +1 delme · Çekirdek yuvası'},stabilizer:{name:'DENGELEYİCİ',price:195,description:'%30 az saçılma · Kabza yuvası'}};
for(const [id,mod] of Object.entries(MODS)){const initial=SHOP_ITEMS[id];SHOP_ITEMS[id]={name:mod.name,price:initial?.price??({0:110,1:145,2:175,3:205}[mod.slot]+(Object.keys(MODS).filter(key=>MODS[key].slot===mod.slot).indexOf(id)*15)),description:mod.description+' · '+MOD_SLOT_NAMES[mod.slot]};}
const PERMANENT_ITEMS={
 hp:{name:'KALICI DAYANIKLILIK',price:4,description:'Her yeni sefer +10 maksimum can · en fazla 3 kez.'},
 kits:{name:'KALICI SAĞLIK ÇANTASI',price:3,description:'Her yeni sefer +1 başlangıç kiti · en fazla 2 kez.'},
 ammo:{name:'KALICI MÜHİMMAT KAPASİTESİ',price:2,description:'Her yeni sefer silah başına +1 şarjör yedek · en fazla 3 kez.'},
 xp:{name:'KALICI USTALIK EĞİTİMİ',price:2,description:'Atölyede seçili silaha +90 kalıcı ustalık XP.'},
 unlock:{name:'YENİ SİLAH RUHSATI',price:6,description:'Henüz açılmamış sıradaki silahı kalıcı olarak açar.'}
};
root.DropForgeShopData=Object.freeze({SHOP_ITEMS,PERMANENT_ITEMS});
})(window);
