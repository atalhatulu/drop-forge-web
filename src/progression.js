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
 const LOOT_LOCKER_KEY='dropForge.lootLocker.v1';
 const lootLocker={chips:[],runes:[]};
 try{const saved=JSON.parse(localStorage.getItem(LOOT_LOCKER_KEY)||'{}');for(const kind of ['chips','runes'])if(Array.isArray(saved?.[kind]))lootLocker[kind]=saved[kind].filter(id=>typeof id==='string').slice(0,100);}catch(e){}
 function rememberLoot(kind,id){if(!['chips','runes'].includes(kind)||typeof id!=='string'||lootLocker[kind].includes(id))return false;lootLocker[kind].push(id);localStorage.setItem(LOOT_LOCKER_KEY,JSON.stringify(lootLocker));return true;}
 function weightedLoot(kind,ids,seed){const pool=ids.flatMap(id=>lootLocker[kind]?.includes(id)?[id,id,id]:[id]);return pool[Math.abs(seed)%pool.length];}
 const MATRIX_KEY='dropForge.matrixUnlocks.v1';
 const matrixCosts=Object.freeze({weapon:50,module:30,hard:80,chip:20});
 const matrixUnlocks={weapon:0,module:false,hard:false,chip:false};
 try{const saved=JSON.parse(localStorage.getItem(MATRIX_KEY)||'{}');if(saved&&typeof saved==='object'){matrixUnlocks.weapon=Math.max(0,Math.min(count-2,Math.floor(Number(saved.weapon)||0)));for(const id of ['module','hard','chip'])matrixUnlocks[id]=saved[id]===true;}}catch(e){}
 function saveMatrix(){localStorage.setItem(MATRIX_KEY,JSON.stringify(matrixUnlocks));}
 function purchaseMatrix(id){if(!(id in matrixCosts)||legacy.marks<matrixCosts[id]||(id!=='weapon'&&matrixUnlocks[id])||(id==='weapon'&&matrixUnlocks.weapon>=count-2))return false;legacy.marks-=matrixCosts[id];if(id==='weapon')matrixUnlocks.weapon++;else matrixUnlocks[id]=true;saveLegacy();saveMatrix();return true;}
 const ALL_PROGRESS_KEYS=[
  LEGACY_KEY,
  MASTERY_KEY,
  UNLOCK_KEY,
  BUILDS_KEY,
  TALENTS_KEY,
  LOOT_LOCKER_KEY,
  MATRIX_KEY,
  'dropForge.gearLocker.v1',
  'dropForge.gearBuild.v1',
  'dropForge.bossBlueprints.v1'
 ];
 function resetAllProgress(){
  try{for(const k of ALL_PROGRESS_KEYS)localStorage.removeItem(k);}catch(e){}
  for(const k of Object.keys(legacy))legacy[k]=0;
  for(const k of Object.keys(mastery))delete mastery[k];
  for(let i=0;i<count;i++)mastery[i]=0;
  unlockedWeapons.clear();
  unlockedWeapons.add(0);
  unlockedWeapons.add(1);
  for(const k of Object.keys(savedBuilds))delete savedBuilds[k];
  for(const k of Object.keys(talents))delete talents[k];
  lootLocker.chips.length=0;
  lootLocker.runes.length=0;
  matrixUnlocks.weapon=0;
  matrixUnlocks.module=false;
  matrixUnlocks.hard=false;
  matrixUnlocks.chip=false;
  saveLegacy();
  saveMastery();
  saveUnlockedWeapons();
  saveBuilds();
  saveTalents();
  saveMatrix();
 }
 function exportSaveData(){
  const data={version:1,timestamp:Date.now()};
  for(const k of ALL_PROGRESS_KEYS){
   try{data[k]=localStorage.getItem(k);}catch(e){}
  }
  return JSON.stringify(data);
 }
 function importSaveData(jsonStr){
  let backup;
  try{
   const parsed=JSON.parse(jsonStr);
   if(!parsed||Array.isArray(parsed)||parsed.version!==1)return false;
   const keys=ALL_PROGRESS_KEYS.filter(k=>Object.prototype.hasOwnProperty.call(parsed,k));
   if(!keys.length)return false;
   const expectedArrays=new Set([UNLOCK_KEY,'dropForge.gearLocker.v1']);
   const expectedNumbers=new Set(['dropForge.bossBlueprints.v1']);
   const updates=[];
   for(const key of keys){
    const value=parsed[key];
    if(value===null){updates.push([key,null]);continue;}
    if(typeof value!=='string')return false;
    const decoded=expectedNumbers.has(key)?Number(value):JSON.parse(value);
    if(expectedNumbers.has(key)){
     if(!Number.isSafeInteger(decoded)||decoded<0)return false;
    }else if(expectedArrays.has(key)){
     if(!Array.isArray(decoded))return false;
    }else if(!decoded||typeof decoded!=='object'||Array.isArray(decoded)){
     return false;
    }
    updates.push([key,value]);
   }
   backup=new Map(ALL_PROGRESS_KEYS.map(key=>[key,localStorage.getItem(key)]));
   for(const [key,value] of updates){
    if(value===null)localStorage.removeItem(key);
    else localStorage.setItem(key,value);
   }
   return true;
  }catch(e){
   if(backup)for(const [key,value] of backup){
    try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch(rollbackError){}
   }
   return false;
  }
 }
 root.DropForgeProgression=Object.freeze({legacy,mastery,unlockedWeapons,saveLegacy,saveMastery,saveUnlockedWeapons,savedBuilds,saveBuilds,talents,saveTalents,matrixCosts,matrixUnlocks,purchaseMatrix,saveMatrix,lootLocker,rememberLoot,weightedLoot,resetAllProgress,exportSaveData,importSaveData,ALL_PROGRESS_KEYS});
})(window);
