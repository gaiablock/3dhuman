;"use strict"

// This code is based on tutorials 
// published by Seb Lee-Delisle (http://seb.ly)

// for other examples visit:
// https://github.com/sebleedelisle/live-coding-presentations/tree/835f51222648dd1ba4d89a8cb5421bcfb7142ddb/2011/1_Particles/js

/** Copyright (c)2010-2011, Seb Lee-Delisle, sebleedelisle.com All
rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

* Redistributions of source code must retain the above copyright
* notice, this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright
* notice, this list of conditions and the following disclaimer in the
* documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
**/ 

var particle = require('./Particle')
  , vec3 = require('../vec3-math')
  , update_count = 0


// Constructor:
function ParticleSystem(models, qty) {
  this.max_cells = qty || 1024
  this.point_size = 2.65
  this.cell_agitation = 3.33
  this.model_count = models.length
  this.model_selected = 0

  var buffer_size  = this.max_cells * 3
    , buffer_start = this.model_selected * buffer_size
    , buffer_end   = buffer_start + buffer_size

  this.cells = []
  this.positions = new Float32Array(this.max_cells * this.model_count * 3)
  this.buffer = this.positions.subarray(buffer_start, buffer_end)
  this.volumes = []

  for (var i=0, il=models.length; i<il; i++) {
    this.volumes.push(require('../Volume').create(models[i], this.max_cells))
  }

  bad_spawns = initCells.call(this)

  var cse = this.max_cells / (this.max_cells + bad_spawns) * 100
  console.log(
      'cells:', { 'count': this.max_cells/1024 +'k'
    , 'spawn efficiency': (cse == 100 ? cse : cse.toFixed(2)) +'%' }
  )
}
var proto = ParticleSystem.prototype


// Public API:
proto.update = function() {

  // @TODO: Alternate particle updates (using particle.index = odd/even)

  var start_time = Date.now()

  // Update physics properties for particles
  var cells = this.cells
    , positions = this.positions
    , repelForce = [ 0, 0, 0 ]
    , repelStrength
    , mag
    , step = 2

  for (var i=update_count, il=cells.length; i<il; i+=step) {

    var p1 = cells[i]
      , offset = this.model_selected * (this.max_cells * 3)
      , p1_idx = offset + (3 * p1.index)
      , p1_pos = [ positions[p1_idx], positions[p1_idx+1], positions[p1_idx+2] ]

    vec3.copy(repelForce, p1_pos)

    mag = vec3.length(repelForce)
    repelStrength = (mag - this.cell_agitation) *-0.1

    if (repelStrength < 0) {
      vec3.multiplyScalar(repelForce, repelStrength/mag)
      vec3.add(p1_pos, repelForce)
    }

    if (i >= il-1) continue  // end of stack!

    for (var j=i+1; j<cells.length; j+=step) {
      var p2 = cells[j]
        , p2_idx = offset + (3 * p2.index)
        , p2_pos = [ positions[p2_idx], positions[p2_idx+1], positions[p2_idx+2] ]

      vec3.copy(repelForce, p2_pos)
      vec3.subtract(repelForce, p1_pos)
      mag = vec3.length(repelForce)

      if ((repelStrength > 0) && (mag > 0)) {
        vec3.multiplyScalar(repelForce, repelStrength*0.0025 / mag)
        vec3.subtract(p1.force, repelForce)
        vec3.add(p2.force, repelForce)
      }
    }
  }

  // update cell positions
  for (var i=update_count, il=cells.length; i<il; i+=step) {
    var offset = this.model_selected * (this.max_cells * 3)
      , idx = offset + (i * 3)
      , vol = this.volumes[this.model_selected]
      , current_position = [ positions[idx], positions[idx+1], positions[idx+2] ]
      , new_position = cells[i].update(current_position)
      , dist = vol.SDF(vol.grid, vol.mesh.normals, new_position)

    // check new cell position is within mesh boundary
    if (dist && dist < 0) {
      positions[idx]   = new_position[0]
      positions[idx+1] = new_position[1]
      positions[idx+2] = new_position[2]
    } else if (dist > 1e-6) {
      // reverse the velocity vector
      vec3.multiplyScalar(cells[i].velocity, -1)
    }
  }

  update_count = ++update_count % 2

  // calculate elapsed time for this update
  var elapsed_time = Date.now() - start_time
  if (elapsed_time > 199) console.warn('physics update took', elapsed_time +'ms')
}

proto.model_select = function(model_id) {
  this.model_selected = model_id

  var buffer_size  = this.max_cells * 3
    , buffer_start = this.model_selected * buffer_size
    , buffer_end   = buffer_start + buffer_size

  this.buffer = this.positions.subarray(buffer_start, buffer_end)
}


// Utilities:
function initCells() {
  var qty = this.max_cells

  // Calculate cell positions for all model meshes at startup
  for (var m=0, ml=this.volumes.length; m<ml; m++) {

    // calculate the mesh bounds
    var bounds  = require('../MeshBounds')(this.volumes[m].mesh)
      , radiusX = Math.max(Math.abs(bounds.min[0]), bounds.max[0])
      , radiusZ = Math.max(Math.abs(bounds.min[2]), bounds.max[2])
      , offsetY = bounds.min[1]
      , lengthY = Math.abs(bounds.min[1]) + bounds.max[1]

    for (var i=0, il=qty; i<il; i++) {

      // spawned particles are shared across model meshes
      if (m === 0) this.cells.push(particle.create(i))

      var offset = m * (this.max_cells * 3)
        , idx = offset + (i * 3)
        , angle = Math.random() * (Math.PI * 2)
        , bad_spawns = 0
        , cell_spawned_inside_mesh = false

      while(!cell_spawned_inside_mesh) {

        // randomly scatter initial point location
        this.positions[idx]   = Math.random() * radiusX * Math.cos(angle)
        this.positions[idx+1] = Math.random() * lengthY - offsetY
        this.positions[idx+2] = Math.random() * radiusZ * Math.sin(angle)

        var point = [ this.positions[idx], this.positions[idx+1], this.positions[idx+2] ]
          , dist = this.volumes[m].SDF(this.volumes[m].grid, this.volumes[m].mesh.normals, point)

        if (dist && dist < 0)
          cell_spawned_inside_mesh = true
        else
          bad_spawns++
      }
    }
  }

  return bad_spawns
}

function toRadians(angle) {
  return angle * (Math.PI / 180)
}


// Publish:
exports.ParticleSystem = ParticleSystem

exports.create = function(models, qty) {
  return new ParticleSystem(models, qty)
}
