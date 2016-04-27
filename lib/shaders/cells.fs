precision mediump float;

varying float vDepth;

void main() {
	float r, g, b;					/* orange/yellow */
	r = 0.72 / vDepth * 1.2;		/* 1.0           */
	g = 0.5;						/* 0.75 / vDepth */
	b = 0.25 / vDepth * 1.6;		/* 0.0           */

  gl_FragColor = vec4(r, g, b, 1.0);
}
