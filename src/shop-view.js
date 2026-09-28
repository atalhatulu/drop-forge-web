'use strict';
/* Shop eligibility and markup, independent of overlay and purchase side effects. */
(function(root){
function createShopView({getGame,getLegacy,getUnlockedWeapons,WEAPON_NAMES,PERMANENT_ITEMS,SHOP_ITEMS,AMMO_MAX,MODS,masteryLevel,$}){
function nextLockedWeapon(){return WEAPON_NAMES.findIndex((_,id)=>!getUnlockedWeapons().has(id));}
function shopCanBuy(id){
 const game=getGame();if(!game)return false;
 if(game.rooms[game.roomId]?.merchant?.permanent){const item=PERMANENT_ITEMS[id];if(!item||getLegacy().marks<item.price)return false;if(id==='hp')return getLegacy().hp<3;if(id==='kits')return getLegacy().kits<2;if(id==='ammo')return getLegacy().ammo<3;if(id==='xp')return game.player.weapon!==null&&masteryLevel(game.player.weapon)<10;if(id==='unlock')return nextLockedWeapon()>=0;return false;}
 if(!SHOP_ITEMS[id])return false;const p=game.player;if(p.gold<SHOP_ITEMS[id].price)return false;if(id==='kit')return p.kits<5;if(id==='grenade')return p.grenades<3;if(id==='ammo')return p.slots.some(q=>q&&q.reserve<AMMO_MAX[q.weapon]);if(MODS[id])return game.stashedMods.length<12&&p.slots.some(q=>q&&masteryLevel(q.weapon)>=MODS[id].level&&q.mods[MODS[id].slot]!==id);return false;
}
function renderShop(){
 const game=getGame();if(!game)return;const permanent=!!game.rooms[game.roomId]?.merchant?.permanent,items=permanent?PERMANENT_ITEMS:SHOP_ITEMS;
 $('shopTitle').textContent=permanent?'◆ KALICI GELİŞİM USTASI':'◆ SEFER TÜCCARI';
 $('shopDescription').textContent=permanent?'Kalıcı Çekirdek: her 5 düşmanda +1, boss başına +3, elit/av odası ve hazine odası başına +1. Alınan gelişimler ölümden sonra korunur.':'Buradan aldığın kitler, mühimmat, bombalar ve eklentiler yalnızca bu sefere aittir. Takılı eklenti sadece takıldığı silahı etkiler; çantadaki parçayı uyumlu başka bir silaha taşıyabilirsin.';
 $('shopGold').textContent=permanent?'KALICI ÇEKİRDEK · '+getLegacy().marks+' · BU SEFER +'+(game.earnedCores||0):'SEFER ALTINI · '+game.player.gold+' · ÇEKİRDEKLER KALICI: '+getLegacy().marks;
 $('shopItems').innerHTML=Object.entries(items).map(([id,item])=>'<button class="shopItem" data-shop-item="'+id+'" '+(shopCanBuy(id)?'':'disabled')+'><span class="shopName">'+item.name+'</span><span class="shopDescription">'+item.description+'</span><strong>◆ '+item.price+(permanent?' ÇEKİRDEK':' ALTIN')+'</strong></button>').join('');
}

return {nextLockedWeapon,shopCanBuy,renderShop};
}
root.DropForgeShopView=Object.freeze({createShopView});
})(window);
