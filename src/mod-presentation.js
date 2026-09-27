'use strict';
/* Weapon-specific attachment labels and descriptions, independent of combat state. */
(function(root){
const {WEAPON_PROJECTILES,WEAPON_TYPES,MODS}=root.DropForgeCatalog;
const MOD_ICONS={barrel:'◆',rapidBarrel:'»',pierceBarrel:'➜',loader:'↻',extendedMag:'▤',efficientMechanism:'∞',core:'◇',shockCore:'ϟ',burnCore:'♨',stabilizer:'◎',lightGrip:'↗',heavyGrip:'▣'};
function modNameForWeapon(id,mod){const family=WEAPON_PROJECTILES[id];if(mod==='pierceBarrel')return family==='scatter'?'DARALTICI NAMLU':family==='explosive'?'GENİŞ ETKİ NAMLU':MODS[mod].name;if(mod==='core'&&['explosive','plasma','arc'].includes(family))return 'ALAN FAZ ÇEKİRDEĞİ';if(mod==='stabilizer'&&family==='scatter')return 'SAÇMA DENGELEYİCİ';if(mod==='heavyGrip')return 'SARSICI KABZA';return MODS[mod]?.name||'';}
function modEffectForWeapon(id,mod){const family=WEAPON_PROJECTILES[id],type=WEAPON_TYPES[id],energy=['plasma','arc','explosive'].includes(family);
 const common={barrel:'Mermi başına %18 daha fazla hasar.',rapidBarrel:'%12 daha hızlı ateş; şarjör daha çabuk biter.',loader:'%20 daha hızlı ateş ve doldurma.',extendedMag:'%35 daha büyük şarjör; doldurma süresi değişmez.',efficientMechanism:'Her atışta %15 ihtimalle mermi harcamaz.',shockCore:'%12 daha fazla doğrudan hasar; 140 piksel içindeki ikinci düşmana %35 zincir hasarı.',burnCore:'İsabetten sonra 3 saniye yanma; her 0,5 saniyede mermi hasarının %12’si.',lightGrip:'Dash / kanca / duvar zıplaması sonrası hasar bonusu %13 yerine %25.',heavyGrip:'%35 daha az görsel geri tepme; düşman %50 daha uzun sarsılır.'};
 if(mod==='pierceBarrel')return family==='scatter'?'Saçma dağılımını %25 sıkılaştırır. Yakından tam isabet daha kolay.':family==='explosive'?'Patlama yarıçapını %20 büyütür; doğrudan delme vermez.':'+1 hedef delme; aynı atış başka bir düşmana da ulaşabilir.';
 if(mod==='core')return energy?'Mermi hızını %25, '+(family==='explosive'?'patlama':'enerji etki')+' alanını %25 artırır; delme eklemez.':'Mermi hızını %25 artırır ve +1 hedef delme sağlar.';
 if(mod==='stabilizer')return family==='scatter'?'Saçma dağılımını %42 azaltır; yakın mesafe daha tutarlı.':family==='explosive'?'Patlama alanını %25 büyütür; bu silah saçılma kullanıyorsa onu da azaltır.':'Mermi saçılmasını %30 azaltır.';
 return common[mod]||MODS[mod]?.description||'';
}
function modTradeoff(id,mod){const family=WEAPON_PROJECTILES[id];if(mod==='rapidBarrel'||mod==='loader')return 'Daha hızlı ateş → mühimmat daha hızlı tüketilir.';if(mod==='extendedMag')return 'Daha uzun seri; yedek mühimmat miktarı artmaz.';if(mod==='lightGrip')return 'Bonus yalnızca hareket penceresi aktifken geçerlidir.';if(mod==='pierceBarrel'&&family==='scatter')return 'Delme yerine dağılım sıkılaşır.';if(mod==='core'&&['explosive','plasma','arc'].includes(family))return 'Delme yerine etki alanı büyür.';return 'Ek kaynak maliyeti yok.';}
root.DropForgeModPresentation=Object.freeze({MOD_ICONS,modNameForWeapon,modEffectForWeapon,modTradeoff});
})(window);
