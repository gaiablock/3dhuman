var shell = require('gl-now')({tickRate: 22, clearColor: [0,0,0,1]})
  , createBuffer = require('gl-buffer')
  , createVAO = require('gl-vao')
  , glShader = require('gl-shader')
  , glslify = require('glslify')
  , mat4 = require('gl-mat4')
  , camera = require('lookat-camera')()

  , models = [require('../assets/models/female'), require('../assets/models/male')]
  , model_changed = false
  , selected_mesh = 0
  , num_cells = 1024 * 2.0
  , PS = require('../lib/physics/ParticleSystem').create(models, num_cells)
  , UI = null
  , stats = null
  , frame_count = 0

var projection = mat4.create()
  , model      = mat4.create()
  , view       = mat4.create()
  , VAO
  , shader

shell.on('gl-init', init)
shell.on('gl-render', render)
shell.on('tick', update_particles)

// init
function init() {
  var gl = shell.gl

  // User interface
  if (typeof dat.GUI === 'function') {
    UI = new dat.GUI()
    setup_UI()
  }

  if (typeof Stats === 'function') {
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // Create shader object 
  shader = glShader(gl
    , glslify('../lib/shaders/cells.vs')
    , glslify('../lib/shaders/cells.fs')
  )
  shader.attributes.aPosition.location = 0
  shader.attributes.aPointSize.location = 1
 
  // Create vertex array object
  VAO = createVAO(gl, [
      { 'buffer': createBuffer(gl, PS.buffer),
        'type': gl.FLOAT,
        'size': 3
      }
    , [PS.point_size]
  ])

  // Note: slightly delayed start of particle updates
  window.setTimeout(function() {
    UI_controls.physics = true
  }, 900)
}
 
// render
function render() {
  stats.begin()
  update()
 
  shader.bind()
  shader.uniforms.uProjection = projection
  shader.uniforms.uView = view
  shader.uniforms.uModel = model
 
  VAO.bind()
  VAO.draw(shell.gl.POINTS, num_cells)
  VAO.unbind()

  frame_count++
  stats.end()
}

// update
function update() {
  var gl = shell.gl

  // preload draw buffers for each model mesh
  if (frame_count < models.length + 1) {
    selected_mesh = frame_count % models.length
    model_changed = true
  }

  if (model_changed) {

    // momentarily pause particle updates
    if (UI_controls.physics) {
      UI_controls.physics = false
      window.setTimeout(function() {
        UI_controls.physics = true
      }, 100)
    }

    PS.model_select(selected_mesh)
    model_changed = false
  }

  // Update vertex array object
  VAO.update([
    { 'buffer': createBuffer(gl, PS.buffer),
      'type': gl.FLOAT,
      'size': 3
    }
  ])

  camera.target = [ 0, 3.5, 0 ]
  if (UI_controls.rotation) camera.position[0] = 2 * Math.cos(Date.now() / 3000)
  camera.position[1] = 5
  camera.position[2] = 9
  camera.view(view)

  var aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight
    , fieldOfView = Math.PI / 4
    , near = 0.01
    , far  = 100

  mat4.perspective(projection, fieldOfView, aspectRatio, near, far)
}

// update particle system (physics)
function update_particles() {
  if (UI_controls.physics) PS.update()
}

function setup_UI() {
  UI_controls = {
      'gender': selected_mesh
    , 'rotation': true
    , 'physics': false
    , 'blood oxygen': 96
    , 'core temp': 37
  }

  var h = UI.addFolder('3D human:')
  var gender_control = h.add(UI_controls, 'gender', { 'Female': 0, 'Male': 1 } ).name('Gender:')
  gender_control.onChange(function(val) {
    selected_mesh = val
    model_changed = true
  })
  h.add(UI_controls, 'rotation').name('Rotation:').listen()
  h.add(UI_controls, 'physics').name('Particle physics:').listen()
  h.open()

  var h = UI.addFolder('Health analysis:')
  h.add(UI_controls, 'blood oxygen', 75, 100)
  h.add(UI_controls, 'core temp', 25, 45)
  h.open()
}

function isOdd(n) { return n & 1 }
