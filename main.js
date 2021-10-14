function myTank() {
  // YOUR CODE GOES BELOW vvvvvvvv
  class AdvancedState { constructor(t) { this.state = t, this.absoluteRadarAngle = Math.deg.normalize(this.state.radar.angle + this.state.angle), this.position = { x: t.x, y: t.y } } orientationString() { return `${this.state.x}${this.state.y}${this.state.angle}${this.state.radar.angle}` } getPointAtDistanceAlongRadar(t) { return { x: this.state.x + Math.cos(this.absoluteRadarAngle * Math.PI / 180) * t, y: this.state.y + Math.sin(this.absoluteRadarAngle * Math.PI / 180) * t } } } const BATTLEFIELD_WIDTH = 850, BATTLEFIELD_HEIGHT = 550, SOUTH = 90, NORTH = -90, WEST = -180, EAST = 0, TANK_WIDTH = 36; var Constants = Object.freeze({ __proto__: null, BATTLEFIELD_WIDTH: BATTLEFIELD_WIDTH, BATTLEFIELD_HEIGHT: BATTLEFIELD_HEIGHT, SOUTH: SOUTH, NORTH: NORTH, WEST: WEST, EAST: EAST, TANK_WIDTH: TANK_WIDTH }); Number.prototype.isWhole = function (t = 1e-8) { return Math.abs(Math.round(this) - this) < t }; class OriginFinder { constructor() { this.origin = { x: void 0, y: void 0 }, this.lastX = void 0, this.lastY = void 0, this.lastOrientation = void 0 } update(i) { if (!this.origin.x || !this.origin.y) { var s = i.state.radar.wallDistance; if (s) { var o = this.lastOrientation && this.lastOrientation != i.orientationString(); this.lastOrientation = i.orientationString(); let t = i.getPointAtDistanceAlongRadar(s); !this.origin.x && t.x.isWhole() && (this.lastX && this.lastX == Math.round(t.x) && o && (this.origin.x = this.lastX - (90 <= Math.abs(i.absoluteRadarAngle) ? 0 : BATTLEFIELD_WIDTH)), this.lastX = Math.round(t.x)), !this.origin.y && t.y.isWhole() && (this.lastY && this.lastY == Math.round(t.y) && o && (this.origin.y = this.lastY - (0 < i.absoluteRadarAngle ? BATTLEFIELD_HEIGHT : 0)), this.lastY = Math.round(t.y)) } } } } class Autopilot { constructor() { this.originFinder = new OriginFinder, this.origin = this.originFinder.origin, this.advancedState = void 0, this.path = [], this.nextPosition = void 0 } update(t, i) { this.state = t, this.advancedState = new AdvancedState(t), this.control = i, this.originFinder.update(this.advancedState) } isOriginKnown() { return this.origin.x && this.origin.y } setOrigin(t, i) { this.origin.x = t, this.origin.y = i } lookEverywhere() { this.control.RADAR_TURN = 1 } lookAtEnemy(t) { t = Math.deg.atan2(t.y - this.state.y, t.x - this.state.x), t = Math.deg.normalize(t - this.state.angle), t = Math.deg.normalize(t - this.state.radar.angle); this.control.RADAR_TURN = t } isWallCollisionImminent(t = 3) { if (this.state.collisions.wall) return !0; if (this.isOriginKnown()) { t = this.extrapolatedOuterPosition(t); return t.x <= this.origin.x || t.x >= this.origin.x + BATTLEFIELD_WIDTH || t.y <= this.origin.y || t.y >= this.origin.y + BATTLEFIELD_HEIGHT } } turnToAngle(t) { if (t = Math.deg.normalize(t), this.state.angle == t) return this.control.TURN = 0; t = Math.deg.normalize(t - this.state.angle); return this.control.TURN = t / 2, t } turnToPoint(t, i, s = !1) { if (!this.isOriginKnown() && s) throw new "Cannot turn to point based on zero origin because the origin is not yet known"; t += s ? this.origin.x : 0, s = i + (s ? this.origin.y : 0), t = Math.deg.atan2(s - this.state.y, t - this.state.x); return this.turnToAngle(t) } moveToPoint(t, i, s = !1) { this.control.THROTTLE = 0; s = this.turnToPoint(t, i, s); s < 60 && (this.control.THROTTLE = (60 - s) / 60) } moveAlongAngle(t) { this.control.THROTTLE = 0; t = Math.abs(this.turnToAngle(t)); t < 60 && (this.control.THROTTLE = (60 - t) / 60) } loopOnPath(t, i, s = 50) { if (0 != t.length) { if (0 == this.path.length && (this.path = t, i)) { if (!this.isOriginKnown()) throw new "Cannot loop on positions based on zero origin because the origin is not yet known"; this.path.forEach(t => { t.x += this.origin.x, t.y += this.origin.y }) } this.nextPosition || (this.nextPosition = this.path.shift(), this.path.push(this.nextPosition)), Math.distance(this.nextPosition.x, this.nextPosition.y, this.state.x, this.state.y) <= s && (this.nextPosition = this.path.shift(), this.path.push(this.nextPosition)), this.moveToPoint(this.nextPosition.x, this.nextPosition.y) } } stopLoopOnPath() { this.path = [], this.nextPosition = void 0, this.stop() } stop() { this.control.TURN = 0, this.control.THROTTLE = 0, this.control.BOOST = 0 } shootEnemy(t) { var i; t && (i = Math.distance(this.state.x, this.state.y, t.x, t.y) / 4, i = Autopilot.extrapolatedPosition(t, t.angle, t.speed, i), i = Math.deg.atan2(i.y - this.state.y, i.x - this.state.x), i = Math.deg.normalize(i - this.state.angle), i = Math.deg.normalize(i - this.state.gun.angle), this.control.GUN_TURN = .3 * i, Math.abs(i) < 2 && (this.control.SHOOT = .1)) } extrapolatedPosition(t) { return Autopilot.extrapolatedPosition(this.advancedState.position, this.state.angle, this.speed(), t) } extrapolatedOuterPosition(t) { t = this.extrapolatedPosition(t); return { x: t.x + Math.sqrt(2) * TANK_WIDTH / 2 * (90 <= Math.abs(this.state.angle) ? -1 : 1), y: t.y + Math.sqrt(2) * TANK_WIDTH / 2 * (this.state.angle < 0 ? -1 : 1) } } speed() { return 2 * this.control.THROTTLE * (1 == this.control.BOOST ? 2 : 1) } static extrapolatedPosition(t, i, s, o) { return { x: t.x + o * s * Math.cos(Math.deg2rad(i)), y: t.y + o * s * Math.sin(Math.deg2rad(i)) } } }

  tank.init(function (settings, info) {
  })

  const autopilot = new Autopilot()
  let enemy
  let enemyAge
  let enemyDist
  let firstEnemyFound = false
  let avoidingWall = false
  let throttle = 1
  let fleeing = false
  let bullet

  // Tweak these until we get good results
  const RAM_DIST = 100 // Ram into enemies if they somehow get this close

  const ENEMY_MAX_DIST = 200 // Keep enemies closer than this
  const ENEMY_MIN_DIST = 150 // Keep enemies farther away than this
  const ENEMY_MAX_AGE = 100  // Ticks to try to predict enemy movement

  const WALL_MIN_DIST = 20     // Start avoiding wall
  const WALL_RETREAT_DIST = 30 // Retreat to this distance from wall

  const CIRCLE_TURN_RATE = 0.3 // Used when circling around trying to find walls or enemies

  const BULLET_SPEED = 4 // Used to predict where enemies will be when we shoot at them

  const MIN_BULLET_DAMAGE_TO_DODGE = 5 // Only try to dodge bullets that deal at least this much damage
  const BULLET_MAX_AGE = 50            // Try to dodge bullets for this long

  // Copied from autopilot but turns gun instead of whole tank
  function turnGunToAngle(angle, autopilot) {
    const curAngle = Math.deg.normalize(autopilot.state.angle + autopilot.state.gun.angle)
    angle = Math.deg.normalize(angle)
    if (curAngle == angle) {
      autopilot.control.TURN = 0
      return 0
    }

    let diffAngleToGoal = (Math.deg.normalize(angle - curAngle))
    let turn = diffAngleToGoal / 2.0
    autopilot.control.GUN_TURN = turn
    return diffAngleToGoal
  }

  // Copied from autopilot but turns gun instead of whole tank
  function turnGunToPoint(x, y, autopilot, basedOnZeroOrigin = false) {
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
    const prediction = Autopilot.extrapolatedPosition(enemy, enemy.angle, enemy.speed, ticks)
    return Object.assign({}, enemy, prediction)
  }

  tank.loop(function (state, control) {
    // Updates the autopilot with the current state
    autopilot.update(state, control);

    if (!firstEnemyFound && state.radio.inbox.length) {
      // We received an enemy's info from an allied tank
      enemy = state.radio.inbox[0];
      enemyAge = 0;
      firstEnemyFound = true;
    } else if (state.radar.enemy) {
      // We found an enemy via the radar
      // Store them for later use and record when we last saw them
      enemy = state.radar.enemy
      enemyAge = 0

      if (!firstEnemyFound) {
        // Tell other tanks about the enemy
        control.OUTBOX.push(enemy);
        firstEnemyFound = true;
      }
    } else {
      // We no longer see the enemy, so try to predict where they are
      enemyAge += 1

      if (enemyAge <= ENEMY_MAX_AGE) {
        enemy = predict(enemy)
      } else {
        enemy = undefined
      }
    }

    let allyDist = NaN
    if (state.radar.ally) {
      const ally = state.radar.ally
      allyDist = Math.sqrt((ally.x - state.x) ** 2 + (ally.y - state.y) ** 2)

      // Priority 1 is to avoid bumping into or shooting allies
      if (allyDist < 2*WALL_MIN_DIST) {
        // Back away from ally without turning
        const allyAngle = Math.deg.atan2(ally.y - state.y, ally.x - state.x)
        if (-90 < Math.deg.normalize(allyAngle - state.angle) < 90) {
          throttle = -throttle
          control.THROTTLE = throttle
        }
        else {
          control.THROTTLE = throttle
        }

        return
      }
    }

    if (state.collisions.ally) {
      // We hit them but can't see them so try reversing
      throttle = -throttle
      control.THROTTLE = throttle

      return
    }

    if (enemy) {
      // Calculate distance and angle to enemy
      enemyDist = Math.sqrt((enemy.x - state.x) ** 2 + (enemy.y - state.y) ** 2)

      // We have an enemy so regardless of what we'll do,
      // we'll always keep the radar on them, boost and shoot (unless an ally is closer)
      autopilot.lookAtEnemy(enemy)
      const bulletTime = enemyDist/BULLET_SPEED
      const futureEnemy = predict(enemy, bulletTime)
      turnGunToPoint(futureEnemy.x, futureEnemy.y, autopilot)
      control.BOOST = 1

      if (allyDist < enemyDist) {
        // Don't shoot if an ally is in the way
        control.SHOOT = 0
      }
      else {
        // If no ally is in the way, always shoot
        control.SHOOT = 0.1
      }

      if (!autopilot.isOriginKnown() || enemyDist < RAM_DIST || (enemyDist > ENEMY_MAX_DIST && (!bullet || bullet.age > BULLET_MAX_AGE))) {
        // Priority 2 is to ram the enemy since they may be backing us into a wall
        // Priority 3 is to pursue enemies that are far away so they don't escape,
        // but only if there is not an incoming bullet
        // We always try to ram the enemy if we don't know where the walls are because it's safer
        // Don't attempt to move forward if an ally is in the way, however...
        autopilot.turnToPoint(enemy.x, enemy.y)

        if (enemyDist < RAM_DIST) {
          if (state.energy < 25) {
            // Flee when below 25 energy
            if (!fleeing) {
              // Reverse throttle but only once
              // If we hit a wall after this,
              // we just ram them again because that's better than hitting the wall
              throttle = -1
              fleeing = true
            }

            if (state.collisions.wall) throttle = -throttle
            control.THROTTLE = throttle
          }

          // Use bigger shots if ramming
          control.SHOOT = 1
        }
        else {
          control.THROTTLE = 1
        }

        return
      }
    }

    let wallDist = WALL_MIN_DIST
    if (avoidingWall) { wallDist = WALL_RETREAT_DIST }

    // Priority 4 is to find the walls and avoid bumping into them because that hurts a lot
    if (!autopilot.isOriginKnown()) {
      // Spin around trying to find walls
      if (state.collisions.wall) throttle = -throttle
      control.TURN = CIRCLE_TURN_RATE
      control.RADAR_TURN = 1
      control.THROTTLE = throttle

      return
    }

    // Calculate angle to center of the battlefield
    const centerDiffY = autopilot.origin.y + Constants.BATTLEFIELD_HEIGHT/2 - state.y
    const centerDiffX = autopilot.origin.x + Constants.BATTLEFIELD_WIDTH/2 - state.x
    const centerAngle = Math.deg.atan2(centerDiffY, centerDiffX)

    if (
      Math.abs(centerDiffX) > Constants.BATTLEFIELD_WIDTH/2 - wallDist ||
      Math.abs(centerDiffY) > Constants.BATTLEFIELD_HEIGHT/2 - wallDist
    ) {
      // We are too close to the wall so back away
      // We are probably facing away from the middle so instead of
      // turning towards the middle we should turn away and reverse
      if (!avoidingWall) throttle = -throttle
      avoidingWall = true
      control.THROTTLE = throttle

      let angle = centerAngle
      if (throttle < 0) angle = angle + 180

      autopilot.turnToAngle(angle)

      return
    }

    // After we are done avoiding a wall, reverse circling direction to try to break free
    avoidingWall = false

    // Priority 5 is to dodge bullets
    for (const blt of state.radar.bullets) {
      if (blt.damage > MIN_BULLET_DAMAGE_TO_DODGE) {
        bullet = blt
        bullet.age = 0
        break
      }
    }

    if (bullet && bullet.age <= BULLET_MAX_AGE) {
      bullet = predict(bullet)
      bullet.age += 1

      const bulletAngle = Math.deg.atan2(bullet.y - state.y, bullet.x - state.x)
      const turnAngle = Math.deg.normalize(bulletAngle - 90)
      autopilot.turnToAngle(turnAngle)
      if (-90 < Math.deg.normalize(state.angle - bullet.angle) < 90) {
        // We are heading the same way the bullet is, so back away
        control.THROTTLE = -1
      } else {
        // We are heading the opposite way
        control.THROTTLE = 1
      }

      return
    }

    if (enemy) {
      // Angle to enemy, taken from Dodge tank code
      const enemyAngle = Math.deg.atan2(enemy.y - state.y, enemy.x - state.x)

      // Priority 6 is to back away from incoming enemies
      if (enemyDist < ENEMY_MIN_DIST) {
        // We are probably facing the enemy,
        // so keep facing them and reverse instead of turning around
        autopilot.turnToAngle(enemyAngle)
        control.THROTTLE = -1
      }
      else {
        // Priority 7 is to circle around enemies at a set distance
        const turnAngle = Math.deg.normalize(enemyAngle - 90)
        autopilot.turnToAngle(turnAngle)
        control.THROTTLE = throttle
        if (-90 < Math.deg.normalize(state.angle - turnAngle) < 90) {
          control.THROTTLE = throttle
        }
        else {
          control.THROTTLE = -throttle
        }
      }

      return
    }

    // Priority 8 is to search for enemies
    if (Math.deg.normalize(centerAngle - state.angle) > 0) {
      control.TURN = CIRCLE_TURN_RATE * throttle
    } else {
      control.TURN = -CIRCLE_TURN_RATE * throttle
    }
    control.RADAR_TURN = 1
    control.THROTTLE = throttle
  })

  // YOUR CODE GOES ABOVE ^^^^^^^^
}
