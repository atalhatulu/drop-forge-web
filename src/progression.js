'use strict';
/* Persisted metaprogression is independent of the active expedition. */
(function(root){
 const MASTERY_KEY='dropForge.weaponMastery.v1';
 const LEGACY_KEY='dropForge.permanentForge.v1';
 const UNLOCK_KEY='dropForge.unlockedWeapons.v1';
 const BUILDS_KEY='dropForge.weaponBuilds.v1';
 const count=root.DropForgeCatalog.WEAPON_PROJECTILES.length;
 const legacy={marks:0,hp:0,kits:0,ammo:0};
 try{const saved=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(saved&&typeof saved==='object')for(const key of Object.keys(legacy))legacy[key]=Math.max(0,Math.min(key==='marks'?9999:3,Math.floor(Number(saved[key])||0)));}catch(e){}
 const mastery={};
 try{const saved=JSON.parse(localStorage.getItem(MASTERY_KEY)||'{}');if(saved&&typeof saved==='object')for(let i=0;i<count;i++)mastery[i]=Math.max(0,Math.min(999999,Number(saved[i])||0));}catch(e){}
 const unlockedWeapons=new Set([0,1]);
 try{const saved=JSON.parse(localStorage.getItem(UNLOCK_KEY)||'[]');if(Array.isArray(saved))for(const id of saved)if(Number.isInteger(id)&&id>=0&&id<count)unlockedWeapons.add(id);}catch(e){}
 const savedBuilds={};
 try{const stored=JSON.parse(localStorage.getItem(BUILDS_KEY)||'{}');if(stored&&typeof stored==='object')for(const [id,mods] of Object.entries(stored))if(/^\d+$/.test(id)&&Number(id)<count&&Array.isArray(mods))savedBuilds[id]=mods.slice(0,4).map(mod=>typeof mod==='string'?mod:null);}catch(e){}
 function saveBuilds(){try{localStorage.setItem(BUILDS_KEY,JSON.stringify(savedBuilds));}catch(e){}}
 function saveLegacy(){try{localStorage.setItem(LEGACY_KEY,JSON.stringify(legacy));}catch(e){}}
 function saveMastery(){try{localStorage.setItem(MASTERY_KEY,JSON.stringify(mastery));}catch(e){}}
 function saveUnlockedWeapons(){try{localStorage.setItem(UNLOCK_KEY,JSON.stringify([...unlockedWeapons]));}catch(e){}}
 root.DropForgeProgression=Object.freeze({legacy,mastery,unlockedWeapons,saveLegacy,saveMastery,saveUnlockedWeapons,savedBuilds,saveBuilds});
})(window);
