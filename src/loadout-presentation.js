'use strict';
/* Inventory stat comparison and enemy codex markup. */
(function(root){
function createLoadoutPresentation({weaponStats,BIOMES,VARIANTS}){
function statRow(label,base,value,unit='',digits=0,lowerBetter=false){const fmt=n=>Number(n).toFixed(digits),changed=Math.abs(value-base)>0.00001,delta=value-base,sign=delta>0?'+':'−';return '<div class="weaponStatRow"><span>'+label+'</span><b>'+fmt(value)+unit+'</b>'+(changed?'<small class="'+((lowerBetter?delta<0:delta>0)?'statBuff':'statNerf')+'">'+fmt(base)+unit+' '+sign+fmt(Math.abs(delta))+unit+'</small>':'<small class="statBase">TEMEL '+fmt(base)+unit+'</small>')+'</div>';}
function weaponStatHTML(slot){const st=weaponStats(slot),mods=slot.mods||[],synergies=[];
 if(st.family==='explosive'&&mods.includes('stabilizer'))synergies.push('DENGELEYİCİ + PATLAYICI → PATLAMA ALANI +%25');
 if(st.family==='arc'&&mods.includes('core'))synergies.push('FAZ ÇEKİRDEĞİ + ARK → ALAN HASARI +%50');
 if(mods.includes('shockCore'))synergies.push('ŞOK → ATIŞ BAŞINA EN FAZLA 1 YAKIN HEDEFE %35 ZİNCİR HASARI');
 if(mods.includes('burnCore'))synergies.push('YANMA → 3 SN BOYUNCA HER 0,5 SN %12 MERMİ HASARI');
 return '<div class="weaponStats"><div class="weaponStatsHeading">ANLIK SİLAH ÖZELLİKLERİ</div>'+statRow('HASAR / MERMİ',st.baseDamage,st.damage)+statRow('TAM İSABET',st.baseShotDamage,st.shotDamage)+statRow('TEORİK DPS',st.baseDps,st.dps,'',1)+statRow('ATEŞ / SN',st.baseFireRate,st.fireRate,'',2)+statRow('DOLDURMA',st.baseReload,st.reload,' sn',2,true)+statRow('MERMİ HIZI',st.baseSpeed,st.speed,'',0)+statRow('DELME',st.basePierce,st.pierce)+statRow('SAÇILMA',100,st.spread*100,'%',0,true)+statRow('ŞARJÖR',st.baseMag,st.mag)+statRow('MERMİ TASARRUFU',0,st.ammoSave*100,'%')+statRow('HAREKET HASARI',13,st.movementBonus*100,'%')+statRow('GERİ TEPME',100,st.recoil*100,'%',0,true)+(['explosive','plasma','arc'].includes(st.family)?statRow('ETKİ ALANI',100,st.areaBonus*100,'%'): '')+statRow('SARSILMA',100,st.staggerBonus*100,'%')+(synergies.length?'<div class="synergyNote">'+synergies.join('<br>')+'</div>':'')+'<small class="statExplanation">DPS: yeniden doldurma, isabet ve özel etkiler hariç. Hareket bonusu yalnızca dash / kanca / duvar zıplaması sonrası geçerli.</small></div>';}
function enemyCodexHTML(){return '<section class="bagCard enemyCodex"><h3>DÜŞMAN REHBERİ · 5 ROL / 4 BİYOM</h3><p>Tank, uçan menzilli, büyücü, şifacı ve boss. Her biyomda farklı görünüm ve isimleri vardır. Şifacılar nadir çıkar; boss yalnızca boss odasındadır.</p>'+Object.entries(BIOMES).map(([key,b])=>'<div class="codexBiome"><strong>'+b.name+'</strong><div>'+['red','blue','purple','healer','boss'].map(role=>'<span>'+VARIANTS[key][role]+' <small>'+({red:'TANK',blue:'UÇAN',purple:'BÜYÜCÜ',healer:'ŞİFACI',boss:'BOSS'})[role]+'</small></span>').join('')+'</div></div>').join('')+'</section>';}
return {statRow,weaponStatHTML,enemyCodexHTML};
}
root.DropForgeLoadoutPresentation=Object.freeze({createLoadoutPresentation});
})(window);
