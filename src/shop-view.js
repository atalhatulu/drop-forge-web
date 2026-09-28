'use strict';
/* Shop eligibility and markup, independent of overlay and purchase side effects. */
(function(root){
function createShopView({getGame,getLegacy,getUnlockedWeapons,WEAPON_NAMES,PERMANENT_ITEMS,SHOP_ITEMS,AMMO_MAX,MODS,masteryLevel,$}){
function nextLockedWeapon(){return WEAPON_NAMES.findIndex((_,id)=>!getUnlockedWeapons().has(id));}
function shopCanBuy(id){
 const game=getGame();if(!game)return false;
 if(game.rooms?.[game.roomId]?.merchant?.permanent){const item=PERMANENT_ITEMS[id];if(!item||getLegacy().marks<item.price)return false;if(id==='hp')return getLegacy().hp<3;if(id==='kits')return getLegacy().kits<2;if(id==='ammo')return getLegacy().ammo<3;if(id==='xp')return game.player.weapon!==null&&masteryLevel(game.player.weapon)<10;if(id==='unlock')return nextLockedWeapon()>=0;return false;}
 if(!SHOP_ITEMS[id])return false;const p=game.player;if(p.gold<SHOP_ITEMS[id].price)return false;if(id==='kit')return p.kits<5;if(id==='grenade')return p.grenades<3;if(id==='ammo')return p.slots.some(q=>q&&q.reserve<AMMO_MAX[q.weapon]);if(MODS[id])return game.stashedMods.length<12&&p.slots.some(q=>q&&masteryLevel(q.weapon)>=MODS[id].level&&q.mods[MODS[id].slot]!==id);return false;
}
function renderShop(){
 const game=getGame();if(!game)return;const permanent=!!game.rooms?.[game.roomId]?.merchant?.permanent,items=permanent?PERMANENT_ITEMS:SHOP_ITEMS;
 $('shopTitle').textContent=permanent?'◆ KALICI GELİŞİM USTASI':'◆ SEFER TÜCCARI';
 $('shopDescription').textContent=permanent?'KALICI · Aldıkların tüm seferlerde geçerli.':'BU SEFERLİK · Aldıkların sefer bitince sıfırlanır.';
 $('shopGold').textContent=permanent?'◆ '+getLegacy().marks+' ÇEKİRDEK':'◆ '+game.player.gold+' ALTIN';
 const icons={hp:'♥',kits:'✚',ammo:'▣',xp:'★',unlock:'⚒',kit:'✚',grenade:'✹',barrel:'▰',loader:'↻',core:'◇',stabilizer:'⊕'};const effect={hp:'+10 MAKS. CAN',kits:'+1 BAŞLANGIÇ KİTİ',ammo:'+1 YEDEK ŞARJÖR',xp:'+90 SİLAH XP',unlock:'YENİ SİLAH AÇ',kit:'+1 SAĞLIK KİTİ',grenade:'+1 BOMBA'};$('shopItems').innerHTML=Object.entries(items).map(([id,item])=>{const available=shopCanBuy(id),price=item.price,currency=permanent?'ÇEKİRDEK':'ALTIN',balance=permanent?getLegacy().marks:game.player.gold,reason=available?'SATIN AL':balance<price?'YETERSİZ '+currency:'SINIRA ULAŞILDI / UYGUN DEĞİL',short=effect[id]||item.description.split(' · ')[0];return '<button class="shopItem" data-shop-item="'+id+'" '+(available?'':'disabled')+' title="'+item.description+'"><span class="shopIcon" aria-hidden="true">'+(icons[id]||'◇')+'</span><span class="shopName">'+item.name+'</span><span class="shopEffect">'+short+'</span><span class="shopBuy"><strong>◆ '+price+' '+currency+'</strong><small>'+reason+'</small></span></button>';}).join('');
}

return {nextLockedWeapon,shopCanBuy,renderShop};
}
root.DropForgeShopView=Object.freeze({createShopView});
})(window);
