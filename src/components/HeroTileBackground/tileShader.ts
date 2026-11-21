/**
 * WebGL2 Tile Shader Source & Tuned Parameters
 * Source of truth: Glass Tile Field Shader Component
 *
 * Tuned performance values:
 * - Raymarch steps: 48 (main pass 44) vs 96 original
 * - Hit threshold: 0.003 vs 0.0015 original
 * - Step factor: 0.95
 * - Shadow steps: 9 with step clamp (0.05, 0.4) vs 18 original
 * - AO samples: 2 with strength 4.8 vs 3 original
 * - Ball branch: disabled (if (false)) - invisible ball path drives the tile wave
 * - Sphere shadow & occlusion: removed (sh *= 1.0, ao = full ? aoF(p,n) : 1.0)
 * - Texture atlas: 3 horizontal square cells (1536x512) sampled via textureGrad with clamped derivatives
 */

export const VERT_SHADER = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const FRAG_SHADER = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform vec3 uCamPos;
uniform vec3 uCamR;
uniform vec3 uCamU;
uniform vec3 uCamF;
uniform float uFocal;
uniform float uOff;
uniform vec2 uGrid;
uniform vec2 uBallQ;
uniform vec2 uBall;
uniform float uMaxH;
uniform vec2 uMound;
uniform vec3 uTileP;
uniform vec3 uGaps;
uniform vec3 uHalf;
uniform vec3 uL;
uniform vec3 uAccent;
uniform vec3 uPeach;
uniform vec3 uInner;
uniform vec3 uFloor;
uniform vec3 uStudC;
uniform vec3 uBg;
uniform vec4 uLook;
uniform vec3 uGlass;
uniform vec3 uPtr;
uniform vec3 uFx;
uniform sampler2D uImg;

const float FT = 0.02;
float gH;
float gMat;
vec2 gId;

float hash21(vec2 p) {
  p = mod(p, 256.0);
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 toQ(vec2 xz) {
  return vec2(dot(xz, vec2(uGrid.x, -uGrid.y)), dot(xz, vec2(uGrid.y, uGrid.x))) + uBallQ;
}

float cellH(vec2 id) {
  vec2 c = id + 0.5;
  float hv = hash21(id);
  float m = 1.0 - smoothstep(uMound.y, uMound.x, length(c - uBallQ));
  float keep = step(uTileP.y, hash21(id + 91.7));
  m *= mix(keep, 1.0, step(0.6, m));
  float j = 1.0 + uTileP.x * (hv * 2.0 - 1.0);
  float pm = uPtr.z * (1.0 - smoothstep(0.3, 2.2, length(c - uPtr.xy))) * 0.75;
  return uMaxH * max(m * j, pm * (0.8 + 0.4 * hv));
}

float tileSD(vec2 q, float y, vec2 id, out float h) {
  h = cellH(id);
  float top = FT + h;
  float gap = mix(uGaps.y, uGaps.x, smoothstep(0.0, 0.12 * uMaxH + 0.001, h));
  float hs = 0.5 - 0.5 * gap;
  float r = min(uTileP.z, hs);
  vec2 lp = q - id - 0.5;
  vec2 dq = abs(lp) - vec2(hs - r);
  float d2 = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - r;
  float hh = 0.5 * top;
  float bev = min(0.025, hh * 0.8);
  vec2 w = vec2(d2 + bev, abs(y - hh) - hh + bev);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - bev;
}

float mapF(vec3 p) {
  vec2 q = toQ(p.xz);
  vec2 id = floor(q);
  vec2 f = q - id;
  vec2 o = vec2(f.x < 0.5 ? -1.0 : 1.0, f.y < 0.5 ? -1.0 : 1.0);
  float h0, h1, h2, h3;
  float d0 = tileSD(q, p.y, id, h0);
  float d1 = tileSD(q, p.y, id + vec2(o.x, 0.0), h1);
  float d2 = tileSD(q, p.y, id + vec2(0.0, o.y), h2);
  float d3 = tileSD(q, p.y, id + o, h3);
  float d = d0;
  gH = h0;
  gMat = 1.0;
  gId = id;
  if (d1 < d) { d = d1; gH = h1; gId = id + vec2(o.x, 0.0); }
  if (d2 < d) { d = d2; gH = h2; gId = id + vec2(0.0, o.y); }
  if (d3 < d) { d = d3; gH = h3; gId = id + o; }
  if (p.y < d) { d = p.y; gMat = 0.0; }
  vec2 cq = q - floor(q + 0.5);
  float ds = length(vec2((abs(cq.x) + abs(cq.y)) * 0.7071, p.y)) - uGaps.z;
  if (ds < d) { d = ds; gMat = 2.0; }
  return min(d, 0.45);
}

vec3 nrmF(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  float e = 0.002;
  return normalize(k.xyy * mapF(p + k.xyy * e) + k.yyx * mapF(p + k.yyx * e) + k.yxy * mapF(p + k.yxy * e) + k.xxx * mapF(p + k.xxx * e));
}

float topY() {
  return FT + uMaxH * 1.3 + 0.05;
}

bool marchF(vec3 ro, vec3 rd, int steps, out vec3 hp) {
  hp = ro;
  if (rd.y > -0.002) return false;
  float t = 0.0;
  float Y = topY();
  if (ro.y > Y) t = (ro.y - Y) / (-rd.y);
  for (int i = 0; i < 48; i++) {
    if (i >= steps) break;
    vec3 p = ro + rd * t;
    float d = mapF(p);
    if (d < 0.003) { hp = p; return true; }
    t += d * 0.95;
    if (p.y < -0.05) break;
  }
  hp = ro + rd * t;
  return true;
}

float shadowF(vec3 ro) {
  float res = 1.0;
  float t = 0.03;
  float Y = topY();
  for (int i = 0; i < 9; i++) {
    vec3 p = ro + uL * t;
    if (p.y > Y) break;
    float h = mapF(p);
    res = min(res, uLook.y * h / t);
    if (res < 0.02) break;
    t += clamp(h, 0.05, 0.4);
  }
  return clamp(res, 0.0, 1.0);
}

float aoF(vec3 p, vec3 n) {
  float o = 0.0;
  float s = 1.0;
  for (int i = 1; i <= 2; i++) {
    float h = 0.04 * float(i);
    float d = mapF(p + n * h);
    o += (h - d) * s;
    s *= 0.6;
  }
  return clamp(1.0 - 4.8 * o, 0.0, 1.0);
}

vec3 shadeFloor(vec3 p, vec3 rd, bool full) {
  mapF(p);
  float mat = gMat;
  float h = gH;
  vec3 n = nrmF(p);
  float tn = clamp(h / max(uMaxH, 1e-3), 0.0, 1.0);
  vec3 alb;
  if (mat < 0.5) {
    alb = mix(uBg, uFloor, 0.4) * 0.6;
  } else if (mat < 1.5) {
    alb = mix(uFloor, uPeach, smoothstep(0.04, 0.3, tn));
    alb = mix(alb, uAccent, smoothstep(0.38, 0.62, tn));
    vec2 tu = toQ(p.xz) - gId;
    float has = step(hash21(gId + 5.1), 0.7) * step(0.9, n.y) * smoothstep(0.2, 0.34, tn) * step(0.04, min(tu.x, tu.y)) * step(max(tu.x, tu.y), 0.96);
    float ii = floor(hash21(gId + 17.3) * 9.0);
    vec2 gx = clamp(dFdx(tu), -0.03, 0.03);
    vec2 gy = clamp(dFdy(tu), -0.03, 0.03);
    vec3 im = textureGrad(uImg, vec2((ii + tu.x) / 9.0, 1.0 - tu.y), gx * vec2(0.111111, -1.0), gy * vec2(0.111111, -1.0)).rgb;
    alb = mix(alb, im * 1.1, has);
  } else {
    alb = uStudC;
  }
  vec3 sp = p + n * 0.004;
  float sh = full ? shadowF(sp) : 1.0;
  sh *= 1.0;
  float ao = (full ? aoF(p, n) : 1.0);
  float dif = max(dot(n, uL), 0.0);
  float sl = mix(1.0, sh, uLook.z);
  vec3 amb = vec3(uLook.x * (0.62 + 0.38 * n.y) * ao);
  amb *= mix(vec3(1.0), uAccent * 1.1 + 0.1, 0.25 * (1.0 - sl));
  vec3 col = alb * (amb + (1.0 - uLook.x) * 1.3 * dif * sl);
  col += 0.06 * pow(max(dot(reflect(rd, n), uL), 0.0), 18.0) * sl * step(0.5, mat);
  return col;
}

vec3 env(vec3 r) {
  float up = smoothstep(-0.3, 0.8, r.y);
  vec3 c = mix(uFloor * 0.9 + uBg * 0.1, vec3(0.62, 0.6, 0.58), up);
  c += vec3(1.0) * pow(max(dot(r, uL), 0.0), 24.0) * 0.9;
  return c;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * uRes) / uRes.y;
  vec3 rd = normalize(uCamR * uv.x + uCamU * (uv.y - uOff) + uCamF * uFocal);
  vec3 ro = uCamPos;
  vec3 col;

  if (false) {
    // Disabled glass ball branch per spec - path drives tile wave
  } else {
    vec3 hp;
    marchF(ro, rd, 44, hp);
    col = shadeFloor(hp, rd, true);
  }

  float x01 = frag.x / uRes.x;
  float y01 = 1.0 - frag.y / uRes.y;
  float bandF = smoothstep(0.16, 0.45, abs(y01 - (0.35 + 0.27 * x01)));
  col *= 1.0 - uLook.w * bandF;
  float vig = smoothstep(0.3, 1.0, length(uv));
  col *= 1.0 - uFx.y * vig;
  float g = hash12(frag + fract(uFx.z * 7.31) * 113.0) - 0.5;
  col += g * uFx.x * 0.25;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

export const UNIFORM_NAMES = [
  "uRes",
  "uCamPos",
  "uCamR",
  "uCamU",
  "uCamF",
  "uFocal",
  "uOff",
  "uGrid",
  "uBallQ",
  "uBall",
  "uMaxH",
  "uMound",
  "uTileP",
  "uGaps",
  "uHalf",
  "uL",
  "uAccent",
  "uPeach",
  "uInner",
  "uFloor",
  "uStudC",
  "uBg",
  "uLook",
  "uGlass",
  "uPtr",
  "uFx",
  "uImg"
] as const;

export const ADVANCED_DEFAULTS = {
  tilt: 50,
  perspective: 80,
  ballOffset: 9,
  gridAngle: 20,
  travelAngle: 10,
  ballRadius: 87,
  moundInner: 35,
  heightJitter: 20,
  missingTiles: 25,
  tileGap: 8,
  floorGap: 3,
  cornerRound: 12,
  studSize: 4,
  floorLift: 16,
  peachColor: "#F0D6C9",
  innerColor: "#10549A",
  studColor: "#8E8882",
  lightAngle: 135,
  lightHeight: 50,
  ambient: 65,
  shadowEdge: 10,
  shadowStrength: 80,
  band: 30,
  glassRim: 60,
  specular: 80,
  refraction: 40,
  quality: 60,
  grain: 0,
  vignette: 0,
  hover: 50
};

export const PRIMARY_DEFAULTS = {
  speed: 50,
  size: 125,
  accent: "#176FC4",
  background: "#E9D8CB",
  radius: 3,
  lift: 100
};

export const TPS = 43.4 / 15.6;
export const FT = 0.02;
