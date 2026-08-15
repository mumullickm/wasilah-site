/* Page girih light field. Procedural Islamic geometry in a single fragment
   shader, rendered on a transparent layer behind the whole document: the
   headline, the body copy and the bar layouts all sit on top of it. The
   field is densest at the top of the page and fades out as you scroll, so
   the lower sections keep the plain emerald gradient.

   Enhancement only: if anything is missing or the connection is metered,
   the canvas stays hidden and the CSS gradient carries the page. */
(function () {
  var canvas = document.querySelector('.page-webgl');
  if (!canvas) return;

  var conn = navigator.connection || navigator.webkitConnection;
  if (conn && conn.saveData) return;

  // Transparent, premultiplied: the shader writes the light only and the body
  // gradient shows through everywhere the geometry is dark.
  var gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: 'low-power'
  });
  if (!gl) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 720px)').matches;

  // The core audience carries 2-3GB Androids. On those, the CSS gradient
  // already reads finished; spend no battery on the field.
  if (small && navigator.deviceMemory && navigator.deviceMemory <= 3) return;

  var vsrc =
    'attribute vec2 p; varying vec2 vUv;' +
    'void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';

  var fsrc = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform float uArch;',
    'uniform float uScroll;',
    /* A true khatam: union the square and its 45-degree twin FIRST, then
       take the outline. abs() before the min drew both full outlines
       everywhere, which is why the old field read as lattice noise. */
    'float khatam(vec2 p, float s){',
    '  vec2 q = abs(fract(p * s) - 0.5);',
    '  float sq = max(q.x, q.y) - 0.36;',
    '  float dm = (q.x + q.y) * 0.7071 - 0.36;',
    '  return abs(min(sq, dm));',
    '}',
    'void main(){',
    '  vec2 uv = (vUv - 0.5);',
    '  uv.x *= uRes.x / uRes.y;',
    /* The lamp and the vignette are screen effects, so they stay on uv. The
       geometry is pinned to the document, so it samples the scrolled copy and
       travels with the content instead of sticking to the glass. */
    '  vec2 sp = uv - vec2(0.0, uScroll);',
    '  vec3 gold = vec3(0.945, 0.835, 0.573);',
    '  vec3 goldBright = vec3(0.976, 0.914, 0.749);',
    '  vec3 lampCol = vec3(0.000, 0.302, 0.286);',
    '  float t = uTime;',
    '  vec2 drift = vec2(sin(t * 0.03) * 0.05, t * 0.012);',
    /* second layer at exactly 2x, offset half a cell, so the small stars
       interlock in the interstices of the large ones instead of moireing */
    '  float a = khatam(sp + drift, 3.0);',
    '  float b = khatam(sp + drift * 0.6 + vec2(0.5 / 6.0), 6.0);',
    '  float star = min(a, b * 1.2);',
    '  float core = smoothstep(0.018, 0.0, star);',
    '  float halo = smoothstep(0.10, 0.0, star) * 0.14;',
    '  vec2 lp = vec2(sin(t * 0.18) * 0.55, cos(t * 0.14) * 0.32 + 0.1);',
    '  float light = smoothstep(1.05, 0.0, distance(uv, lp));',
    '  float pattern = core * (0.10 + light * 0.42) + halo * (0.4 + light * 0.6);',
    /* Hold the middle of the screen clear: that is where the reading column is. */
    '  float clear = smoothstep(0.12, 0.85, length(uv));',
    '  pattern *= mix(0.12, 1.0, clear);',
    '  float glow = pattern * 0.5;',
    /* The mihrab arch is anchored to the hero, so it scrolls away with it. */
    '  vec2 cL = vec2(-0.16, -0.34);',
    '  vec2 cR = vec2(0.16, -0.34);',
    '  float vesica = max(distance(sp, cL), distance(sp, cR));',
    '  float arch = smoothstep(0.60, 0.42, vesica) * smoothstep(-0.6, 0.15, sp.y);',
    '  float archGlow = arch * (0.06 + uArch * 0.16);',
    '  float lamp = smoothstep(0.95, 0.0, distance(uv, lp)) * 0.10;',
    '  float vig = smoothstep(1.3, 0.4, length(uv));',
    '  float edge = 0.55 + 0.45 * vig;',
    /* Premultiplied: rgb is already the light this pixel adds, alpha is how
       much of the page behind it that light replaces. Capped at 0.24 so body
       copy landing on a stroke stays above the 4.5:1 contrast floor. */
    '  vec3 col = (gold * glow + goldBright * archGlow + lampCol * lamp) * edge;',
    '  float alpha = min((glow + archGlow + lamp) * edge, 0.24);',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var vs = compile(gl.VERTEX_SHADER, vsrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) return;

  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, 'uRes');
  var uTime = gl.getUniformLocation(prog, 'uTime');
  var uArch = gl.getUniformLocation(prog, 'uArch');
  var uScroll = gl.getUniformLocation(prog, 'uScroll');

  var dprCap = small ? 1.25 : 1.5;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    var w = Math.floor(canvas.clientWidth * dpr);
    var h = Math.floor(canvas.clientHeight * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  }

  /* The fade down the page. These are the stops the tiled girih used as a CSS
     mask, kept because they are the ones measured against body copy: dense for
     the hero, halved by a quarter of the way down, gone before the footer. Here
     they are read against scroll progress, so the curve holds whatever the
     page length is. */
  var STOPS = [[0, 1], [0.08, 0.92], [0.24, 0.62], [0.45, 0.36],
               [0.66, 0.18], [0.84, 0.07], [0.97, 0]];

  function scrollProgress() {
    var doc = document.documentElement;
    var max = (doc.scrollHeight || 0) - window.innerHeight;
    if (max <= 0) return 0;
    var y = window.pageYOffset || doc.scrollTop || 0;
    return Math.min(Math.max(y / max, 0), 1);
  }

  function fadeFor(p) {
    for (var i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i][0]) {
        var a = STOPS[i - 1], b = STOPS[i];
        var k = (p - a[0]) / (b[0] - a[0]);
        return a[1] + k * (b[1] - a[1]);
      }
    }
    return 0;
  }

  // On low-end / small screens, hold the loop at ~30fps to spare the battery.
  var minFrameMs = small ? 33 : 0;
  var lastDraw = 0;
  var revealStart = 0;
  var reveal = 0;
  var fade = 1;

  function draw(ms) {
    resize();
    fade = fadeFor(scrollProgress());
    if (!revealStart) revealStart = ms;
    // The reveal ramp is done in JS, not as a CSS transition, or every scroll
    // update would be animated 900ms behind the scroll itself.
    reveal = Math.min((ms - revealStart) / 900, 1);
    canvas.style.opacity = String(fade * reveal);
    if (fade <= 0) return;
    var t = ms * 0.001;
    var arch = 0.5 + 0.5 * Math.sin(ms * 0.0004);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uArch, arch);
    gl.uniform1f(uScroll, (window.pageYOffset || 0) / Math.max(canvas.clientHeight, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var rafId = 0;
  var running = false;

  function loop(ms) {
    if (!running) return;
    if (ms - lastDraw >= minFrameMs) {
      lastDraw = ms;
      draw(ms);
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    lastDraw = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // Reduced motion: one calm frame, and only the opacity follows the scroll.
  if (reduce) {
    resize();
    reveal = 1;
    revealStart = 1;
    draw(6000);
    canvas.style.opacity = String(fadeFor(scrollProgress()));
    window.addEventListener('scroll', function () {
      canvas.style.opacity = String(fadeFor(scrollProgress()));
    }, { passive: true });
    window.addEventListener('resize', function () {
      resize();
      draw(6000);
    });
    return;
  }

  // Pause the field whenever it has faded out under the scroll or the tab is
  // hidden. Nothing below the fold is worth a frame.
  var visible = true;

  function sync() {
    if (visible && fadeFor(scrollProgress()) > 0) start();
    else stop();
  }

  document.addEventListener('visibilitychange', function () {
    visible = document.visibilityState !== 'hidden';
    sync();
  });

  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', function () {
    resize();
    sync();
  });

  start();
})();
