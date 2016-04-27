;"use strict"

var extend = require('util')._extend

// cube mesh
var cube = {
    cells: [
         0,  1,  2,  2,  1,  3
      ,  4,  5,  6,  6,  5,  7
      ,  8,  9, 10, 10,  9, 11
      , 12, 13, 14, 14, 13, 15
      , 16, 17, 18, 18, 17, 19
      , 20, 21, 22, 22, 21, 23 ]
  , positions: [
        -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5
      , -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5
      , -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,  -0.5, -0.5, -0.5,   0.5, -0.5, -0.5
      , -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,   0.5, -0.5,  0.5
      ,  0.5, -0.5,  0.5,   0.5, -0.5, -0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5
      , -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5 ]
}

var _defaultOptions = {
    mesh: cube
  , tolerance: 0.02
  , qty: 1024
}

// Constructor:
function Volume(options) {
  var opts = extend(_defaultOptions, options || {})

  this.mesh = opts.mesh
  this.tolerance = opts.tolerance
  this.num_points = opts.qty

  var mesh = this.mesh
  this.grid = require('spatial-grid')(
      mesh.cells
    , mesh.positions
    , this.tolerance)
  mesh.normals = require('normals').faceNormals(mesh.cells, mesh.positions)
  this.SDF = require('signed-distance')
}

exports.create = function(mesh, qty) {
  var opts = { mesh: mesh, qty: qty}
  return new Volume(opts)
}
