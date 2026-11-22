/* mickverzola.com
 *
 * A field of dust that starts as turbulence and settles into shapes as you scroll:
 * the M mark, a portrait, three small diagrams, three years, a horizon. Scroll position is the dial.
 *
 * How it works
 * - Every grain has a position and a velocity that live on the graphics card. Each frame a
 *   vertex shader moves them (transform feedback) with three forces: a spring toward the
 *   grain's place in the current shape, a curl-noise flow field, and the pointer.
 * - Shapes are sampled once in JavaScript (from the logo path, from text drawn with the page
 *   font, from the portrait's pixels) into one float texture layer per scene.
 * - Grains are drawn additively into a half-float buffer with a little persistence, then a
 *   final pass adds bloom, tone mapping, a vignette and grain.
 *
 * Three ways the page can look
 * - live:   the field above, running behind the page.
 * - plates: motion off. A second, throwaway engine with more grains settles each scene once
 *           and hands back a still frame, which becomes that section's backdrop. Nothing moves.
 * - plain:  no WebGL2 or no JavaScript. An ordinary document with the photo and the logo.
 *
 * No libraries and no build step.
 */

const CAMZ = 3.2;                 // camera distance; at z = 0 the screen is 2 units tall
const TEX_W = 512;                // width of the per-grain data textures
const REF_COUNT = 180000;         // grain count the brightness is tuned for
const TRANSIT = 0.55;             // extra turbulence while grains travel between shapes
const DUST = [0.14, 0.6, 2.2];    // turbulence, spring, damping for grains not in a shape

// One entry per scene, in page order. The index is also the texture layer.
//   frac  share of grains that take part in the shape (the rest drift as dust)
//   turb  turbulence, k spring stiffness, damp velocity damping, wave ripple height
//   focus/dof depth of field, trail persistence per 60 Hz frame
const SCENES = [
  { name: 'intro',   frac: 1.00, turb: 1.00, k: 1.5,  damp: 1.9, wave: 0,     focus: -0.3, dof: 0.55, trail: 0.93 },
  { name: 'mark',    frac: 0.55, turb: 0.05, k: 22,   damp: 6.4, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.70 },
  { name: 'about',   frac: 0.90, turb: 0.04, k: 20,   damp: 6.4, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.66 },
  { name: 'problems', frac: 0.40, turb: 0.05, k: 22,  damp: 6.4, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.70 },
  { name: 'y2024',   frac: 0.52, turb: 0.05, k: 24,   damp: 6.6, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.70 },
  { name: 'y2023',   frac: 0.52, turb: 0.05, k: 24,   damp: 6.6, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.70 },
  { name: 'y2018',   frac: 0.52, turb: 0.05, k: 24,   damp: 6.6, wave: 0,     focus: 0,    dof: 0.9,  trail: 0.70 },
  { name: 'contact', frac: 0.62, turb: 0.00, k: 14,   damp: 5.6, wave: 0.045, focus: -0.7, dof: 0.32, trail: 0.68 },
];
const layerOf = (name) => SCENES.findIndex((s) => s.name === name);
const PORTRAIT_LAYER = layerOf('about');
// Facts about sampled shapes that layout() needs: filled in by buildShapes().
const SHAPE = { problems: { pitch: 0.8, ratio: 0.15 } };
// Where the dust gathers at rest: x, y, radius in the intro scene's own -1..1 frame.
const CLOUDS = [[0.42, 0.22, 0.34], [0.78, -0.4, 0.26], [0.08, 0.74, 0.22], [-0.62, 0.7, 0.2],
  [-0.24, -0.76, 0.24], [0.5, -0.82, 0.2], [0.92, 0.62, 0.22], [-0.9, -0.56, 0.22], [-0.82, 0.1, 0.16]];

/* Where each shape sits, in world units, for a given screen aspect (width / height).
   Tall screens stack the shape above the words; wide screens put them side by side.
   styles.css uses the same 9/10 threshold. */
function layout(name, A, m) {
  const stacked = A < 0.9;
  let s;
  switch (name) {
    case 'intro':
      return { s: [Math.max(A, 0.7) * 1.55, 1.45, 1.3], o: [0, 0, -0.35] };
    case 'mark':
      s = stacked ? A * 0.74 : Math.min(0.52, A * 0.4);
      return { s: [s, s, s], o: [0, stacked ? 0.24 : 0.16, 0] };
    case 'about':
      s = stacked ? Math.min(A * 0.86, 0.46) : Math.min(0.66, A * 0.37);
      return { s: [s, s, s], o: stacked ? [0, 0.4, 0] : [-A * 0.46, 0, 0] };
    case 'contact':
      return { s: [Math.max(A, 0.8) * 3, 1, 3.45], o: [0, stacked ? -0.6 : -0.5, -1.55] };
    case 'problems': {
      // Three diagrams, one above each column of words. m is measured from the page:
      // the first column's left edge, the distance between columns, and the top of the words.
      const info = SHAPE.problems;
      if (!m) { s = Math.min(A * 0.8, 0.9); return { s: [s, s, s], o: [0, 0.45, 0] }; }
      const row = m.pitch > 0.05;
      s = row ? m.pitch / info.pitch : Math.min(A * 0.8, 0.5);
      const y = m.top + 0.06 + s * info.ratio;
      return { s: [s, s, s], o: [row ? m.left + s : 0, y, 0] };
    }
    default: // the three years
      s = stacked ? A * 0.8 : Math.min(0.66, A * 0.37);
      return { s: [s, s, s], o: stacked ? [0, 0.38, 0] : [A * 0.46, 0.02, 0] };
  }
}

/* ------------------------------------------------------------------ shaders */

const COMMON = `
const float CAMZ = ${CAMZ.toFixed(2)};
// Each grain leaves and arrives at its own moment, so shapes dissolve and form gradually.
float stagger(float m, float s){
  float x = clamp(m * 1.55 - s * 0.55, 0.0, 1.0);
  return x * x * (3.0 - 2.0 * x);
}`;

const SIM_VS = `#version 300 es
precision highp float; precision highp int; precision highp sampler2DArray;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aVel;
layout(location=2) in vec4 aSeed;
uniform sampler2DArray uTargets;
uniform int uTexW, uA, uB;
uniform float uMix, uTime, uDt, uTransit, uPtrEnergy, uBurst, uWind, uSnap;
uniform vec3 uScale0, uOff0, uScaleA, uOffA, uScaleB, uOffB;
uniform vec4 uParA, uParB;        // turbulence, spring, damping, wave
uniform vec3 uDust;
uniform vec2 uPtr, uPtrVel;
out vec3 vPos;
out vec3 vVel;
${COMMON}

float hash(ivec3 p){
  uint n = uint(p.x) * 1597334673u ^ uint(p.y) * 3812015801u ^ uint(p.z) * 2798796415u;
  n = (n ^ (n >> 15u)) * 2246822519u;
  n = (n ^ (n >> 13u)) * 3266489917u;
  n ^= n >> 16u;
  return float(n) * (1.0 / 4294967295.0);
}

// Value noise that also returns its gradient, so the curl below needs no finite differences.
vec4 noised(vec3 x){
  vec3 i = floor(x), w = fract(x);
  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);
  ivec3 ip = ivec3(i);
  float a = hash(ip),                 b = hash(ip + ivec3(1,0,0));
  float c = hash(ip + ivec3(0,1,0)),  d = hash(ip + ivec3(1,1,0));
  float e = hash(ip + ivec3(0,0,1)),  f = hash(ip + ivec3(1,0,1));
  float g = hash(ip + ivec3(0,1,1)),  h = hash(ip + ivec3(1,1,1));
  float k0 = a, k1 = b - a, k2 = c - a, k3 = e - a;
  float k4 = a - b - c + d, k5 = a - c - e + g, k6 = a - b - e + f;
  float k7 = -a + b + c - d + e - f - g + h;
  return vec4(
    -1.0 + 2.0 * (k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z),
    2.0 * du * vec3(k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                    k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                    k3 + k6*u.x + k5*u.y + k7*u.x*u.y));
}

// Curl of a three-channel noise potential: a flow with no sources or sinks, so the dust
// swirls and streams instead of bunching up.
vec3 curl(vec3 p){
  vec3 a = noised(p).yzw;
  vec3 b = noised(p + vec3(31.4, 17.7, -9.2)).yzw;
  vec3 c = noised(p + vec3(-12.3, 47.1, 23.9)).yzw;
  return vec3(c.y - b.z, a.z - c.x, b.x - a.y);
}

float wave(vec3 p, float t){
  return sin(p.x * 2.1 + t * 0.8) * cos(p.z * 1.7 - t * 0.55) + 0.5 * sin(p.x * 4.3 - p.z * 3.1 + t * 1.2);
}

void main(){
  ivec2 tc = ivec2(gl_VertexID % uTexW, gl_VertexID / uTexW);
  vec4 th = texelFetch(uTargets, ivec3(tc, 0), 0);
  vec4 ta = texelFetch(uTargets, ivec3(tc, uA), 0);
  vec4 tb = texelFetch(uTargets, ivec3(tc, uB), 0);
  float m = stagger(uMix, aSeed.x);

  // A negative brightness marks a grain that sits this shape out and drifts at "home".
  vec3 home = th.xyz * uScale0 + uOff0;
  float dustA = step(ta.w, 0.0), dustB = step(tb.w, 0.0);
  vec3 pa = ta.xyz * uScaleA + uOffA;
  vec3 pb = tb.xyz * uScaleB + uOffB;
  pa.y += uParA.w * wave(pa, uTime) * (1.0 - step(0.01, abs(ta.y)));
  pb.y += uParB.w * wave(pb, uTime) * (1.0 - step(0.01, abs(tb.y)));
  pa = mix(pa, home, dustA);
  pb = mix(pb, home, dustB);
  vec3 target = mix(pa, pb, m);
  if (uSnap > 0.5) { vPos = target; vVel = vec3(0.0); return; }

  vec3 par = mix(mix(uParA.xyz, uDust, dustA), mix(uParB.xyz, uDust, dustB), m);
  float turb = par.x + uTransit * sin(3.14159265 * m);
  float k = par.y * (0.55 + 0.9 * aSeed.y);

  vec3 acc = (target - aPos) * k;
  acc += curl(aPos * 0.8 + vec3(0.0, 0.0, uTime * 0.05)) * turb * 1.7;
  acc.y += uWind * (0.4 + aSeed.w);

  // The pointer acts where it appears on screen, whatever the grain's depth.
  float w = max((CAMZ - aPos.z) / CAMZ, 0.05);
  vec2 d = aPos.xy / w - uPtr;
  float d2 = dot(d, d);
  vec2 dn = d / (sqrt(d2) + 1e-4);
  float near = exp(-d2 / 0.05);
  acc.xy += (uPtrVel * 5.0 + dn * uPtrEnergy * 5.0
             + vec2(-dn.y, dn.x) * uPtrEnergy * 7.0 * (aSeed.z - 0.5)) * near * w;
  acc.z += (aSeed.z - 0.5) * uPtrEnergy * near * 6.0;
  float blast = exp(-d2 / 0.22) * uBurst;
  acc.xy += dn * blast * 48.0 * (0.3 + 1.2 * aSeed.y) * w;
  acc.z += (aSeed.w - 0.5) * blast * 60.0;

  vec3 vel = (aVel + acc * uDt) * exp(-par.z * uDt);
  vPos = aPos + vel * uDt;
  vVel = vel;
}`;

const SIM_FS = `#version 300 es
precision lowp float;
void main(){}`;

const DRAW_VS = `#version 300 es
precision highp float; precision highp int; precision highp sampler2DArray;
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aVel;
layout(location=2) in vec4 aSeed;
uniform sampler2DArray uTargets;
uniform highp sampler2D uPortrait;
uniform int uTexW, uA, uB, uPortraitLayer;
uniform float uMix, uTime, uAspect, uSize, uGain, uFocus, uDof;
uniform vec2 uCam;
out vec3 vCol;
${COMMON}

// Turbulence is many colours; clarity is one.
vec3 chaosColor(vec3 p, vec4 s){
  float h = 0.5 + 0.5 * sin(p.x * 1.05 + p.y * 0.8 + p.z * 1.3 + uTime * 0.07);
  h = clamp(h * 0.86 + s.z * 0.2, 0.0, 1.0);
  vec3 c = mix(vec3(1.0, 0.50, 0.17), vec3(1.0, 0.24, 0.42), smoothstep(0.0, 0.34, h));
  c = mix(c, vec3(0.45, 0.33, 1.0), smoothstep(0.30, 0.66, h));
  return mix(c, vec3(0.13, 0.70, 0.95), smoothstep(0.62, 1.0, h));
}

vec3 layerColor(int layer, ivec2 tc, vec3 chaos, vec3 clear){
  if (layer == 0) return chaos;
  if (layer == uPortraitLayer) return texelFetch(uPortrait, tc, 0).rgb;
  return clear;
}

void main(){
  ivec2 tc = ivec2(gl_VertexID % uTexW, gl_VertexID / uTexW);
  float wa = texelFetch(uTargets, ivec3(tc, uA), 0).w;
  float wb = texelFetch(uTargets, ivec3(tc, uB), 0).w;
  float m = stagger(uMix, aSeed.x);

  vec3 chaos = chaosColor(aPos, aSeed);
  vec3 clear = mix(vec3(1.0, 0.70, 0.36), vec3(1.0, 0.90, 0.70), aSeed.z);
  vec3 dust = mix(clear, chaos, 0.45);
  vec3 ca = mix(layerColor(uA, tc, chaos, clear), dust, step(wa, 0.0));
  vec3 cb = mix(layerColor(uB, tc, chaos, clear), dust, step(wb, 0.0));
  vec3 col = mix(ca, cb, m);
  float bright = mix(abs(wa), abs(wb), m);

  // A grain in a hurry shows its colours again.
  float speed = length(aVel);
  col = mix(col, chaos, smoothstep(0.3, 1.8, speed) * 0.85);

  // Small camera turn (pointer + a slow sway) so depth reads as depth.
  vec3 p = aPos;
  float cy = cos(uCam.x), sy = sin(uCam.x), cx = cos(uCam.y), sx = sin(uCam.y);
  p.xz = vec2(p.x * cy + p.z * sy, -p.x * sy + p.z * cy);
  p.yz = vec2(p.y * cx - p.z * sx, p.y * sx + p.z * cx);

  float w = (CAMZ - p.z) / CAMZ;
  if (w < 0.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 1.0; vCol = vec3(0.0); return; }
  gl_Position = vec4(p.x / uAspect, p.y, 0.0, w);

  float coc = 1.0 + abs(p.z - uFocus) * uDof;      // out-of-focus grains spread and dim
  // most grains are fine; a few are large enough to catch the eye
  float size = uSize * (0.6 + 0.7 * aSeed.y + 3.2 * pow(aSeed.y, 9.0)) / w * coc;
  float px = clamp(size, 1.0, 44.0);
  gl_PointSize = px;
  float twinkle = 0.84 + 0.16 * sin(uTime * (0.8 + aSeed.x * 2.6) + aSeed.w * 40.0);
  vCol = col * bright * uGain * twinkle * min(1.0, size * size) / pow(coc, 1.6);
}`;

const DRAW_FS = `#version 300 es
precision highp float;
in vec3 vCol;
out vec4 o;
void main(){
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  o = vec4(vCol * (exp(-r2 * 3.2) - 0.04), 1.0);
}`;

const QUAD_VS = `#version 300 es
out vec2 vUv;
void main(){
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FADE_FS = `#version 300 es
precision highp float;
uniform sampler2D uPrev;
uniform float uDecay;
in vec2 vUv;
out vec4 o;
void main(){ o = vec4(textureLod(uPrev, vUv, 0.0).rgb * uDecay, 1.0); }`;

const POST_FS = `#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform float uTime, uBloom, uExposure;
in vec2 vUv;
out vec4 o;
float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main(){
  vec3 c = textureLod(uScene, vUv, 0.0).rgb;
  vec3 glow = textureLod(uScene, vUv, 2.5).rgb * 0.42
            + textureLod(uScene, vUv, 4.5).rgb * 0.34
            + textureLod(uScene, vUv, 6.5).rgb * 0.30;
  c += glow * uBloom;
  c = 1.0 - exp(-c * uExposure);                       // soft shoulder instead of clipping
  vec2 q = vUv - 0.5;
  vec3 bg = vec3(0.027, 0.027, 0.039) + vec3(0.020, 0.014, 0.026) * max(0.0, 1.0 - length(q) * 1.6);
  c = bg + c * (1.0 - bg);
  c *= mix(0.74, 1.0, smoothstep(0.92, 0.25, length(q * vec2(1.0, 1.12))));
  c += (hash12(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * 0.022;
  o = vec4(c, 1.0);
}`;

/* ------------------------------------------------------------------ helpers */

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Hand control back to the browser for a moment without a timer (timers are slowed in idle tabs).
const breathe = () => new Promise((r) => { const c = new MessageChannel(); c.port1.onmessage = () => r(); c.port2.postMessage(0); });

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error('shader: ' + gl.getShaderInfoLog(s));
  }
  return s;
}

function program(gl, vsSrc, fsSrc, varyings) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
  if (varyings) gl.transformFeedbackVaryings(p, varyings, gl.INTERLEAVED_ATTRIBS);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name;
    u[name] = gl.getUniformLocation(p, name);
  }
  return { p, u };
}

/* ------------------------------------------------------------------ shapes */

/* Turns the opaque pixels of one or more same-sized canvases into samplers that share one
   frame, so "2018", "2023" and "2024" line up digit for digit. Pixels are listed column by
   column: a grain's rank then maps to roughly the same place in every shape, which makes a
   morph move grains a short way instead of across the whole figure. */
function alphaSamplers(canvases, rnd) {
  const lists = canvases.map((cv) => {
    const { width: w, height: h } = cv;
    const d = cv.getContext('2d').getImageData(0, 0, w, h).data;
    const xs = [], ys = [];
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
      if (d[(y * w + x) * 4 + 3] > 110) { xs.push(x); ys.push(y); }
    }
    return { xs, ys };
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const { xs, ys } of lists) for (let i = 0; i < xs.length; i++) {
    if (xs[i] < minX) minX = xs[i]; if (xs[i] > maxX) maxX = xs[i];
    if (ys[i] < minY) minY = ys[i]; if (ys[i] > maxY) maxY = ys[i];
  }
  if (!isFinite(minX)) { minX = minY = 0; maxX = maxY = 1; }
  const cx = (minX + maxX + 1) / 2, cy = (minY + maxY + 1) / 2, half = (maxX - minX + 1) / 2;
  const frame = { half, ratio: (maxY - minY + 1) / (maxX - minX + 1) };
  return lists.map(({ xs, ys }) => Object.assign((u) => {
    const n = xs.length;
    if (!n) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 0.6; return [Math.cos(a) * r, Math.sin(a) * r, 0, 1]; }
    const i = Math.min(n - 1, Math.floor(u * n));
    return [(xs[i] + rnd() - cx) / half, -(ys[i] + rnd() - cy) / half, 0, 1];
  }, { frame }));
}

/* Three line drawings, one per problem: cards (the store), a price line (the pricing tool)
   and three linked machines (the home AI cluster). Each starts at a multiple of ICON_PITCH so
   the page can line them up with its three columns. */
const ICON_PITCH = 500;
function iconsCanvas() {
  const cv = document.createElement('canvas');
  cv.width = 1300; cv.height = 300;
  const c = cv.getContext('2d');
  c.lineWidth = 9; c.lineJoin = 'round'; c.lineCap = 'round';
  const box = (x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.stroke(); };
  const dot = (x, y, r) => { c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill(); };

  // cards: one fanned behind another
  c.save(); c.translate(84, 160); c.rotate(-0.2); box(-58, -86, 116, 172, 12); c.restore();
  c.save(); c.translate(134, 152); c.rotate(0.1);
  c.clearRect(-58, -86, 116, 172); box(-58, -86, 116, 172, 12); dot(0, 0, 15);
  c.restore();

  // price line: uneven, trending up, over a baseline
  let x0 = ICON_PITCH + 14;
  const pts = [[0, 190], [46, 128], [88, 156], [136, 84], [186, 50]];
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x0 + x, y) : c.moveTo(x0 + x, y))); c.stroke();
  pts.forEach(([x, y]) => dot(x0 + x, y, 13));
  c.beginPath(); c.moveTo(x0 - 4, 244); c.lineTo(x0 + 190, 244); c.stroke();

  // cluster: three machines, linked
  x0 = ICON_PITCH * 2 + 10;
  const nodes = [[38, 206], [162, 206], [100, 78]];
  c.beginPath();
  nodes.forEach(([x, y], i) => { const [nx, ny] = nodes[(i + 1) % 3]; c.moveTo(x0 + x, y); c.lineTo(x0 + nx, ny); });
  c.stroke();
  nodes.forEach(([x, y]) => { c.clearRect(x0 + x - 34, y - 34, 68, 68); box(x0 + x - 34, y - 34, 68, 68, 10); dot(x0 + x, y, 9); });
  return cv;
}

function markCanvas() {
  const k = 3, cv = document.createElement('canvas');
  cv.width = 332 * k; cv.height = 211 * k;
  const ctx = cv.getContext('2d');
  ctx.scale(k, k); ctx.translate(-79, -74);
  for (const path of document.querySelectorAll('#m path')) ctx.fill(new Path2D(path.getAttribute('d')));
  return cv;
}

function textCanvas(text) {
  const cv = document.createElement('canvas');
  cv.width = 1500; cv.height = 620;
  const ctx = cv.getContext('2d');
  let size = 470;
  ctx.font = `400 ${size}px "Instrument Serif", Georgia, serif`;
  const tw = ctx.measureText('2023').width;       // widest of the three, so all share a size
  if (tw > 1380) { size *= 1380 / tw; ctx.font = `400 ${size}px "Instrument Serif", Georgia, serif`; }
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, 60, 480);
  return cv;
}

/* The portrait as a density map: brighter pixels get more grains, each grain keeps its
   pixel's colour, and brightness also pushes it forward a little so the face has relief. */
function portraitSampler(img, rnd) {
  const S = 420, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const iw = img.naturalWidth, ih = img.naturalHeight;
  ctx.drawImage(img, iw * 0.475 - ih / 2, 0, ih, ih, 0, 0, S, S);   // square crop on the face
  const d = ctx.getImageData(0, 0, S, S).data;
  const cdf = new Float32Array(S * S), lum = new Float32Array(S * S), msk = new Float32Array(S * S);
  let acc = 0;
  for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) {
    const o = (y * S + x) * 4, r = d[o] / 255, g = d[o + 1] / 255, b = d[o + 2] / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const rr = Math.hypot((x / S - 0.5) / 0.32, (y / S - 0.53) / 0.56);
    const mask = 1 - smooth(0.7, 1.0, rr);                           // dissolve toward the edges
    const sky = clamp((b - Math.max(r, g)) * 3.2, 0, 1);             // keep the sky from outshining the face
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const wall = y / S > 0.44 && l > 0.68 && chroma < 0.14 ? 0.08 : 1; // and the white buildings behind
    const i = x * S + y;
    lum[i] = l; msk[i] = mask;
    acc += mask * (0.05 + Math.pow(l, 1.25)) * (1 - 0.88 * sky) * wall;
    cdf[i] = acc;
  }
  return (u) => {
    const t = u * acc;
    let lo = 0, hi = S * S - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < t) lo = mid + 1; else hi = mid; }
    const x = Math.floor(lo / S), y = lo % S, o = (y * S + x) * 4, l = lum[lo];
    // lean the photo's colours toward the warm ivory the rest of the site settles into
    const sat = (c) => l + (c / 255 - l) * 1.35;
    const r = sat(d[o]) * 0.66 + l * 0.38, g = sat(d[o + 1]) * 0.66 + l * 0.31, b = sat(d[o + 2]) * 0.66 + l * 0.2;
    return [(x + rnd() - S / 2) / (S / 2), -(y + rnd() - S / 2) / (S / 2), (l - 0.45) * 0.16 * msk[lo],
            0.3 + 0.7 * Math.pow(l, 0.8), r, g, b];
  };
}

function buildShapes(N, texH, img) {
  const rnd = mulberry32(20261123);
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) * 0.87;
  const L = SCENES.length, per = TEX_W * texH * 4;
  const data = new Float32Array(per * L);
  const color = new Uint8Array(TEX_W * texH * 4);
  const seeds = new Float32Array(N * 4);
  const rank = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    seeds[i * 4] = rnd(); seeds[i * 4 + 1] = rnd(); seeds[i * 4 + 2] = rnd(); seeds[i * 4 + 3] = rnd();
    rank[i] = rnd();
  }

  // layer 0: home. A loose volume the turbulence stirs.
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    if (rnd() < 0.62) {
      const c = CLOUDS[Math.floor(rnd() * CLOUDS.length)];
      data[o] = c[0] + gauss() * c[2]; data[o + 1] = c[1] + gauss() * c[2]; data[o + 2] = gauss() * 0.7;
    } else {
      data[o] = rnd() * 2 - 1; data[o + 1] = rnd() * 2 - 1; data[o + 2] = rnd() * 2 - 1;
    }
    data[o + 3] = 0.5 + 0.9 * rnd();
  }

  // Shapes with a core, a soft edge and a few strays, so they read as dust rather than a fill.
  const fill = (layer, sample, core, zThick, tidy) => {
    const base = per * layer, frac = SCENES[layer].frac;
    for (let i = 0; i < N; i++) {
      const o = base + i * 4;
      if (seeds[i * 4 + 3] > frac) { data[o + 3] = -(0.08 + 0.2 * rnd()); continue; }
      const s = sample(rank[i]);
      const j = rnd();
      let jx = 0, jy = 0, jz = gauss() * zThick, b = core * s[3];
      if (tidy) { if (j > 0.97) { jx = gauss() * 0.05; jy = gauss() * 0.05; jz = gauss() * 0.08; b *= 0.6; } }
      else if (j > 0.93) { jx = gauss() * 0.11; jy = gauss() * 0.11; jz = gauss() * 0.14; b = 0.34; }
      else if (j > 0.74) { jx = gauss() * 0.014; jy = gauss() * 0.014; b *= 1.5; }
      data[o] = s[0] + jx; data[o + 1] = s[1] + jy; data[o + 2] = s[2] + jz;
      data[o + 3] = b * (tidy ? 0.85 + 0.15 * rnd() : 0.6 + 0.4 * rnd());
      if (s.length > 4) {
        color[i * 4] = clamp(s[4], 0, 1) * 255; color[i * 4 + 1] = clamp(s[5], 0, 1) * 255;
        color[i * 4 + 2] = clamp(s[6], 0, 1) * 255; color[i * 4 + 3] = 255;
      }
    }
  };

  const [mark] = alphaSamplers([markCanvas()], rnd);
  fill(layerOf('mark'), mark, 0.085, 0.02);

  fill(PORTRAIT_LAYER, img ? portraitSampler(img, rnd) : mark, img ? 0.3 : 0.085, 0.012, !!img);

  const [icons] = alphaSamplers([iconsCanvas()], rnd);
  SHAPE.problems = { pitch: ICON_PITCH / icons.frame.half, ratio: icons.frame.ratio };
  fill(layerOf('problems'), icons, 0.085, 0.012);

  const YEARS = ['2024', '2023', '2018'];
  alphaSamplers(YEARS.map(textCanvas), rnd).forEach((sample, i) => fill(layerOf('y' + YEARS[i]), sample, 0.075, 0.02));

  // last layer: an ordered lattice receding to a horizon, with still points of light above it.
  {
    const layer = L - 1, base = per * layer, frac = SCENES[layer].frac;
    const gw = Math.round(Math.sqrt(N * frac * 1.55)), gh = Math.floor(N * frac / gw), cells = gw * gh;
    for (let i = 0; i < N; i++) {
      const o = base + i * 4;
      if (seeds[i * 4 + 3] > frac) {                       // sky
        data[o] = rnd() * 2 - 1;
        data[o + 1] = 0.24 + rnd() * 2.7;
        data[o + 2] = -1 + rnd() * 0.42;
        data[o + 3] = 0.07 + 0.8 * Math.pow(rnd(), 6);
      } else {
        const c = Math.min(cells - 1, Math.floor(rank[i] * cells));
        data[o] = ((c % gw) / (gw - 1)) * 2 - 1;
        data[o + 1] = 0;
        data[o + 2] = (Math.floor(c / gw) / (gh - 1)) * 2 - 1;
        data[o + 3] = 0.3 + 0.2 * rnd();
      }
    }
  }
  return { data, color, seeds };
}

/* ------------------------------------------------------------------ engine */

/* opts.live === false builds an engine that is only stepped by hand (for still frames):
   no input, no frame loop. opts.size gives it a size when its canvas is not on the page. */
async function createEngine(canvas, opts = {}) {
  const live = opts.live !== false;
  const sizeOf = opts.size || (() => [canvas.clientWidth, canvas.clientHeight]);
  const gl = canvas.getContext('webgl2', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'high-performance', preserveDrawingBuffer: false,
  });
  if (!gl) throw new Error('WebGL2 unavailable');

  const query = new URLSearchParams(location.search);
  const small = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  const N = clamp(opts.count || parseInt(query.get('n'), 10) || (small ? 72000 : REF_COUNT), 2000, 400000);
  const texH = Math.ceil(N / TEX_W);

  // The year shapes are drawn with the page's display font, so wait for it (briefly).
  const img = new Image();
  img.src = 'images/portrait-800.jpg';
  const [, portrait] = await Promise.all([
    Promise.race([document.fonts.load('400 120px "Instrument Serif"', '2018'), wait(2500)]).catch(() => {}),
    Promise.race([img.decode().then(() => img), wait(5000).then(() => null)]).catch(() => null),
  ]);
  const shapes = buildShapes(N, texH, portrait);

  const sim = program(gl, SIM_VS, SIM_FS, ['vPos', 'vVel']);
  const draw = program(gl, DRAW_VS, DRAW_FS);
  const fade = program(gl, QUAD_VS, FADE_FS);
  const post = program(gl, QUAD_VS, POST_FS);

  // per-grain shape targets, one layer per scene
  const targets = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, targets);
  gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA32F, TEX_W, texH, SCENES.length, 0, gl.RGBA, gl.FLOAT, shapes.data);
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D_ARRAY, k, v);

  const portraitTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, portraitTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, TEX_W, texH, 0, gl.RGBA, gl.UNSIGNED_BYTE, shapes.color);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // grain state: position + velocity, two copies that swap roles each frame
  let aspect = sizeOf()[0] / Math.max(1, sizeOf()[1]);
  const home = layout('intro', aspect);
  const init = new Float32Array(N * 6);
  {
    const rnd = mulberry32(7);
    for (let i = 0; i < N; i++) {
      const hx = shapes.data[i * 4] * home.s[0], hy = shapes.data[i * 4 + 1] * home.s[1];
      const hz = shapes.data[i * 4 + 2] * home.s[2] + home.o[2];
      const r = 0.05 + 0.2 * rnd();                // start bunched at the centre, then burst outward
      init[i * 6] = hx * r; init[i * 6 + 1] = hy * r; init[i * 6 + 2] = hz * r;
      const v = 1.1 + 1.3 * rnd();
      init[i * 6 + 3] = hx * v; init[i * 6 + 4] = hy * v; init[i * 6 + 5] = hz * v;
    }
  }
  const seedBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
  gl.bufferData(gl.ARRAY_BUFFER, shapes.seeds, gl.STATIC_DRAW);
  const state = [gl.createBuffer(), gl.createBuffer()];
  const vaos = state.map((buf) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, init, gl.DYNAMIC_COPY);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
    return vao;
  });
  const quadVao = gl.createVertexArray();
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  const feedback = gl.createTransformFeedback();

  // Persistence and bloom need a float buffer to render into. Without one, draw straight to screen.
  const floatOK = !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
  let fbos = null, fbW = 0, fbH = 0;
  function makeTargets(w, h) {
    if (fbos) for (const f of fbos) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.tex); }
    const levels = Math.floor(Math.log2(Math.max(w, h))) + 1;
    fbos = [0, 1].map(() => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA16F, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { fb, tex };
    });
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fbW = w; fbH = h;
    return ok;
  }
  let useFbo = floatOK;

  /* ---- input ---- */
  const ac = new AbortController();
  const on = (target, type, fn) => target.addEventListener(type, fn, { passive: true, signal: ac.signal });
  const ptr = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, nx: 0, ny: 0, energy: 0, seen: false, jump: true };
  let burst = 0;
  const place = (cx, cy, jump) => {
    const r = canvas.getBoundingClientRect();
    ptr.nx = ((cx - r.left) / r.width) * 2 - 1;
    ptr.ny = 1 - ((cy - r.top) / r.height) * 2;
    ptr.x = ptr.nx * aspect; ptr.y = ptr.ny;
    if (jump || !ptr.seen) { ptr.px = ptr.x; ptr.py = ptr.y; ptr.seen = true; }
  };
  if (live) {
    on(window, 'pointermove', (e) => { if (e.pointerType !== 'touch') place(e.clientX, e.clientY, false); });
    on(window, 'touchstart', (e) => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY, true); });
    on(window, 'touchmove', (e) => { const t = e.touches[0]; if (t) place(t.clientX, t.clientY, false); });
    on(window, 'click', (e) => { if (running && e.detail) { place(e.clientX, e.clientY, true); burst = 1; } });
    // Words fade in near the middle of the screen, so a link reached with Tab is brought there.
    on(document, 'focusin', (e) => {
      if (running && e.target.closest('.scene') && e.target.matches(':focus-visible')) e.target.scrollIntoView({ block: 'center' });
    });
    on(document, 'visibilitychange', () => { last = 0; });
  }
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); contextLost = true; }, { signal: ac.signal });

  /* ---- scenes ---- */
  const sceneEls = [...document.querySelectorAll('[data-scene]')].map((el) => ({
    el, copy: el.querySelector('.copy'), index: SCENES.findIndex((s) => s.name === el.dataset.scene), shown: -1,
  })).filter((s) => s.index >= 0);

  function readScroll() {
    const mid = innerHeight / 2, n = sceneEls.length;
    const centers = sceneEls.map((s) => { const r = s.el.getBoundingClientRect(); return r.top + r.height / 2; });
    // words come into focus as their scene nears the middle of the screen
    sceneEls.forEach((s, i) => {
      if (!s.copy) return;
      let v = 1 - smooth(0.26, 0.6, Math.abs(centers[i] - mid) / innerHeight);
      if ((i === 0 && centers[0] > mid) || (i === n - 1 && centers[n - 1] < mid)) v = 1;
      v = Math.round(v * 200) / 200;
      if (v === s.shown) return;
      s.shown = v;
      s.copy.style.opacity = v;
      s.copy.style.transform = v === 1 ? '' : `translate3d(0, ${((1 - v) * 28).toFixed(1)}px, 0)`;
      s.copy.style.filter = v === 1 ? '' : `blur(${((1 - v) * 9).toFixed(1)}px)`;
    });
    let i = 0;
    while (i < n - 2 && centers[i + 1] <= mid) i++;
    if (n < 2 || centers[0] >= mid) return { a: sceneEls[0].index, b: sceneEls[0].index, mix: 0 };
    if (centers[n - 1] <= mid) return { a: sceneEls[n - 1].index, b: sceneEls[n - 1].index, mix: 0 };
    const t = (mid - centers[i]) / (centers[i + 1] - centers[i]);
    return { a: sceneEls[i].index, b: sceneEls[i + 1].index, mix: smooth(0.2, 0.8, t) };
  }

  // Where the three columns of the problems scene are, in world units. Live, that is where
  // they are on screen right now, so the diagrams follow the words as they scroll. For a
  // still frame it is where they sit when the section is centred, which is how the frame hangs.
  const probEl = document.querySelector('[data-scene="problems"]');
  const probCopy = probEl && probEl.querySelector('.copy');
  const probItems = probEl ? probEl.querySelectorAll('.problems > li') : [];
  function measureProblems(centred) {
    if (!probCopy || probItems.length < 2) return null;
    const [cw, ch] = sizeOf(), hs = ch / 2;
    const cr = probCopy.getBoundingClientRect(), sr = probEl.getBoundingClientRect();
    const a = probItems[0].getBoundingClientRect(), b = probItems[1].getBoundingClientRect();
    const middle = centred ? sr.top + sr.height / 2 : hs;
    return { left: (a.left - cw / 2) / hs, pitch: (b.left - a.left) / hs, top: (middle - cr.top) / hs };
  }

  /* ---- frame loop ---- */
  let raf = 0, last = 0, time = 0, src = 0, running = live, snapNext = false;
  let count = N, resScale = 1, slow = 0, frames = 0, emaDt = 1 / 60;
  let wind = 0, lastScroll = scrollY, camX = 0, camY = 0;

  function resize() {
    const [cw, ch] = sizeOf();
    if (!cw || !ch) return false;
    // cap the pixel count as well as the ratio, so a 4K or 5K screen is not asked for 15 MP
    const cap = Math.sqrt((small ? 2.4e6 : 4.6e6) / (cw * ch));
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2, cap) * resScale;
    const w = Math.max(2, Math.round(cw * dpr)), h = Math.max(2, Math.round(ch * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    if (useFbo && (fbW !== w || fbH !== h)) useFbo = makeTargets(w, h);
    aspect = cw / ch;
    return true;
  }

  // If frames run long, shed grains first, then resolution. Each step is a trial: if it does
  // not make frames shorter, the delay is not ours (a 30 Hz display, a throttled window), so
  // the step is undone and the field stays at full quality.
  let trial = null, settled = false;
  function adapt(dt) {
    frames++;
    emaDt = lerp(emaDt, dt, 0.06);
    if (settled || frames < 90) return;
    if (trial) {
      if (frames < 150) return;
      if (emaDt > trial.before * 0.9) { count = trial.count; resScale = trial.resScale; settled = true; }
      trial = null; slow = 0;
      return;
    }
    slow = emaDt > 1 / 42 ? slow + 1 : Math.max(0, slow - 2);
    if (slow < 45) return;
    trial = { before: emaDt, count, resScale };
    slow = 0; frames = 30;
    if (count > N * 0.36) count = Math.floor(count * 0.72);
    else if (resScale > 0.6) resScale *= 0.82;
    else { trial = null; settled = true; }
  }

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (contextLost) { stopForGood(); return; }
    const t = now / 1000;
    const raw = t - last;
    last = t;
    if (raw <= 0 || raw > 0.5) return;               // first frame, or the tab was away
    adapt(raw);
    tick(Math.min(raw, 1 / 30));
  }

  // forced = { a, b, mix } pins the scene instead of reading it from the scroll position.
  function tick(dt, forced) {
    time += dt;
    if (!resize()) return;

    const sc = forced || readScroll();
    const A = SCENES[sc.a], B = SCENES[sc.b];
    const m = A.name === 'problems' || B.name === 'problems' ? measureProblems(!!forced) : null;
    const la = layout(A.name, aspect, m), lb = layout(B.name, aspect, m), l0 = layout('intro', aspect);
    const mix = sc.mix;

    // pointer velocity and how stirred up it is
    const ease = 1 - Math.exp(-dt * 12);
    ptr.vx = lerp(ptr.vx, (ptr.x - ptr.px) / dt, ease);
    ptr.vy = lerp(ptr.vy, (ptr.y - ptr.py) / dt, ease);
    ptr.px = ptr.x; ptr.py = ptr.y;
    ptr.energy = lerp(ptr.energy, clamp(Math.hypot(ptr.vx, ptr.vy) / 2.2, 0, 1), 1 - Math.exp(-dt * 7));
    burst *= Math.exp(-dt * 9);

    // scrolling drags a little wind through the dust
    const sv = clamp((scrollY - lastScroll) / dt / Math.max(1, innerHeight), -4, 4);
    lastScroll = scrollY;
    wind = lerp(wind, sv * 1.1, 1 - Math.exp(-dt * 6));

    camX = lerp(camX, ptr.nx * 0.11 + Math.sin(time * 0.21) * 0.05, 1 - Math.exp(-dt * 2.2));
    camY = lerp(camY, -ptr.ny * 0.07 + Math.sin(time * 0.17 + 1.3) * 0.025, 1 - Math.exp(-dt * 2.2));
    if (forced) { camX = camY = wind = 0; }          // a still frame is seen straight on

    /* simulate */
    const dst = 1 - src;
    gl.useProgram(sim.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, targets);
    gl.uniform1i(sim.u.uTargets, 0);
    gl.uniform1i(sim.u.uTexW, TEX_W);
    gl.uniform1i(sim.u.uA, sc.a); gl.uniform1i(sim.u.uB, sc.b);
    gl.uniform1f(sim.u.uMix, mix); gl.uniform1f(sim.u.uTime, time); gl.uniform1f(sim.u.uDt, dt);
    gl.uniform1f(sim.u.uTransit, TRANSIT);
    gl.uniform3fv(sim.u.uScale0, l0.s); gl.uniform3fv(sim.u.uOff0, l0.o);
    gl.uniform3fv(sim.u.uScaleA, la.s); gl.uniform3fv(sim.u.uOffA, la.o);
    gl.uniform3fv(sim.u.uScaleB, lb.s); gl.uniform3fv(sim.u.uOffB, lb.o);
    gl.uniform4f(sim.u.uParA, A.turb, A.k, A.damp, A.wave);
    gl.uniform4f(sim.u.uParB, B.turb, B.k, B.damp, B.wave);
    gl.uniform3fv(sim.u.uDust, DUST);
    gl.uniform2f(sim.u.uPtr, ptr.seen ? ptr.x : 99, ptr.seen ? ptr.y : 99);
    gl.uniform2f(sim.u.uPtrVel, clamp(ptr.vx, -6, 6), clamp(ptr.vy, -6, 6));
    gl.uniform1f(sim.u.uPtrEnergy, ptr.energy);
    gl.uniform1f(sim.u.uBurst, burst);
    gl.uniform1f(sim.u.uWind, wind);
    gl.uniform1f(sim.u.uSnap, snapNext ? 1 : 0);
    snapNext = false;
    gl.bindVertexArray(vaos[src]);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, feedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, state[dst]);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, count);
    gl.endTransformFeedback();
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
    src = dst;

    /* draw */
    const decay = Math.pow(lerp(A.trail, B.trail, mix), dt * 60);
    const W = canvas.width, H = canvas.height;
    gl.viewport(0, 0, W, H);
    if (useFbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1].fb);
      gl.disable(gl.BLEND);
      gl.useProgram(fade.p);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fbos[0].tex);
      gl.uniform1i(fade.u.uPrev, 2);
      gl.uniform1f(fade.u.uDecay, decay);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0.027, 0.027, 0.039, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.useProgram(draw.p);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D_ARRAY, targets);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, portraitTex);
    gl.uniform1i(draw.u.uTargets, 0); gl.uniform1i(draw.u.uPortrait, 1);
    gl.uniform1i(draw.u.uTexW, TEX_W);
    gl.uniform1i(draw.u.uA, sc.a); gl.uniform1i(draw.u.uB, sc.b);
    gl.uniform1i(draw.u.uPortraitLayer, PORTRAIT_LAYER);
    gl.uniform1f(draw.u.uMix, mix); gl.uniform1f(draw.u.uTime, time);
    gl.uniform1f(draw.u.uAspect, aspect);
    gl.uniform1f(draw.u.uSize, Math.max(1.4, 2.5 * H / 1000));
    gl.uniform1f(draw.u.uGain, (REF_COUNT / count) * smooth(0, 1.4, time) * (useFbo ? 1 - decay : 0.6));
    gl.uniform1f(draw.u.uFocus, lerp(A.focus, B.focus, mix));
    gl.uniform1f(draw.u.uDof, lerp(A.dof, B.dof, mix));
    gl.uniform2f(draw.u.uCam, camX, camY);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindVertexArray(vaos[src]);
    gl.drawArrays(gl.POINTS, 0, count);
    gl.disable(gl.BLEND);

    if (useFbo) {
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, fbos[1].tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(post.p);
      gl.uniform1i(post.u.uScene, 2);
      gl.uniform1f(post.u.uTime, time);
      gl.uniform1f(post.u.uBloom, 0.85);
      gl.uniform1f(post.u.uExposure, 1.55);
      gl.bindVertexArray(quadVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      fbos.reverse();
    }
    gl.bindVertexArray(null);
  }

  let onDead = null;
  function stopForGood() { destroy(); if (onDead) onDead(); }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
    for (const s of sceneEls) if (s.copy) { s.copy.removeAttribute('style'); s.shown = -1; }
  }
  function resume() {
    if (running) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function destroy() { pause(); ac.abort(); }

  /* One still frame of a scene at rest. Grains are placed on their targets, then the normal
     simulation runs for a moment so the turbulence, the shimmer and the persistence buffer
     reach the state the live field would be in. The intro needs longer: its picture is the motion. */
  async function bake(name) {
    const i = layerOf(name), forced = { a: i, b: i, mix: 0 };
    if (!resize()) throw new Error('no size to draw at');
    if (fbos) {
      for (const f of fbos) { gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    time = 20 + i * 7;
    snapNext = true;
    const n = name === 'intro' ? 130 : 26;
    for (let f = 0; f <= n; f++) {
      tick(1 / 60, forced);
      if (f % 10 === 9 && f < n - 1) await breathe();  // never right before the last frame: it is the one kept
    }
    // toDataURL, not toBlob: Chrome encodes blobs in idle time, which adds up to a second per frame here.
    return canvas.toDataURL('image/jpeg', 0.92);
  }

  // Give the graphics memory back straight away instead of waiting for garbage collection.
  function release() {
    destroy();
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  }

  if (live) raf = requestAnimationFrame((now) => { last = now / 1000; raf = requestAnimationFrame(frame); });

  return {
    destroy, pause, resume, bake, release,
    set onDead(fn) { onDead = fn; },
    step: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) tick(dt); },
    stats: () => ({ grains: count, of: N, resScale, frameMs: +(emaDt * 1000).toFixed(2), buffer: useFbo ? 'float' : 'direct', w: canvas.width, h: canvas.height }),
  };
}

/* ------------------------------------------------------------------ boot */

const root = document.documentElement;
const canvas = document.getElementById('field');
const hud = document.querySelector('.hud');
const button = document.querySelector('.motion');
const stillNote = document.querySelector('.still-note');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const query = new URLSearchParams(location.search);

const saved = (() => { try { return localStorage.getItem('motion'); } catch { return null; } })();
let engine = null, busy = false, mode = 'plain';      // 'live' | 'plates' | 'plain'

function reflect(next) {
  mode = next;
  root.classList.toggle('fx', next !== 'plain');
  root.classList.toggle('gl', next === 'live');
  root.classList.toggle('plates', next === 'plates');
  button.setAttribute('aria-pressed', String(next === 'live'));
  button.querySelector('span').textContent = next === 'live' ? 'on' : 'off';
}

/* Motion off. Each section gets a still frame of its scene as a backdrop. The frames are
   drawn by a second engine that exists only for this: with no frame rate to hold, it uses
   more grains than the live field, renders each scene once, and is thrown away. */
const plates = { key: '', job: 0, done: Promise.resolve() };

async function renderPlates() {
  const cw = canvas.clientWidth, ch = canvas.clientHeight;
  const key = `${cw}x${ch}`;
  if (plates.key === key) return;                       // frames for this size already hang
  const job = ++plates.job;
  const small = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
  const baker = await createEngine(document.createElement('canvas'), {
    live: false, count: small ? 160000 : 320000, size: () => [cw, ch],
  });
  stillNote.textContent = `still · ${baker.stats().of.toLocaleString('en-US')} grains`;
  // nearest to the reader first
  const far = (el) => { const r = el.getBoundingClientRect(); return Math.abs(r.top + r.height / 2 - innerHeight / 2); };
  const sections = [...document.querySelectorAll('[data-scene]')].sort((a, b) => far(a) - far(b));
  try {
    for (const el of sections) {
      if (job !== plates.job || mode !== 'plates') return;
      const picture = await baker.bake(el.dataset.scene);
      if (job !== plates.job) return;
      let img = el.querySelector('.plate');
      if (!img) {
        img = new Image();
        img.className = 'plate'; img.alt = ''; img.decoding = 'async';
        img.setAttribute('aria-hidden', 'true');
        el.prepend(img);
      }
      img.src = picture;
      await breathe();
    }
    plates.key = key;
  } finally {
    baker.release();
  }
}

async function setMode(next) {
  if (busy) return;
  busy = true;
  try {
    if (next === 'live') {
      if (!engine) {
        engine = await createEngine(canvas);
        engine.onDead = () => { engine = null; setMode('plates'); };
        if (query.has('debug')) window.__field = engine;
      }
      plates.job++;                                      // stop any still frames in progress
      engine.resume();
      reflect('live');
    } else {
      if (engine) engine.pause();
      reflect('plates');
      plates.done = renderPlates().catch((err) => {
        console.warn('Still frames unavailable, showing the plain page.', err);
        if (mode === 'plates') reflect('plain');
      });
    }
  } catch (err) {
    console.warn('Dust field unavailable, showing the plain page.', err);
    engine = null;
    reflect('plain');
    button.hidden = true;
  } finally {
    busy = false;
  }
}

const canRun = (() => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
})();

if (canRun && !query.has('still')) {
  if (query.has('debug')) window.__plates = plates;
  button.hidden = false;
  button.addEventListener('click', () => {
    const next = mode === 'live' ? 'plates' : 'live';
    try { localStorage.setItem('motion', next === 'live' ? 'on' : 'off'); } catch { /* private mode */ }
    setMode(next);
  });
  // Motion follows the system setting unless the visitor has chosen with the switch.
  const wantLive = query.has('plates') ? false : saved ? saved === 'on' : !reduce.matches;
  setMode(wantLive ? 'live' : 'plates');

  // Still frames are drawn for one window size; draw them again when it really changes
  // (a phone's address bar sliding away does not count).
  let timer = 0, lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 120) return;
    lastW = innerWidth; lastH = innerHeight;
    clearTimeout(timer);
    timer = setTimeout(() => { if (mode === 'plates') plates.done = renderPlates().catch(() => {}); }, 350);
  }, { passive: true });
} else {
  reflect('plain');                                      // index.html assumed the dust could run
}
