'use strict';
/* Run weapon traits use three equal sockets; trait kind now describes the effect, not the socket. */
(function(root){
const WEAPON_GROUPS=['pistol','lmg','shotgun','energy','sniper','pistol','energy','shotgun','sniper','lmg','laser','explosive','arc'];
const TRAITS=Object.freeze({
 shockCore:{name:'ELEKTRİK ZİNCİRİ',kind:'main',groups:['lmg','arc'],mod:'shockCore',description:'İsabet ettiğin düşmandan yakındaki başka bir düşmana elektrik sıçrar.'},
 burnCore:{name:'YANICI ATIŞ',kind:'main',groups:['pistol','energy','explosive'],mod:'burnCore',description:'İsabetlerin düşmanı 3 saniye yakar.'},
 cryoCore:{name:'KRİYO İSABETİ',kind:'main',groups:['shotgun','energy'],mod:'cryoCore',description:'İsabetler yavaşlatır; art arda 3 isabet düşmanı dondurur.'},
 hunterMark:{name:'AVCI İŞARETİ',kind:'main',groups:['sniper','laser'],mod:'hunterMark',description:'İlk isabet kritik vurur ve hedefi 5 sn işaretler; sonraki isabetler de kritik vurur.'},
 laserSweep:{name:'LAZER HATTI',kind:'main',groups:['lmg','sniper','laser','energy'],mod:'laserSweep',description:'Atışların delici bir lazer hattına dönüşür.'},
 overheat:{name:'SON MERMİ PATLAMASI',kind:'main',groups:['pistol','lmg','shotgun','energy','arc'],mod:'overheat',description:'Şarjörün son mermisi patlayıcı olur.'},
 loader:{name:'HIZLI BESLEME',kind:'support',groups:['pistol','lmg','shotgun','energy','explosive','arc'],mod:'loader',description:'Daha hızlı ateş eder ve doldurursun.'},
 extendedMag:{name:'GENİŞ ŞARJÖR',kind:'support',groups:['pistol','lmg','energy','explosive','laser','arc'],mod:'extendedMag',description:'Şarjör büyür; doldurma biraz uzar.'},
 efficientMechanism:{name:'MÜHİMMAT TASARRUFU',kind:'support',groups:['pistol','sniper','energy','explosive','laser'],mod:'efficientMechanism',description:'Atışlarda mermi harcamama şansı kazanırsın.'},
 stabilizer:{name:'DENGELİ ATIŞ',kind:'support',groups:['pistol','sniper','laser'],mod:'stabilizer',description:'Mermilerin daha az dağılır.'},
 lightGrip:{name:'HAREKETLİ ATIŞ',kind:'support',groups:['pistol','lmg','shotgun','energy','explosive','arc'],mod:'lightGrip',description:'Hareket ederken ateş etmek daha verimli olur.'},
 overchargeGrip:{name:'HIZ AŞIMI',kind:'support',groups:['pistol','lmg','energy','laser','arc'],mod:'overchargeGrip',description:'İlk atıştan sonra kısa süre çok hızlı ateş edersin.'},
 mirrorBarrel:{name:'SEKEN MERMİ',kind:'main',groups:['pistol','lmg','sniper','laser'],mod:'mirrorBarrel',description:'Mermiler ilk duvardan bir kez sekerek yoluna devam eder.'},
 shockMuzzle:{name:'ŞOK AĞZI',kind:'main',groups:['shotgun','energy','explosive','arc'],mod:'shockMuzzle',description:'Hasar ve sersemletme artar; patlama alanı genişler.'},
 tripleBurst:{name:'ÜÇLÜ ATIŞ',kind:'support',groups:['pistol','lmg','energy'],mod:'tripleBurst',description:'Her tetik çekişinde kısa aralıklarla üç atış yapar.'},
 refundPiston:{name:'GERİ KAZANIM',kind:'support',groups:['pistol','sniper','laser'],mod:'refundPiston',description:'Kritik vuruşta şarjöre bir mermi geri kazandırır.'},
 resonanceCore:{name:'REZONANS ÇEKİRDEĞİ',kind:'support',groups:['energy'],mod:'resonanceCore',description:'Diğer silahın da plazma ailesindeyse bu silah %20 fazla hasar verir.'},
 heavyStabilizer:{name:'AĞIR SABİTLEYİCİ',kind:'support',groups:['sniper','laser'],mod:'heavyStabilizer',description:'Hareketsizken her isabette %25 kritik şansı kazanırsın.'},
 steadyGrip:{name:'UZUN MENZİL KABZASI',kind:'support',groups:['pistol','sniper','laser'],mod:'steadyGrip',description:'Saçılmayı düşürür ve uzaktaki hedefleri vurmayı kolaylaştırır.'},
 pierceBarrel:{name:'FAZ DELİCİ NAMLU',kind:'main',groups:['lmg','energy','sniper','laser','explosive'],mod:'pierceBarrel',description:'Mermiler ek hedefleri deler; saçmalı silahta dağılımı sıkılaştırır.'},
 rapidBarrel:{name:'HIZLI NAMLU',kind:'main',groups:['pistol','lmg','shotgun'],mod:'rapidBarrel',description:'Atış hızını artırır; mermi başına hasar biraz azalır.'},
 barrel:{name:'AĞIR NAMLU',kind:'main',groups:['pistol','shotgun','energy','sniper','explosive'],mod:'barrel',description:'Hasarı artırır, ancak atış hızını bir miktar düşürür.'},
 core:{name:'FAZ ÇEKİRDEĞİ',kind:'support',groups:['pistol','lmg','energy','sniper','laser','explosive','arc'],mod:'core',description:'Mermi hızını artırır; silah ailesine göre delme veya alan etkisi kazandırır.'},
 heavyGrip:{name:'AĞIR KABZA',kind:'support',groups:['shotgun','lmg','explosive','arc'],mod:'heavyGrip',description:'Geri tepme azalır; isabetler düşmanı daha fazla sarsar.'},
 seekerRound:{name:'AVCI MERMİ',kind:'attack',groups:['pistol','lmg','sniper','laser','arc'],mod:'seekerRound',description:'Mermiler yakın hedefe doğru hafifçe yön değiştirir.'},
 executionRound:{name:'İNFaz ÇEKİRDEĞİ',kind:'attack',groups:['pistol','lmg','shotgun','sniper','explosive'],mod:'executionRound',description:'Canı azalmış düşmanlara daha fazla hasar verir.'},
 shatterCore:{name:'PARÇALAYICI ÇEKİRDEK',kind:'attack',groups:['shotgun','energy','arc','sniper'],mod:'shatterCore',description:'Donmuş hedefe güçlü isabet vurur ve dondurmayı parçalar.'},
 siphonRound:{name:'SÖMÜRÜ MERMİSİ',kind:'attack',groups:['pistol','lmg','energy','arc'],mod:'siphonRound',description:'İsabetler zaman zaman az miktarda can yeniler.'},
 gravityRound:{name:'YERÇEKİMİ MERMİSİ',kind:'attack',groups:['explosive','energy','arc'],mod:'gravityRound',description:'İsabet çevresindeki düşmanları hedefe doğru çeker.'},
 echoRound:{name:'YANKI MERMİSİ',kind:'attack',groups:['sniper','laser','energy','arc'],mod:'echoRound',description:'Aynı hedefe arka arkaya vuruşlar giderek güçlenir.'},
 volatileRound:{name:'KIRILGAN YÜK',kind:'attack',groups:['shotgun','explosive','energy'],mod:'volatileRound',description:'İsabet, hedef çevresine küçük bir patlama yayar.'},
 capacitorRound:{name:'KAPASİTÖR ATIŞI',kind:'attack',groups:['lmg','energy','laser','arc'],mod:'capacitorRound',description:'İsabetler kısa süreli atış hızı biriktirir.'},
 bleedRound:{name:'KANATAN ÇEKİRDEK',kind:'attack',groups:['pistol','lmg','shotgun','sniper'],mod:'bleedRound',description:'İsabet hedefi 2,4 sn boyunca kanatır; etkiler yenilenir.'},
 concussiveCore:{name:'SARSINTI ÇEKİRDEĞİ',kind:'attack',groups:['shotgun','explosive','arc'],mod:'concussiveCore',description:'İsabet düşmanı sertçe geri savurur ve kısa süre sersemletir.'},
 openingRound:{name:'AÇIK YARA ATIŞI',kind:'attack',groups:['pistol','sniper','laser'],mod:'openingRound',description:'Canı yüksek hedeflere ilk isabet daha ağır vurur.'},
 frostBloom:{name:'KIŞ ÇEKİRDEĞİ',kind:'attack',groups:['shotgun','energy','arc'],mod:'frostBloom',description:'Donmuş hedef parçalanınca yakındaki düşmanlar da yavaşlar.'}
});
const SYNERGIES=Object.freeze([
 {ids:['shockCore','tripleBurst'],name:'AŞIRI YÜK',description:'Elektrik zinciri her tetik serisinde iki hedefe sıçrayabilir.'},
 {ids:['burnCore','efficientMechanism'],name:'KALICI YANMA',description:'Yanma 4 saniye sürer ve daha fazla hasar verir.'},
 {ids:['cryoCore','lightGrip'],name:'HAREKETLİ DONDURUCU',description:'Hareket halindeyken iki isabette dondurur.'},
 {ids:['hunterMark','heavyStabilizer'],name:'NOKTA ATIŞI',description:'İşaretli hedefe sabit durarak vurduğunda kritik hasar artar.'},
 {ids:['laserSweep','pierceBarrel'],name:'FAZ KESİCİ',description:'Lazer hattı ek bir hedeften daha geçer.'}
]);
function state(slot){const t=slot?.traits;if(!t)return {slots:[null,null,null],main:null,supports:[],levels:{}};const slots=Array.isArray(t.slots)?[...t.slots.slice(0,3),null,null,null].slice(0,3):[t.main||null,...(t.supports||[]).slice(0,2)];while(slots.length<3)slots.push(null);return {slots,main:slots[0],supports:slots.slice(1),levels:{...(t.levels||{})}};}
function eligible(slot,id,projectiles){const trait=TRAITS[id],group=WEAPON_GROUPS[slot?.weapon];if(!slot||!trait)return false;return !trait.groups||trait.groups.includes(group);}
function effectiveMods(slot){
 const s=state(slot);
 return [...new Set([...(slot?.mods||[]),...s.slots].filter(Boolean))];
}
function canGrant(slot,id,projectiles){
 if(!eligible(slot,id,projectiles))return false;
 const trait=TRAITS[id],s=state(slot);
 if((slot.mods||[]).includes(id)&&!s.slots.includes(id))return false;
 if(s.slots.includes(id))return (s.levels[id]||0)<3;
 return s.slots.some(value=>!value);
}
function grant(slot,id,projectiles){
 if(!canGrant(slot,id,projectiles))return false;
 const s=state(slot),next={slots:[...s.slots],levels:{...s.levels}},existing=next.slots.indexOf(id);
 if(existing<0){const open=next.slots.indexOf(null);if(open<0)return false;next.slots[open]=id;}
 next.levels[id]=Math.min(3,(next.levels[id]||0)+1);
 slot.traits=next;
 return true;
}
function choices({slots,projectiles,seed=0,hash=(a,b,c)=>c,kind=null}){
 const pool=[];
 for(let i=0;i<slots.length;i++)for(const id of Object.keys(TRAITS)){
  const slot=slots[i],t=TRAITS[id];if(!canGrant(slot,id,projectiles)||kind&&t.kind!==kind)continue;
  const s=state(slot),socketIndex=s.slots.indexOf(id),installed=socketIndex>=0,open=s.slots.indexOf(null);
  if(installed?open>=0:open<0)continue;
  pool.push({type:'trait',id,weaponSlot:i,kind:t.kind,level:(s.levels[id]||0)+1,upgrade:installed,socket:'YUVA '+(installed?socketIndex+1:open+1)});
 }
 const result=[],used=new Set();
 for(let n=0;n<3;n++){let candidates=pool.filter(item=>!used.has(item.weaponSlot+':'+item.id));if(!candidates.length)break;const weapons=new Set(result.map(item=>item.weaponSlot));const fresh=candidates.filter(item=>!item.upgrade);if(result.length===0&&fresh.length)candidates=fresh;else if(weapons.size===1&&candidates.some(item=>!weapons.has(item.weaponSlot)))candidates=candidates.filter(item=>!weapons.has(item.weaponSlot));const index=Math.abs(hash(seed,result.length,seed+result.length*773))%candidates.length,item=candidates[index];used.add(item.weaponSlot+':'+item.id);result.push(item);}
 return result;
}
function snapshot(slot){
 const s=slot?.traits;
 return s?{slots:[...s.slots],main:s.slots[0]||null,supports:s.slots.slice(1),levels:{...s.levels}}:null;
}
function sameBuild(a,b){
 if(!a||!b||a.weapon!==b.weapon)return false;
 if((a.rightClickAbility??null)!==(b.rightClickAbility??null)||(a.rightClickLevel||1)!==(b.rightClickLevel||1))return false;
 if((a.rune||null)!==(b.rune||null))return false;
 for(let j=0;j<4;j++)if((a.mods?.[j]||null)!==(b.mods?.[j]||null))return false;
 const first=state(a),second=state(b);
 if((first.main||null)!==(second.main||null))return false;
 if(first.slots.some((id,i)=>id!==second.slots[i]))return false;
 const ids=new Set([...Object.keys(first.levels),...Object.keys(second.levels)]);
 return [...ids].every(id=>(first.levels[id]||0)===(second.levels[id]||0));
}
function hasInvestment(slot){
 const s=slot?.traits;
 return !!s&&s.slots.some(Boolean);
}
function loadoutHTML(slot){
 const s=state(slot);
 const row=(id,label)=>{
  const trait=TRAITS[id];
  return '<div class="weaponTraitRow"><span class="weaponTraitKind">'+label+'</span>'+
   (trait?'<div><strong>'+trait.name+' · SEV '+(s.levels[id]||1)+'/3</strong><small>'+trait.description+'</small></div>':'<div><small>BOŞ · SANDIKTAN ÖZELLİK SEÇ</small></div>')+'</div>';
 };
 return '<section class="weaponTraits" aria-label="Bu run silah özellikleri"><h4>BU RUN · SİLAH ÖZELLİKLERİ</h4>'+
  s.slots.map((id,index)=>row(id,'YUVA '+(index+1))).join('')+'</section>';
}
root.DropForgeWeaponTraits=Object.freeze({TRAITS,SYNERGIES,WEAPON_GROUPS,state,eligible,canGrant,grant,effectiveMods,choices,snapshot,sameBuild,hasInvestment,loadoutHTML});
})(window);
