'use strict';
/* First-stage run trait system. Existing combat mods remain the execution backend
   until all loot/workbench sources have migrated. */
(function(root){
const TRAITS=Object.freeze({
 shockCore:{name:'ELEKTRİK ZİNCİRİ',kind:'main',mod:'shockCore',description:'İsabet ettiğin düşmandan yakındaki başka bir düşmana elektrik sıçrar.'},
 burnCore:{name:'YANICI ATIŞ',kind:'main',mod:'burnCore',description:'İsabetlerin düşmanı 3 saniye yakar.'},
 cryoCore:{name:'KRİYO İSABETİ',kind:'main',mod:'cryoCore',description:'İsabetler yavaşlatır; art arda 3 isabet düşmanı dondurur.'},
 hunterMark:{name:'AVCI İŞARETİ',kind:'main',mod:'hunterMark',description:'İsabet hedefi işaretler; işaretli hedefe sonraki isabetler kritik vurur.'},
 laserSweep:{name:'LAZER HATTI',kind:'main',mod:'laserSweep',description:'Atışların delici bir lazer hattına dönüşür.'},
 overheat:{name:'SON MERMİ PATLAMASI',kind:'main',mod:'overheat',description:'Şarjörün son mermisi patlayıcı olur.',exclude:['explosive']},
 loader:{name:'HIZLI BESLEME',kind:'support',mod:'loader',description:'Daha hızlı ateş eder ve doldurursun.'},
 extendedMag:{name:'GENİŞ ŞARJÖR',kind:'support',mod:'extendedMag',description:'Şarjör büyür; doldurma biraz uzar.'},
 efficientMechanism:{name:'MÜHİMMAT TASARRUFU',kind:'support',mod:'efficientMechanism',description:'Atışlarda mermi harcamama şansı kazanırsın.'},
 stabilizer:{name:'DENGELİ ATIŞ',kind:'support',mod:'stabilizer',description:'Mermilerin daha az dağılır.'},
 lightGrip:{name:'HAREKETLİ ATIŞ',kind:'support',mod:'lightGrip',description:'Hareket ederken ateş etmek daha verimli olur.'},
 overchargeGrip:{name:'HIZ AŞIMI',kind:'support',mod:'overchargeGrip',description:'İlk atıştan sonra kısa süre çok hızlı ateş edersin.'}
});
function state(slot){return slot.traits||{main:null,supports:[],levels:{}};}
function eligible(slot,id,projectiles){const trait=TRAITS[id];if(!slot||!trait)return false;return !(trait.exclude||[]).includes(projectiles[slot.weapon]);}
function effectiveMods(slot){
 const s=state(slot);
 return [...new Set([...(slot?.mods||[]),s.main,...s.supports].filter(Boolean))];
}
function canGrant(slot,id,projectiles){
 if(!eligible(slot,id,projectiles))return false;
 const trait=TRAITS[id],s=state(slot);
 if((s.levels[id]||0)>=3)return false;
 if(trait.kind==='support'&&!s.supports.includes(id)&&s.supports.length>=2)return false;
 return true;
}
function grant(slot,id,projectiles){
 if(!canGrant(slot,id,projectiles))return false;
 const trait=TRAITS[id],s=state(slot),next={main:s.main,supports:[...s.supports],levels:{...s.levels}};
 if(trait.kind==='main'&&next.main&&next.main!==id)delete next.levels[next.main];
 if(trait.kind==='main')next.main=id;
 else if(!next.supports.includes(id))next.supports.push(id);
 next.levels[id]=Math.min(3,(next.levels[id]||0)+1);
 slot.traits=next;
 return true;
}
function choices({slots,projectiles,seed=0,hash=(a,b,c)=>c,kind=null}){
 const pool=[];
 for(let i=0;i<slots.length;i++)for(const id of Object.keys(TRAITS)){
  const slot=slots[i];if(!canGrant(slot,id,projectiles))continue;
  const t=TRAITS[id],s=state(slot);if(kind&&t.kind!==kind)continue;
  pool.push({type:'trait',id,weaponSlot:i,kind:t.kind,level:(s.levels[id]||0)+1,upgrade:!!s.levels[id],replace:t.kind==='main'&&!!s.main&&s.main!==id});
 }
 const result=[],used=new Set();
 for(const phase of (kind?[kind,null,null]:['main','support',null])){
  const candidates=pool.filter(item=>(!phase||item.kind===phase)&&!used.has(item.id));
  if(!candidates.length)continue;
  const index=Math.abs(hash(seed,result.length,seed+result.length*773))%candidates.length;
  const item=candidates[index];
  used.add(item.id);result.push(item);
 }
 return result;
}
function snapshot(slot){
 const s=slot?.traits;
 return s?{main:s.main||null,supports:[...s.supports],levels:{...s.levels}}:null;
}
function sameBuild(a,b){
 if(!a||!b||a.weapon!==b.weapon)return false;
 if((a.rune||null)!==(b.rune||null))return false;
 for(let j=0;j<4;j++)if((a.mods?.[j]||null)!==(b.mods?.[j]||null))return false;
 const first=state(a),second=state(b);
 if((first.main||null)!==(second.main||null))return false;
 if(first.supports.length!==second.supports.length||first.supports.some((id,i)=>id!==second.supports[i]))return false;
 const ids=new Set([...Object.keys(first.levels),...Object.keys(second.levels)]);
 return [...ids].every(id=>(first.levels[id]||0)===(second.levels[id]||0));
}
function hasInvestment(slot){
 const s=slot?.traits;
 return !!s&&(!!s.main||s.supports.length>0);
}
function loadoutHTML(slot){
 const s=state(slot);
 const row=(id,label)=>{
  const trait=TRAITS[id];
  return '<div class="weaponTraitRow"><span class="weaponTraitKind">'+label+'</span>'+
   (trait?'<div><strong>'+trait.name+' · SEV '+(s.levels[id]||1)+'/3</strong><small>'+trait.description+'</small></div>':'<div><small>BOŞ · SANDIKTAN ÖZELLİK SEÇ</small></div>')+'</div>';
 };
 return '<section class="weaponTraits" aria-label="Bu run silah özellikleri"><h4>BU RUN · SİLAH ÖZELLİKLERİ</h4>'+
  row(s.main,'ANA DÖNÜŞÜM')+row(s.supports[0],'DESTEK 1')+row(s.supports[1],'DESTEK 2')+'</section>';
}
root.DropForgeWeaponTraits=Object.freeze({TRAITS,state,eligible,canGrant,grant,effectiveMods,choices,snapshot,sameBuild,hasInvestment,loadoutHTML});
})(window);
