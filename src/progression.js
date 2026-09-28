'use strict';
/* Persisted metaprogression is independent of the active expedition. */
(function(root){
 const MASTERY_KEY='dropForge.weaponMastery.v1';
 const LEGACY_KEY='dropForge.permanentForge.v1';
 const UNLOCK_KEY='dropForge.unlockedWeapons.v1';
 const BUILDS_KEY='dropForge.weaponBuilds.v1';
 const TALENTS_KEY='dropForge.weaponTalents.v1';
 const count=root.DropForgeCatalog.WEAPON_PROJECTILES.length;
 const legacy={marks:0,hp:0,kits:0,ammo:0};
 try{const saved=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(saved&&typeof saved==='object')for(const key of Object.keys(legacy))legacy[key]=Math.max(0,Math.min(key==='marks'?9999:3,Math.floor(Number(saved[key])||0)));}catch(e){}
 const mastery={};
 try{const saved=JSON.parse(localStorage.getItem(MASTERY_KEY)||'{}');if(saved&&typeof saved==='object')for(let i=0;i<count;i++)mastery[i]=Math.max(0,Math.min(999999,Number(saved[i])||0));}catch(e){}
 const unlockedWeapons=new Set([0,1]);
 try{const saved=JSON.parse(localStorage.getItem(UNLOCK_KEY)||'[]');if(Array.isArray(saved))for(const id of saved)if(Number.isInteger(id)&&id>=0&&id<count)unlockedWeapons.add(id);}catch(e){}
 const savedBuilds={};
 try{const stored=JSON.parse(localStorage.getItem(BUILDS_KEY)||'{}');if(stored&&typeof stored==='object')for(const [id,mods] of Object.entries(stored))if(/^\d+$/.test(id)&&Number(id)<count&&Array.isArray(mods))savedBuilds[id]=mods.slice(0,4).map(mod=>typeof mod==='string'?mod:null);}catch(e){}
 const talents={};
 try{const saved=JSON.parse(localStorage.getItem(TALENTS_KEY)||'{}');if(saved&&typeof saved==='object')for(const [id,choices] of Object.entries(saved))if(/^\d+$/.test(id)&&Number(id)<count&&choices&&typeof choices==='object')talents[id]={6:['precision','mobility'].includes(choices[6])?choices[6]:null,10:['sustain','execution'].includes(choices[10])?choices[10]:null};}catch(e){}
 function saveTalents(){try{localStorage.setItem(TALENTS_KEY,JSON.stringify(talents));}catch(e){}}
 function saveBuilds(){try{localStorage.setItem(BUILDS_KEY,JSON.stringify(savedBuilds));}catch(e){}}
 function saveLegacy(){try{localStorage.setItem(LEGACY_KEY,JSON.stringify(legacy));}catch(e){}}
 function saveMastery(){try{localStorage.setItem(MASTERY_KEY,JSON.stringify(mastery));}catch(e){}}
 function saveUnlockedWeapons(){try{localStorage.setItem(UNLOCK_KEY,JSON.stringify([...unlockedWeapons]));}catch(e){}}
 root.DropForgeProgression=Object.freeze({legacy,mastery,unlockedWeapons,saveLegacy,saveMastery,saveUnlockedWeapons,savedBuilds,saveBuilds,talents,saveTalents});
})(window);
