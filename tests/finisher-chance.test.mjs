import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync('src/game.js','utf8');
const start=source.indexOf('function killEnemy(room,e){');
const end=source.indexOf('e.alive=false;',start);
assert.ok(start>=0&&end>start,'killEnemy finisher gate is present');
const gate=source.slice(start,end);
const match=gate.match(/if\((!game\.inHub[^{}]+)\)\{e\.hp=1;/);
assert.ok(match,'finisher gate is parsed from live game code');
const isFinisher=new Function('game','e','random','const Math={random};return '+match[1]+';');

test('finisher eligibility rolls on lethal death with 50% probability',()=>{
 const game={inHub:false,testMode:false},enemy={type:'red',finisherExecution:false,finisherExpired:false,finisherReady:false};
 assert.equal(isFinisher(game,enemy,()=>0),true);
 assert.equal(isFinisher(game,enemy,()=>0.49999),true);
 assert.equal(isFinisher(game,enemy,()=>0.5),false);
 assert.equal(isFinisher(game,enemy,()=>0.9999),false);
 let count=0;for(let i=0;i<10000;i++)if(isFinisher(game,enemy,()=>i/10000))count++;
 assert.equal(count,5000);
});
test('bosses, practice mode, hub and already resolved enemies never create finishers',()=>{
 const enemy={type:'red'};
 for(const game of [{inHub:true,testMode:false},{inHub:false,testMode:true}])assert.equal(isFinisher(game,enemy,()=>0),false);
 for(const prop of ['finisherExecution','finisherExpired','finisherReady'])assert.equal(isFinisher({inHub:false,testMode:false},{...enemy,[prop]:true},()=>0),false);
 assert.equal(isFinisher({inHub:false,testMode:false},{type:'boss'},()=>0),false);
});
