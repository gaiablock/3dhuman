;"use strict"

exports.rotateX = function(v, angle) {
  v[1] = v[1]*Math.cos(angle) - v[2]*Math.sin(angle)
  v[2] = v[1]*Math.sin(angle) + v[2]*Math.cos(angle)
}

exports.rotateY = function(v, angle) {
  v[0] = v[2]*Math.sin(angle) + v[0]*Math.cos(angle)
  v[2] = v[2]*Math.cos(angle) - v[0]*Math.sin(angle)
}

exports.rotateZ = function(v, angle) {
  v[0] = v[0]*Math.cos(angle) - v[1]*Math.sin(angle)
  v[1] = v[0]*Math.sin(angle) + v[1]*Math.cos(angle)
}

exports.add = function(v1, v2) {
  v1[0] += v2[0]
  v1[1] += v2[1]
  v1[2] += v2[2]
}

exports.addScalar = function(v, val) {
  v[0] += val
  v[1] += val
  v[2] += val
}

exports.subtract = function(v1, v2) {
  v1[0] -= v2[0]
  v1[1] -= v2[1]
  v1[2] -= v2[2]
}

exports.subtractScalar = function(v, val) {
  v[0] -= val
  v[1] -= val
  v[2] -= val
}

exports.multiply = function(v1, v2) {
  v1[0] *= v2[0]
  v1[1] *= v2[1]
  v1[2] *= v2[2]
}

exports.multiplyScalar = function(v, val) {
  v[0] *= val
  v[1] *= val
  v[2] *= val
}

exports.divide = function(v1, v2) {
  v1[0] /= v2[0]
  v1[1] /= v2[1]
  v1[2] /= v2[2]
}

exports.divideScalar = function(v, val) {
  v[0] /= val
  v[1] /= val
  v[2] /= val
}

exports.length = function(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
}

exports.copy = function(v1, v2) {
  v1[0] = v2[0]
  v1[1] = v2[1]
  v1[2] = v2[2]
}
