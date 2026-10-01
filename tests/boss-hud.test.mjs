import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(readFileSync('src/hud-view.js','utf8'),context);
const {createHudView}=context.window.DropForgeHudView;
function renderBoss(stage,hp=500){
 const room={type:'boss',stage,level:stage,biome:['cave','forest','crystal','lava'][stage-1],enemies:[{type:'boss',hp,maxHp:800,bossName:'BOSS TEST'}],links:{},portals:[],cleared:false};
 const recorded=[];
 const ctx=new Proxy({},{get(_target,key){if(key==='fillText')return (...args)=>recorded.push(args[0]);if(key==='measureText')return ()=>({width:30});return ()=>{};},set(){return true;}});
 const game={inHub:false,roomId:4,rooms:[room],flow:20,player:{},regionKeys:[1,2,2,3]};
 const hud=createHudView({ctx,W:1120,H:630,getGame:()=>game,currentRoom:()=>room,requiredBossKeys:()=>1,bossGateReady:()=>true,BIOMES:{cave:{name:'TERK EDİLMİŞ MADEN'},forest:{name:'ZEHİRLİ ORMAN'},crystal:{name:'MOR KRİSTAL'},lava:{name:'LAV ÇEKİRDEĞİ'}}});
 assert.doesNotThrow(()=>hud.drawGameHud(),'boss HUD must never throw for stage '+stage);
 return recorded;
}
test('boss HUD safely draws health bars in all four biome stages',()=>{
 for(let stage=1;stage<=4;stage++){
  const labels=renderBoss(stage);
  assert.ok(labels.some(x=>typeof x==='string'&&x.includes('BOSS TEST')),'stage '+stage+' has boss label');
  assert.ok(labels.some(x=>typeof x==='string'&&x.includes(['TERK EDİLMİŞ MADEN','ZEHİRLİ ORMAN','MOR KRİSTAL','LAV ÇEKİRDEĞİ'][stage-1])),'stage '+stage+' uses its own biome name');
 }
});
test('boss HUD health bar handles full, empty and overflow health',()=>{
 for(const hp of [0,500,800,1000])assert.doesNotThrow(()=>renderBoss(1,hp));
});
