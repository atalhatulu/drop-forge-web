'use strict';
/* Shared collision and floor physics. */
(function(root){
function createPhysics({getGame,currentRoom,GRAVITY,terrainCollision,FLOOR,clamp,W}){
function collideRect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
function floorPhysics(o,dt,platforms,prevX=o.x){
 const room=getGame()?currentRoom():null,prevY=o.y,prevBottom=o.y+o.h,wasGrounded=o.grounded;
 o.vy+=GRAVITY*dt;o.y+=o.vy*dt;o.grounded=false;
 if(o.vy>=0&&!(getGame()&&o===getGame().player&&(o.dropThrough||0)>0))for(const q of platforms){
  if(prevBottom<=q.y+9&&o.y+o.h>=q.y&&o.x+o.w>q.x+5&&o.x<q.x+q.w-5){
   o.y=q.y-o.h;o.vy=0;o.grounded=true;
   if(getGame()&&o===getGame().player){o.jumps=0;o.spin=0;o.spinDuration=0;}break;
  }
 }
 if(room){terrainCollision(room,o,prevX,prevY);}
 else if(o.y+o.h>FLOOR){o.y=FLOOR-o.h;o.vy=0;o.grounded=true;}
 o.x=clamp(o.x,24,W-24-o.w);
}

return {collideRect,floorPhysics};
}
root.DropForgePhysics=Object.freeze({createPhysics});
})(window);
