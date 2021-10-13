function myTank() {
    // YOUR CODE GOES BELOW vvvvvvvv
    class AdvancedState{constructor(t){this.state=t,this.absoluteRadarAngle=Math.deg.normalize(this.state.radar.angle+this.state.angle),this.position={x:t.x,y:t.y}}orientationString(){return`${this.state.x}${this.state.y}${this.state.angle}${this.state.radar.angle}`}getPointAtDistanceAlongRadar(t){return{x:this.state.x+Math.cos(this.absoluteRadarAngle*Math.PI/180)*t,y:this.state.y+Math.sin(this.absoluteRadarAngle*Math.PI/180)*t}}}const BATTLEFIELD_WIDTH=850,BATTLEFIELD_HEIGHT=550,SOUTH=90,NORTH=-90,WEST=-180,EAST=0,TANK_WIDTH=36;var Constants=Object.freeze({__proto__:null,BATTLEFIELD_WIDTH:BATTLEFIELD_WIDTH,BATTLEFIELD_HEIGHT:BATTLEFIELD_HEIGHT,SOUTH:SOUTH,NORTH:NORTH,WEST:WEST,EAST:EAST,TANK_WIDTH:TANK_WIDTH});Number.prototype.isWhole=function(t=1e-8){return Math.abs(Math.round(this)-this)<t};class OriginFinder{constructor(){this.origin={x:void 0,y:void 0},this.lastX=void 0,this.lastY=void 0,this.lastOrientation=void 0}update(i){if(!this.origin.x||!this.origin.y){var s=i.state.radar.wallDistance;if(s){var o=this.lastOrientation&&this.lastOrientation!=i.orientationString();this.lastOrientation=i.orientationString();let t=i.getPointAtDistanceAlongRadar(s);!this.origin.x&&t.x.isWhole()&&(this.lastX&&this.lastX==Math.round(t.x)&&o&&(this.origin.x=this.lastX-(90<=Math.abs(i.absoluteRadarAngle)?0:BATTLEFIELD_WIDTH)),this.lastX=Math.round(t.x)),!this.origin.y&&t.y.isWhole()&&(this.lastY&&this.lastY==Math.round(t.y)&&o&&(this.origin.y=this.lastY-(0<i.absoluteRadarAngle?BATTLEFIELD_HEIGHT:0)),this.lastY=Math.round(t.y))}}}}class Autopilot{constructor(){this.originFinder=new OriginFinder,this.origin=this.originFinder.origin,this.advancedState=void 0,this.path=[],this.nextPosition=void 0}update(t,i){this.state=t,this.advancedState=new AdvancedState(t),this.control=i,this.originFinder.update(this.advancedState)}isOriginKnown(){return this.origin.x&&this.origin.y}setOrigin(t,i){this.origin.x=t,this.origin.y=i}lookEverywhere(){this.control.RADAR_TURN=1}lookAtEnemy(t){t=Math.deg.atan2(t.y-this.state.y,t.x-this.state.x),t=Math.deg.normalize(t-this.state.angle),t=Math.deg.normalize(t-this.state.radar.angle);this.control.RADAR_TURN=t}isWallCollisionImminent(t=3){if(this.state.collisions.wall)return!0;if(this.isOriginKnown()){t=this.extrapolatedOuterPosition(t);return t.x<=this.origin.x||t.x>=this.origin.x+BATTLEFIELD_WIDTH||t.y<=this.origin.y||t.y>=this.origin.y+BATTLEFIELD_HEIGHT}}turnToAngle(t){if(t=Math.deg.normalize(t),this.state.angle==t)return this.control.TURN=0;t=Math.deg.normalize(t-this.state.angle);return this.control.TURN=t/2,t}turnToPoint(t,i,s=!1){if(!this.isOriginKnown()&&s)throw new"Cannot turn to point based on zero origin because the origin is not yet known";t+=s?this.origin.x:0,s=i+(s?this.origin.y:0),t=Math.deg.atan2(s-this.state.y,t-this.state.x);return this.turnToAngle(t)}moveToPoint(t,i,s=!1){this.control.THROTTLE=0;s=this.turnToPoint(t,i,s);s<60&&(this.control.THROTTLE=(60-s)/60)}moveAlongAngle(t){this.control.THROTTLE=0;t=Math.abs(this.turnToAngle(t));t<60&&(this.control.THROTTLE=(60-t)/60)}loopOnPath(t,i,s=50){if(0!=t.length){if(0==this.path.length&&(this.path=t,i)){if(!this.isOriginKnown())throw new"Cannot loop on positions based on zero origin because the origin is not yet known";this.path.forEach(t=>{t.x+=this.origin.x,t.y+=this.origin.y})}this.nextPosition||(this.nextPosition=this.path.shift(),this.path.push(this.nextPosition)),Math.distance(this.nextPosition.x,this.nextPosition.y,this.state.x,this.state.y)<=s&&(this.nextPosition=this.path.shift(),this.path.push(this.nextPosition)),this.moveToPoint(this.nextPosition.x,this.nextPosition.y)}}stopLoopOnPath(){this.path=[],this.nextPosition=void 0,this.stop()}stop(){this.control.TURN=0,this.control.THROTTLE=0,this.control.BOOST=0}shootEnemy(t){var i;t&&(i=Math.distance(this.state.x,this.state.y,t.x,t.y)/4,i=Autopilot.extrapolatedPosition(t,t.angle,t.speed,i),i=Math.deg.atan2(i.y-this.state.y,i.x-this.state.x),i=Math.deg.normalize(i-this.state.angle),i=Math.deg.normalize(i-this.state.gun.angle),this.control.GUN_TURN=.3*i,Math.abs(i)<2&&(this.control.SHOOT=.1))}extrapolatedPosition(t){return Autopilot.extrapolatedPosition(this.advancedState.position,this.state.angle,this.speed(),t)}extrapolatedOuterPosition(t){t=this.extrapolatedPosition(t);return{x:t.x+Math.sqrt(2)*TANK_WIDTH/2*(90<=Math.abs(this.state.angle)?-1:1),y:t.y+Math.sqrt(2)*TANK_WIDTH/2*(this.state.angle<0?-1:1)}}speed(){return 2*this.control.THROTTLE*(1==this.control.BOOST?2:1)}static extrapolatedPosition(t,i,s,o){return{x:t.x+o*s*Math.cos(Math.deg2rad(i)),y:t.y+o*s*Math.sin(Math.deg2rad(i))}}}
    
    tank.init(function(settings, info) {
    })
    
    const autopilot = new Autopilot()
    let enemy
    let enemyAge
    let enemyDist
    let avoidingWall = false
    
    // Tweak these until we get good results
    const RAM_DIST = 50        // Ram into enemies if they somehow get this close
    
    const ENEMY_MAX_DIST = 250 // Keep enemies closer than this
    const ENEMY_MIN_DIST = 200 // Keep enemies farther away than this
    const ENEMY_MAX_AGE = 50   // Ticks to try to predict enemy movement
    
    const WALL_MIN_DIST = 20      // Start avoiding wall
    const WALL_RETREAT_DIST = 50 // Retreat to this distance from wall
    
    // Copied from autopilot but turns gun instead of whole tank
    function turnGunToAngle(angle, autopilot) {
      const curAngle = Math.deg.normalize(autopilot.state.angle + autopilot.state.gun.angle)
      angle = Math.deg.normalize(angle)
      if (curAngle == angle) {
        autopilot.control.TURN = 0
        return 0
      }
    
      let diffAngleToGoal = (Math.deg.normalize(angle - curAngle))
      let turn = diffAngleToGoal/2.0
      autopilot.control.GUN_TURN = turn
      return diffAngleToGoal
    }
    
    // Copied from autopilot but turns gun instead of whole tank
    function turnGunToPoint(x,y, autopilot, basedOnZeroOrigin = false) {
      if (!autopilot.isOriginKnown() && basedOnZeroOrigin) {
        throw new "Cannot turn to point based on zero origin because the origin is not yet known";
      }
    
      let translatedX = x + (basedOnZeroOrigin ? autopilot.origin.x : 0);
      let translatedY = y + (basedOnZeroOrigin ? autopilot.origin.y : 0);
      let angle = Math.deg.atan2(translatedY - autopilot.state.y, translatedX - autopilot.state.x);
      return turnGunToAngle(angle, autopilot);
    }
    
    function predict(enemy, ticks = 1) {
      // Predict where the enemy should be after a number of ticks
      return enemy;
    }
    
    
    tank.loop(function(state, control) {
      // Applies whatever we asked the autopilot to do
      autopilot.update(state, control);
      
      // Detect enemy
      if (state.radar.enemy) {
        // We have an enemy
        // Store them for later use and record when we last saw them
        enemy = state.radar.enemy
        enemyAge = 0
      }
      else {
        // We no longer see the enemy, so try to predict where they are
        enemy = predict(enemy)
        enemyAge += 1
        
        if (enemyAge <= ENEMY_MAX_AGE) {
          enemy = predict(enemy)
        } else {
          enemy = undefined
        }
      }
      
      if (enemy) {
        // Calculate distance and angle to enemy
        enemyDist = Math.sqrt((enemy.x - state.x)**2 + (enemy.y - state.y)**2)
        
        // We have an enemy so regardless of what we'll do, we'll always keep the radar on them, shoot and boost
        turnGunToPoint(enemy.x, enemy.y, autopilot)
        autopilot.lookAtEnemy(enemy)
        control.SHOOT = 0.1
        control.BOOST = 1
        
        if (enemyDist < RAM_DIST || enemyDist > ENEMY_MAX_DIST) {
          // Priority 1 is to ram the enemy since they may be backing us into a wall
          // Priority 2 is to pursue enemies that are far away so they don't escape
          autopilot.turnToPoint(enemy.x, enemy.y)
          control.THROTTLE = 1
          
          // Use bigger shots if ramming
          if (enemyDist < RAM_DIST) {
            control.SHOOT = 1
          }
          
          return
        }
      }
    
      let wallDist = WALL_MIN_DIST
      if (avoidingWall) { wallDist = WALL_RETREAT_DIST }
      
      // Priority 3 is to avoid walls because bumping into them hurts a lot
      if ((Math.abs(autopilot.origin.x + 425 - state.x) > 425 - wallDist || Math.abs(autopilot.origin.y + 225 - state.y) > 225 - wallDist)) {
        avoidingWall = true
        // If we are hitting a wall, we are probably facing away from the middle so
        // instead of turning towards the middle we should turn away and reverse
        let angle = Math.deg.atan2(225 - state.y, 425 - state.x);
        autopilot.turnToAngle(-angle)
        control.THROTTLE = -1
      } else {
        avoidingWall = false
        
        if (enemy) {
          // Angle to enemy, taken from Dodge tank code
          const enemyAngle = Math.deg.atan2(enemy.y - state.y, enemy.x - state.x)
    
          // Priority 4 is to back away from incoming enemies
          if (enemyDist < ENEMY_MIN_DIST) {
            // We are probably facing the enemy, so keep facing them and reverse instead of turning around
            autopilot.turnToAngle(enemyAngle)
            control.THROTTLE = -1
          }
          else {
            // Priority 5 is to circle around enemies at a set distance
            let angle = Math.deg.normalize(enemyAngle - 90)
            autopilot.turnToAngle(angle)
            if (angle < 90 || angle > 270) {
              control.THROTTLE = 1
            }
            else {
              control.THROTTLE = -1
            }
          }
        }
        else {
          // Priority 5 is to search for enemies
          control.TURN = 1
          control.RADAR_TURN = 1
          control.THROTTLE = 1
        }
      }
    })
    
    // YOUR CODE GOES ABOVE ^^^^^^^^ 
    }
    