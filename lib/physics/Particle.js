;"use strict"

var vec3 = require('../vec3-math')

// Constructor:
function Particle(id) {
  this.index = parseInt(id)

  // add initial physics properties to this particle
  this.velocity = [ 0, 0, 0 ]
  this.force    = [ 0, 0, 0 ]

  // randomize initial velocity vector
  vec3.rotateX(this.velocity, Math.random() * 360)
  vec3.rotateY(this.velocity, Math.random() * 180)
  vec3.rotateZ(this.velocity, Math.random() * 360)

  this.drag     = 0.70
}
var proto = Particle.prototype

// Public API:
proto.update = function(pos) {
  vec3.add(this.velocity, this.force)
  vec3.multiplyScalar(this.velocity, this.drag)

  // make some noise (affecting particle velocity)
  var interference = Math.random()
  if (interference < 0.25) {
    vec3.rotateX(this.velocity, Math.random() * 180)
    vec3.multiplyScalar(this.velocity, -0.5)
  } else if (interference < 0.5) {
    vec3.rotateY(this.velocity, Math.random() * 360)
    //vec3.multiplyScalar(this.velocity,  1.5)
  } else if (interference < 0.75) {
    vec3.rotateZ(this.velocity, Math.random() * 180)
    vec3.multiplyScalar(this.velocity,  1.5)
  } else {
    vec3.multiply(this.velocity, this.velocity)
  }

  vec3.add(pos, this.velocity)
  this.force[0] = this.force[1] = this.force[2] = 0
  return pos
}

function toRadians(angle) {
  return angle * (Math.PI / 180)
}

exports.Particle = Particle

exports.create = function(id) {
  return new Particle(id)
}
