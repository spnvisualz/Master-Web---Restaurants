/*
 * The Spnvisualz world: a misty, ring-ridged landscape raymarched in a WebGL fragment shader,
 * with a glowing orb for the current project. No libraries and no image files.
 *
 * window.SpnWorld.start(canvas) -> boolean (false when WebGL is unavailable)
 * window.SpnWorld.setScene({ color: "#rrggbb", orb: 0..1, yaw: radians, height, radius, seed })
 * window.SpnWorld.setPaused(boolean)
 */
(function () {
  "use strict";

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes;",
    "uniform float uTime;",
    "uniform vec3 uOrbCol;",
    "uniform float uOrb;",
    "uniform float uYaw;",
    "uniform float uHeight;",
    "uniform float uRadius;",
    "uniform float uSeed;",
    "",
    "const float WATER = -0.42;",
    "const vec3 ORB = vec3(0.0, 1.55, 0.0);",
    "",
    "float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float fbm(vec2 p, int oct){",
    "  float a = 0.5, s = 0.0;",
    "  for (int i = 0; i < 6; i++) { if (i >= oct) break; s += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; }",
    "  return s;",
    "}",
    "",
    "float height(vec2 p, int oct){",
    "  float r = length(p);",
    "  float ang = atan(p.y, p.x);",
    "  float warp = fbm(p * 0.3 + uSeed, 3) * 3.4;",
    "  float s = sin(r * 3.1 - ang * 2.0 + warp);",
    "  float ridge = smoothstep(-0.05, 0.6, s) * (0.75 + 0.5 * fbm(p * 0.9, 2));",
    "  float rings = ridge * smoothstep(11.0, 3.5, r) * smoothstep(0.9, 1.9, r);",
    "  float hills = fbm(p * 0.22 + 7.0, oct);",
    "  float far = smoothstep(7.0, 20.0, r);",
    "  float mountains = far * fbm(p * 0.11 + 3.0, oct) * 7.5;",
    "  float detail = (oct > 3) ? fbm(p * 2.6, 4) * 0.34 : 0.17;",
    "  return rings * 1.05 + hills * 1.2 + mountains + detail - 1.3;",
    "}",
    "float ground(vec2 p, int oct){ return max(height(p, oct), WATER); }",
    "",
    "vec3 hue(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }",
    "",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / min(uRes.x * 0.8, uRes.y);",
    "  float yaw = uYaw + uTime * 0.012;",
    "  vec3 ro = vec3(sin(yaw) * uRadius, uHeight + sin(uTime * 0.07) * 0.08, cos(yaw) * uRadius);",
    "  vec3 ta = vec3(0.0, 0.35, 0.0);",
    "  vec3 fw = normalize(ta - ro);",
    "  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));",
    "  vec3 up = cross(fw, rt);",
    "  vec3 rd = normalize(fw * 1.55 + rt * uv.x + up * uv.y);",
    "",
    "  // Sky: deep blue with drifting teal cloud light",
    "  float sy = clamp(rd.y, 0.0, 1.0);",
    "  vec3 sky = mix(vec3(0.12, 0.21, 0.33), vec3(0.015, 0.03, 0.07), pow(sy, 0.5));",
    "  vec2 cuv = rd.xz / (rd.y + 0.12) * 1.4 + vec2(uTime * 0.02, 0.0);",
    "  float cl = fbm(cuv, 4);",
    "  sky += vec3(0.06, 0.30, 0.26) * smoothstep(0.55, 0.95, cl) * smoothstep(0.0, 0.25, rd.y) * 0.8;",
    "",
    "  // March the terrain",
    "  float t = 0.4; float hitT = -1.0;",
    "  for (int i = 0; i < 120; i++) {",
    "    vec3 p = ro + rd * t;",
    "    float d = p.y - ground(p.xz, 3);",
    "    if (d < 0.0025 * t) { hitT = t; break; }",
    "    t += max(d * 0.42, 0.012);",
    "    if (t > 42.0) break;",
    "  }",
    "",
    "  vec3 col = sky;",
    "  vec3 mist = vec3(0.085, 0.16, 0.27);",
    "  if (hitT > 0.0) {",
    "    vec3 p = ro + rd * hitT;",
    "    float h = height(p.xz, 5);",
    "    vec2 e = vec2(0.02, 0.0);",
    "    vec3 n = normalize(vec3(ground(p.xz - e.xy, 5) - ground(p.xz + e.xy, 5), 2.0 * e.x, ground(p.xz - e.yx, 5) - ground(p.xz + e.yx, 5)));",
    "    vec3 L = normalize(vec3(-0.35, 0.75, -0.55));",
    "    float dif = max(dot(n, L), 0.0);",
    "    float amb = 0.35 + 0.65 * n.y;",
    "    vec3 rock = vec3(0.11, 0.17, 0.27);",
    "    vec3 grass = vec3(0.04, 0.13, 0.12);",
    "    vec3 base = mix(rock, grass, smoothstep(0.75, 0.95, n.y) * smoothstep(1.5, 4.0, length(p.xz)));",
    "    col = base * (dif * vec3(0.62, 0.78, 1.05) + amb * vec3(0.08, 0.13, 0.22));",
    "    // Rim of frost on ridge tops",
    "    col += vec3(0.25, 0.40, 0.55) * pow(1.0 - abs(n.y), 3.0) * 0.08;",
    "    // Luminous shorelines where land meets the rivers",
    "    col += vec3(0.25, 0.75, 0.95) * smoothstep(0.22, 0.0, h - WATER) * 0.35;",
    "",
    "    // Glowing water in the valleys",
    "    if (h <= WATER + 0.002) {",
    "      float sh = fbm(p.xz * 3.0 + uTime * 0.15, 3);",
    "      vec3 water = vec3(0.05, 0.20, 0.32) + vec3(0.45, 0.95, 1.0) * pow(sh, 3.0) * 1.1;",
    "      float fres = pow(1.0 - max(-rd.y, 0.0), 4.0);",
    "      col = mix(water, sky * 1.2, fres * 0.35);",
    "    }",
    "",
    "    // Light from the orb",
    "    vec3 lo = ORB - p; float dl = length(lo);",
    "    col += uOrbCol * uOrb * max(dot(n, lo / dl), 0.0) * 2.6 / (1.0 + dl * dl * 0.55);",
    "",
    "    // Little lights scattered over the land",
    "    vec2 g = floor(p.xz * 2.5);",
    "    float hs = hash(g + uSeed);",
    "    if (hs > 0.985) {",
    "      vec2 c = (g + 0.5 + (vec2(hash(g + 3.1), hash(g + 7.7)) - 0.5) * 0.6) / 2.5;",
    "      float dd = length(p.xz - c);",
    "      float tw = 0.6 + 0.4 * sin(uTime * 2.0 + hs * 60.0);",
    "      col += mix(vec3(0.4, 0.9, 1.0), hue(hash(g + 1.7)), 0.6) * (smoothstep(0.07, 0.0, dd) * 2.2 + smoothstep(0.35, 0.0, dd) * 0.35) * tw;",
    "    }",
    "",
    "    // Distance fog and low mist",
    "    float fog = 1.0 - exp(-hitT * 0.042);",
    "    float low = exp(-max(p.y - WATER, 0.0) * 2.0) * 0.32 * (0.4 + 0.6 * fbm(p.xz * 0.5 + uTime * 0.05, 3));",
    "    col = mix(col, mist, clamp(fog + low, 0.0, 1.0) * 0.88);",
    "  }",
    "",
    "  // Haze over the whole view, thicker toward the horizon",
    "  col = mix(col, mist, 0.12 * clamp(1.0 - abs(rd.y) * 2.5, 0.0, 1.0));",
    "",
    "  // The orb",
    "  vec3 oc = ORB - ro; float tc = dot(oc, rd);",
    "  float d = length(oc - rd * tc);",
    "  bool front = tc > 0.0 && (hitT < 0.0 || tc < hitT + 0.8);",
    "  float rad = 0.68;",
    "  float bloom = exp(-d * 0.6) * 0.5 + exp(-d * 1.8) * 0.95 + exp(-d * 6.0) * 0.6;",
    "  // A soft column of light falling from the orb to the land",
    "  vec3 ocs = ORB - ro; float tcs = dot(ocs, rd); vec3 cp = ro + rd * max(tcs, 0.0) - ORB;",
    "  float beam = exp(-length(cp.xz) * 4.0) * smoothstep(0.4, -1.8, cp.y) * smoothstep(-2.4, -1.4, cp.y);",
    "  bloom += beam * 0.55;",
    "  float flick = fbm(vec2(atan(rd.y - normalize(oc).y, rd.x - normalize(oc).x) * 3.0, uTime * 0.4), 3);",
    "  bloom *= 0.8 + 0.4 * flick;",
    "  col += uOrbCol * uOrb * bloom * (front ? 1.0 : 0.35);",
    "  if (front && d < rad) {",
    "    float k = d / rad;",
    "    vec3 q = (ro + rd * tc - ORB) / rad;",
    "    float sw = fbm(vec2(atan(q.y, q.x) * 1.5 + uTime * 0.35, k * 3.0 - uTime * 0.2), 4);",
    "    vec3 core = mix(uOrbCol * 1.4, vec3(1.0, 0.97, 0.92), smoothstep(0.5, 0.0, k) * 0.55);",
    "    core = mix(core, uOrbCol * vec3(0.6, 0.4, 0.9), smoothstep(0.55, 0.85, sw) * 0.5);",
    "    float body = smoothstep(1.0, 0.75, k);",
    "    col = mix(col, core * (0.55 + sw * 0.9), body * uOrb * 0.92);",
    "    col += uOrbCol * uOrb * smoothstep(0.82, 1.0, k) * smoothstep(1.02, 0.95, k) * 1.4;",
    "  }",
    "",
    "  // Tone and grade",
    "  col = 1.0 - exp(-col * 1.7);",
    "  col = pow(col, vec3(0.92, 0.95, 0.9));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
    if (!m) return [0.5, 0.9, 1.0];
    var n = parseInt(m[1], 16);
    return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  var gl, prog, canvas, loc = {};
  var paused = false, running = false;
  var scale = 0.5, minScale = 0.3;
  var startTime = 0, pausedAt = 0, pausedTotal = 0;
  var slowFrames = 0, lastFrame = 0;

  // Current values ease toward targets.
  var cur = { r: 0.5, g: 0.9, b: 1.0, orb: 0, yaw: 0.6, height: 6.2, radius: 6.4, seed: 0 };
  var tgt = { r: 0.5, g: 0.9, b: 1.0, orb: 0, yaw: 0.6, height: 6.2, radius: 6.4, seed: 0 };

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(s) || "Shader failed to compile");
    }
    return s;
  }

  function resize() {
    var w = Math.max(1, Math.round(canvas.clientWidth * scale));
    var h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function now() { return performance.now(); }

  function render(time) {
    resize();
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform1f(loc.uTime, time);
    gl.uniform3f(loc.uOrbCol, cur.r, cur.g, cur.b);
    gl.uniform1f(loc.uOrb, cur.orb);
    gl.uniform1f(loc.uYaw, cur.yaw);
    gl.uniform1f(loc.uHeight, cur.height);
    gl.uniform1f(loc.uRadius, cur.radius);
    gl.uniform1f(loc.uSeed, cur.seed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function step(dt) {
    var k = 1 - Math.exp(-dt * 1.6);
    for (var key in tgt) {
      if (key === "seed") { cur.seed = tgt.seed; continue; }
      cur[key] += (tgt[key] - cur[key]) * k;
    }
  }

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    var t = now();
    var dt = Math.min(0.1, (t - (lastFrame || t)) / 1000);
    if (document.hidden) { lastFrame = t; return; }
    if (paused) {
      // Still settle scene changes while paused, without advancing time.
      var moving = Math.abs(tgt.orb - cur.orb) + Math.abs(tgt.yaw - cur.yaw) + Math.abs(tgt.r - cur.r) > 0.002;
      if (moving) { step(dt); render((pausedAt - startTime - pausedTotal) / 1000); }
      lastFrame = t;
      return;
    }
    step(dt);
    render((t - startTime - pausedTotal) / 1000);

    // Adaptive resolution: drop detail on slow devices.
    var frameMs = t - lastFrame;
    lastFrame = t;
    if (frameMs > 45) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
    if (slowFrames > 20 && scale > minScale) { scale = Math.max(minScale, scale - 0.08); slowFrames = 0; }
  }

  window.SpnWorld = {
    start: function (el, opts) {
      canvas = el;
      try {
        gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }) ||
             canvas.getContext("experimental-webgl");
        if (!gl) return false;
        prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var a = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        ["uRes", "uTime", "uOrbCol", "uOrb", "uYaw", "uHeight", "uRadius", "uSeed"].forEach(function (n) {
          loc[n] = gl.getUniformLocation(prog, n);
        });
      } catch (err) {
        if (window.console) console.warn("World disabled:", err);
        return false;
      }

      if (window.matchMedia && window.matchMedia("(max-width: 760px)").matches) { scale = 0.5; minScale = 0.3; }
      startTime = now();
      for (var key in tgt) cur[key] = tgt[key];
      render(0);
      canvas.classList.add("is-ready");

      paused = !!(opts && opts.paused);
      if (paused) pausedAt = now();
      running = true;
      lastFrame = now();
      requestAnimationFrame(loop);
      return true;
    },

    setScene: function (s) {
      if (s.color) { var c = hexToRgb(s.color); tgt.r = c[0]; tgt.g = c[1]; tgt.b = c[2]; }
      if (typeof s.orb === "number") tgt.orb = s.orb;
      if (typeof s.yaw === "number") tgt.yaw = s.yaw;
      if (typeof s.height === "number") tgt.height = s.height;
      if (typeof s.radius === "number") tgt.radius = s.radius;
      if (typeof s.seed === "number") tgt.seed = s.seed;
      if (s.instant) for (var key in tgt) cur[key] = tgt[key];
    },

    setPaused: function (p) {
      if (p === paused) return;
      if (p) pausedAt = now();
      else pausedTotal += now() - pausedAt;
      paused = p;
    }
  };
})();
