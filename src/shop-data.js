'use strict';
/* Prices and stock catalogs are independent of merchant UI and player state. */
(function(root){
const {MODS,MOD_SLOT_NAMES}=root.DropForgeCatalog;
const SHOP_ITEMS={
 kit:{name:'SAĞLIK KİTİ',price:55,description:'+1 sağlık kiti · en fazla 3.'},
 ammo:{name:'MÜHİMMAT KASASI',price:45,description:'İki silaha +5 şarjörlük yedek mermi.'},
 grenade:{name:'EL BOMBASI',price:40,description:'+1 el bombası · en fazla 3.'},
 patch:{name:'ACİL SAHA TEDAVİSİ',price:65,description:'Anında 65 can yeniler; çantada yer kaplamaz.'}
};
const PERMANENT_ITEMS={
 hp:{name:'KALICI DAYANIKLILIK',price:4,description:'Her yeni sefer +10 maksimum can · en fazla 3 kez.'},
 kits:{name:'KALICI SAĞLIK ÇANTASI',price:3,description:'Her yeni sefer +1 başlangıç kiti · en fazla 2 kez.'},
 ammo:{name:'KALICI MÜHİMMAT KAPASİTESİ',price:2,description:'Her yeni sefer silah başına +1 şarjör yedek · en fazla 3 kez.'},
 xp:{name:'KALICI USTALIK EĞİTİMİ',price:2,description:'Atölyede seçili silaha +90 kalıcı ustalık XP.'},
 unlock:{name:'YENİ SİLAH RUHSATI',price:6,description:'Henüz açılmamış sıradaki silahı kalıcı olarak açar.'}
};
root.DropForgeShopData=Object.freeze({SHOP_ITEMS,PERMANENT_ITEMS});
})(window);
