var min = new Array(3)
  , max = new Array(3)

min[0] = min[1] = min[2] = Number.POSITIVE_INFINITY
max[0] = max[1] = max[2] = Number.NEGATIVE_INFINITY

module.exports = function(mesh) {
  mesh.positions.forEach(function(vert) {
    for (var i=0, l=3; i<l; i++) {
      min[i] = vert[i] < min[i] ? vert[i] : min[i]
      max[i] = vert[i] > max[i] ? vert[i] : max[i]
    }
  })

  var bounds = {min: min, max: max}
  //console.log('bounds:', bounds)
  return bounds
}
