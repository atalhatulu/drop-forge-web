'use strict';
/* Reward selection is pure: every offered item can actually fit the current run inventory. */
(function(root){
function selectChestChoices({room,player,stashedMods,modCatalog,chipCatalog,masteryLevel,modSlotUnlocked,seed,hash,randomGear,random}){
 const choices=[],hasRoom=stashedMods.length<12,gearRoom=player.gearBag.length<20;
 const availableMods=Object.keys(modCatalog).filter(id=>{
  const mod=modCatalog[id];
  return hasRoom&&!stashedMods.includes(id)&&player.slots.some(slot=>slot&&masteryLevel(slot.weapon)>=mod.level&&modSlotUnlocked(mod.slot,slot.weapon)&&!slot.mods[mod.slot]);
 });
 const chipIds=Object.keys(chipCatalog).filter(id=>!player.chipBag.includes(id)&&!Object.values(player.chips||{}).includes(id));
 if((room.type==='elite'||room.reward==='chip')&&player.chipBag.length<15&&chipIds.length){
  for(let c=0;c<3&&chipIds.length;c++){
   const index=hash(room.x,room.y,seed+room.id*41+c*773)%chipIds.length;
   choices.push({type:'chip',id:chipIds.splice(index,1)[0]});
  }
 }else{
  const targetModCount=random()<.5?2:3;
  for(let c=0;c<targetModCount&&availableMods.length;c++){
   const index=hash(room.x,room.y,seed+room.id*37+c*911)%availableMods.length;
   choices.push({type:'mod',id:availableMods.splice(index,1)[0]});
  }
  if(gearRoom){
   const offered=new Set(choices.map(item=>item.type+':'+item.id));
   for(let attempt=0;choices.length<3&&attempt<40;attempt++){
    const piece=randomGear(()=>Math.abs(Math.sin(seed+room.id*97+attempt*313)));
    if(!piece||!piece.id||offered.has('gear:'+piece.id))continue;
    offered.add('gear:'+piece.id);
    choices.push({type:'gear',...piece});
   }
  }
 }
 return choices;
}
function availableRewardMods({player,stashedMods,catalog,masteryLevel,modSlotUnlocked}){
 if(stashedMods.length>=12)return [];
 return Object.keys(catalog).filter(id=>{
  const mod=catalog[id];
  return !stashedMods.includes(id)&&player.slots.some(slot=>slot&&masteryLevel(slot.weapon)>=mod.level&&modSlotUnlocked(mod.slot,slot.weapon)&&!slot.mods[mod.slot]&&!slot.mods.includes(id));
 });
}
function selectBossAttachment(args,seed,stage,hash){
 const available=availableRewardMods(args);
 return available.length?available[hash(seed,stage,918)%available.length]:null;
}
root.DropForgeChestRewards=Object.freeze({selectChestChoices,availableRewardMods,selectBossAttachment});
})(window);
