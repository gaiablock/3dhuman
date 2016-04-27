precision mediump float;

attribute vec3 aPosition;
attribute float aPointSize;

varying float vDepth;

uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;

void main() {
	vDepth = aPointSize * (aPosition.z + 0.5);
  gl_PointSize = vDepth;
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
