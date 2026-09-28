'use strict';
/* Seven seed-selected bosses, with distinct combat profiles and two phases each. */
(function(root){
const BOSSES=Object.freeze([
 {id:'warden',name:'MADEN MUHAFIZI',stage:1,style:'spread',color:'#ffcb8c',hp:1.3,speed:1.0},
 {id:'burrower',name:'TÜNEL YARICI',stage:1,style:'rush',color:'#f3a17e',hp:1.15,speed:1.4},
 {id:'spore',name:'SPOR ANA',stage:2,style:'summon',color:'#a7f4a3',hp:1.3,speed:.9},
 {id:'stalker',name:'KÖK AVCISI',stage:2,style:'sniper',color:'#d5f49b',hp:1.1,speed:1.35},
 {id:'prism',name:'PRİZMA HÜKÜMDARI',stage:3,style:'fan',color:'#d4a8ff',hp:1.25,speed:1.1},
 {id:'mirror',name:'AYNA HAYALETİ',stage:3,style:'blink',color:'#9deeff',hp:1.05,speed:1.5},
 {id:'inferno',name:'KÜL İMPARATORU',stage:4,style:'inferno',color:'#ff916d',hp:1.55,speed:1.2}
]);
function selectBoss(seed,roomId,stage){const candidates=BOSSES.filter(b=>b.stage===stage);return candidates[((seed^Math.imul(roomId+1,0x9e3779b1))>>>0)%candidates.length];}
function phaseFor(hp,maxHp){return hp<=maxHp*.5?2:1;}
root.DropForgeBosses=Object.freeze({BOSSES,selectBoss,phaseFor});
})(window);
