/* Hero girih light field. Procedural Islamic geometry in a single fragment
   shader, rendered behind the headline. Enhancement only: if anything is
   missing or the connection is metered, the canvas stays hidden and the CSS
   lamp behind it carries the hero. */
(function () {
  var canvas = document.querySelector('.hero-webgl');
  if (!canvas) return;

  var conn = navigator.connection || navigator.webkitConnection;
  if (conn && conn.saveData) return;

  var gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: false,
    powerPreference: 'low-power'
  });
  if (!gl) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 720px)').matches;

  var vsrc =
    'attribute vec2 p; varying vec2 vUv;' +
    'void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';

  var fsrc = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform float uArch;',
    'mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }',
    'float starField(vec2 p, float scale){',
    '  vec2 q = fract(p * scale) - 0.5;',
    '  float sq = abs(max(abs(q.x), abs(q.y)) - 0.46);',
    '  float dm = abs((abs(q.x) + abs(q.y)) - 0.62);',
    '  return min(sq, dm);',
    '}',
    'void main(){',
    '  vec2 uv = (vUv - 0.5);',
    '  uv.x *= uRes.x / uRes.y;',
    '  vec3 emBot = vec3(0.000, 0.129, 0.122);',
    '  vec3 emTop = vec3(0.000, 0.180, 0.173);',
    '  vec3 gold = vec3(0.945, 0.835, 0.573);',
    '  vec3 goldBright = vec3(0.976, 0.914, 0.749);',
    '  vec3 col = mix(emBot, emTop, clamp(vUv.y * 0.9 + 0.1, 0.0, 1.0));',
    '  float t = uTime;',
    '  vec2 drift = vec2(sin(t * 0.03) * 0.05, t * 0.012);',
    '  float a = starField(uv * rot(0.0) + drift, 3.0);',
    '  float b = starField(uv * rot(0.7853) - drift * 0.6, 4.4);',
    '  float star = min(a, b * 1.15);',
    '  float core = smoothstep(0.018, 0.0, star);',
    '  float halo = smoothstep(0.10, 0.0, star) * 0.14;',
    '  vec2 lp = vec2(sin(t * 0.18) * 0.55, cos(t * 0.14) * 0.32 + 0.1);',
    '  float light = smoothstep(1.05, 0.0, distance(uv, lp));',
    '  float pattern = core * (0.10 + light * 0.42) + halo * (0.4 + light * 0.6);',
    '  float clear = smoothstep(0.12, 0.85, length(uv));',
    '  pattern *= mix(0.12, 1.0, clear);',
    '  col += gold * pattern * 0.5;',
    '  vec2 cL = vec2(-0.16, -0.34);',
    '  vec2 cR = vec2(0.16, -0.34);',
    '  float vesica = max(distance(uv, cL), distance(uv, cR));',
    '  float arch = smoothstep(0.60, 0.42, vesica) * smoothstep(-0.6, 0.15, uv.y);',
    '  col += goldBright * arch * (0.06 + uArch * 0.16);',
    '  float vig = smoothstep(1.3, 0.4, length(uv));',
    '  col *= 0.7 + 0.3 * vig;',
    '  gl_FragColor = vec4(col, 1.0);',
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

  // On low-end / small screens, hold the loop at ~30fps to spare the battery.
  var minFrameMs = small ? 33 : 0;
  var lastDraw = 0;
  var revealed = false;

  function draw(ms) {
    resize();
    var t = ms * 0.001;
    var arch = 0.5 + 0.5 * Math.sin(ms * 0.0004);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uArch, arch);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!revealed) {
      revealed = true;
      canvas.classList.add('is-live');
    }
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

  // Reduced motion: one calm frame, no loop.
  if (reduce) {
    resize();
    draw(6000);
    return;
  }

  // Pause the field whenever the hero scrolls away or the tab is hidden.
  var visible = true;
  var onScreen = true;

  function sync() {
    if (visible && onScreen) start();
    else stop();
  }

  document.addEventListener('visibilitychange', function () {
    visible = document.visibilityState !== 'hidden';
    sync();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 });
    io.observe(canvas);
  }

  window.addEventListener('resize', resize);
  start();
})();
