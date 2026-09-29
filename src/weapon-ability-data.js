'use strict';
/* Right click is attached to a weapon; movement modules stay on Z. */
(function(root){
const FAMILY_OPTIONS={
 kinetic:[0,1,4,5,8,9],scatter:[2,7],plasma:[1,3,6,9],
 pierce:[4,5,8,10],laser:[8,10,4],explosive:[2,11,5],arc:[0,12,3]
};
function optionsFor(family,weapon,abilities){const pool=FAMILY_OPTIONS[family]||FAMILY_OPTIONS.kinetic,first=(Number(weapon)||0)%pool.length;return [abilities[pool[first]],abilities[pool[(first+1)%pool.length]]].filter(Boolean);}
function get(slot,abilities){if(!slot)return null;const options=optionsFor(slot.family,slot.weapon,abilities),selected=options.find(a=>a.id===slot.rightClickAbility);return selected||options[0]||null;}
root.DropForgeWeaponAbilityData=Object.freeze({FAMILY_OPTIONS,optionsFor,get});
})(window);
