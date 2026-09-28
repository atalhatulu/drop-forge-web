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
  if(gearRoom)for(let c=choices.length;c<3;c++){
   const piece=randomGear(()=>Math.abs(Math.sin(seed+room.id*97+c*313)));
   if(piece)choices.push({type:'gear',...piece});
  }
 }
 return choices;
}
root.DropForgeChestRewards=Object.freeze({selectChestChoices});
})(window);
