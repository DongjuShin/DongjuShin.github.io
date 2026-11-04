// Procedurally generated illustrations. Nothing here is real project data.
(function () {
  const TAU = Math.PI * 2;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Night palette shared by hero, contact and figure panels (theme-independent).
  const NIGHT = { bg: "#1d1e22", ink: "#e8eef2", ink2: "#9fb0bb", line: "rgba(228,231,242,0.12)", mint: "#b8bfff", amber: "#f6c177" };

  // ---------- helpers ----------
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = (t) => t * t * (3 - 2 * t);

  function viridis(t) {
    t = clamp(t, 0, 1);
    const c0 = [0.2777, 0.0054, 0.3341], c1 = [0.1051, 1.4046, 1.3846], c2 = [-0.3309, 0.2148, 0.0951],
      c3 = [-4.6342, -5.7991, -19.3324], c4 = [6.2283, 14.1799, 56.6906], c5 = [4.7764, -13.7451, -65.353],
      c6 = [-5.4355, 4.6459, 26.3124];
    const ch = (i) => c0[i] + t * (c1[i] + t * (c2[i] + t * (c3[i] + t * (c4[i] + t * (c5[i] + t * c6[i])))));
    return [ch(0), ch(1), ch(2)].map((v) => Math.round(clamp(v, 0, 1) * 255));
  }

  function fit(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  // Run fn(now) on animation frames only while the canvas is on screen.
  function animateWhileVisible(canvas, fn, fps = 30) {
    let visible = false, last = 0, raf = 0;
    const loop = (now) => {
      raf = 0;
      if (!visible) return;
      if (now - last >= 1000 / fps) { last = now; fn(now); }
      raf = requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  // ---------- parametric wheel ----------
  function sampleWheel(r) {
    return {
      n: 5 + Math.floor(r() * 6),
      width: lerp(0.035, 0.08, r()),
      twist: lerp(-0.9, 0.9, r()),
      split: r() < 0.45 ? lerp(0.05, 0.13, r()) : 0,
      taper: lerp(0, 0.6, r()),
      hub: lerp(0.2, 0.28, r()),
      flare: lerp(0.02, 0.07, r()),
    };
  }

  function spokePolys(cx, cy, R, p) {
    const rimInner = R * 0.84, hubR = R * p.hub, steps = 30, polys = [];
    const arms = p.split ? [-p.split, p.split] : [0];
    const pt = (base, off, t) => {
      const r = lerp(hubR * 0.85, rimInner * 1.01, t);
      const a = base + off * (0.4 + 0.6 * t) + p.twist * t * t * (Math.PI / p.n);
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    };
    for (let i = 0; i < p.n; i++) {
      const base = (i / p.n) * TAU - Math.PI / 2;
      for (const off of arms) {
        const L = [], Rr = [];
        for (let s = 0; s <= steps; s++) {
          const t = s / steps, [x, y] = pt(base, off, t), [x2, y2] = pt(base, off, Math.min(1, t + 0.01));
          let dx = x2 - x, dy = y2 - y; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
          const flare = p.flare * R * ease(clamp((t - 0.75) / 0.25, 0, 1));
          const hw = R * p.width * (p.split ? 0.6 : 1) * (1 - p.taper * 0.5 * t) + flare;
          L.push([x - dy * hw, y + dx * hw]); Rr.push([x + dy * hw, y - dx * hw]);
        }
        polys.push(L.concat(Rr.reverse()));
      }
    }
    return polys;
  }

  // style: { fill, stroke, lw, alpha }
  function drawWheel(ctx, cx, cy, R, p, style) {
    const { fill, stroke, lw = 1, alpha = 1 } = style;
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineJoin = "round";
    const path = (poly) => { ctx.beginPath(); poly.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };
    const ring = (r) => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); };
    if (fill) {
      ctx.fillStyle = fill;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.arc(cx, cy, R * 0.84, 0, TAU, true); ctx.fill("evenodd");
      spokePolys(cx, cy, R, p).forEach((poly) => { path(poly); ctx.fill(); });
      ring(R * p.hub); ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU - Math.PI / 2; ctx.beginPath(); ctx.arc(cx + R * p.hub * 0.6 * Math.cos(a), cy + R * p.hub * 0.6 * Math.sin(a), R * p.hub * 0.11, 0, TAU); ctx.fill(); }
      ring(R * p.hub * 0.26); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
    if (stroke) strokeSilhouette(ctx, cx, cy, R, p, style);
  }

  // Outline of the union of all solid parts: stroke everything at 2×, then cut the interiors out.
  let layer;
  function strokeSilhouette(ctx, cx, cy, R, p, { stroke, tint, lw = 1, alpha = 1 }) {
    const c = ctx.canvas;
    layer = layer || document.createElement("canvas");
    if (layer.width !== c.width || layer.height !== c.height) { layer.width = c.width; layer.height = c.height; }
    const L = layer.getContext("2d");
    L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, layer.width, layer.height);
    L.setTransform(ctx.getTransform()); L.lineJoin = "round";
    const polys = spokePolys(cx, cy, R, p);
    const solids = () => {
      L.beginPath(); L.arc(cx, cy, R, 0, TAU); L.arc(cx, cy, R * 0.84, 0, TAU, true);
      polys.forEach((poly) => { L.moveTo(poly[0][0], poly[0][1]); poly.forEach(([x, y]) => L.lineTo(x, y)); L.closePath(); });
      L.moveTo(cx + R * p.hub, cy); L.arc(cx, cy, R * p.hub, 0, TAU);
    };
    L.strokeStyle = stroke; L.lineWidth = lw * 2;
    L.beginPath(); L.arc(cx, cy, R, 0, TAU); L.stroke();
    L.beginPath(); L.arc(cx, cy, R * 0.84, 0, TAU); L.stroke();
    polys.forEach((poly) => { L.beginPath(); poly.forEach(([x, y], k) => (k ? L.lineTo(x, y) : L.moveTo(x, y))); L.closePath(); L.stroke(); });
    L.beginPath(); L.arc(cx, cy, R * p.hub, 0, TAU); L.stroke();
    L.globalCompositeOperation = "destination-out"; L.fillStyle = "#000";
    L.beginPath(); L.arc(cx, cy, R, 0, TAU); L.arc(cx, cy, R * 0.84, 0, TAU, true); L.fill("evenodd");
    polys.forEach((poly) => { L.beginPath(); poly.forEach(([x, y], k) => (k ? L.lineTo(x, y) : L.moveTo(x, y))); L.closePath(); L.fill(); });
    L.beginPath(); L.arc(cx, cy, R * p.hub, 0, TAU); L.fill();
    L.globalCompositeOperation = "source-over";
    if (tint) { L.fillStyle = tint; solids(); L.fill("nonzero"); }
    L.strokeStyle = stroke; L.lineWidth = lw;
    L.globalAlpha = 0.4; L.beginPath(); L.arc(cx, cy, R * 0.92, 0, TAU); L.stroke(); L.globalAlpha = 1;
    L.beginPath(); L.arc(cx, cy, R * p.hub * 0.26, 0, TAU); L.stroke();
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU - Math.PI / 2; L.beginPath(); L.arc(cx + R * p.hub * 0.6 * Math.cos(a), cy + R * p.hub * 0.6 * Math.sin(a), R * p.hub * 0.11, 0, TAU); L.stroke(); }
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.drawImage(layer, 0, 0); ctx.restore();
  }

  // =====================================================================
  //  3D car body: lofted cross-sections, rendered as a shaded mesh
  //  Units: body length = 1 (≈ 4.7 m). x: nose(0) → tail(1), y: lateral, z: up.
  // =====================================================================
  const smooth = (e0, e1, x) => ease(clamp((x - e0) / (e1 - e0), 0, 1));

  // Hand-proportioned archetypes. Same point counts so they can be blended.
  //  top  : centre-line upper silhouette (bumper → hood → windshield → roof → deck/hatch → tail)
  //  belt : shoulder line where the body side meets the glasshouse
  const ARCH = [
    { name: "sedan", cd: 0.27, W: 0.196, wf: 0.19, wb: 0.6, wr: 0.071, clr: 0.03,
      top: [[0, 0.1], [0.012, 0.135], [0.04, 0.152], [0.2, 0.17], [0.32, 0.183], [0.36, 0.2], [0.47, 0.292], [0.52, 0.302], [0.62, 0.305], [0.7, 0.29], [0.8, 0.225], [0.84, 0.207], [0.96, 0.2], [0.99, 0.185], [1, 0.12]],
      belt: [[0, 0.1], [0.1, 0.158], [0.33, 0.186], [0.8, 0.203], [0.97, 0.197], [1, 0.12]] },
    { name: "coupe", cd: 0.26, W: 0.2, wf: 0.19, wb: 0.6, wr: 0.073, clr: 0.028,
      top: [[0, 0.095], [0.012, 0.128], [0.04, 0.145], [0.2, 0.163], [0.33, 0.176], [0.37, 0.19], [0.48, 0.275], [0.53, 0.284], [0.6, 0.283], [0.68, 0.262], [0.8, 0.215], [0.86, 0.2], [0.96, 0.195], [0.99, 0.18], [1, 0.115]],
      belt: [[0, 0.095], [0.1, 0.15], [0.33, 0.173], [0.82, 0.196], [0.97, 0.192], [1, 0.115]] },
    { name: "hatchback", cd: 0.3, W: 0.19, wf: 0.18, wb: 0.62, wr: 0.072, clr: 0.032,
      top: [[0, 0.105], [0.012, 0.14], [0.04, 0.158], [0.19, 0.178], [0.31, 0.19], [0.35, 0.206], [0.46, 0.305], [0.51, 0.314], [0.62, 0.316], [0.8, 0.305], [0.88, 0.29], [0.94, 0.265], [0.975, 0.21], [0.99, 0.19], [1, 0.125]],
      belt: [[0, 0.105], [0.1, 0.165], [0.31, 0.188], [0.9, 0.212], [0.97, 0.207], [1, 0.125]] },
    { name: "SUV", cd: 0.35, W: 0.205, wf: 0.18, wb: 0.62, wr: 0.083, clr: 0.05,
      top: [[0, 0.13], [0.012, 0.17], [0.04, 0.19], [0.18, 0.214], [0.29, 0.226], [0.33, 0.245], [0.43, 0.355], [0.48, 0.366], [0.62, 0.37], [0.82, 0.362], [0.9, 0.352], [0.95, 0.335], [0.98, 0.28], [0.99, 0.25], [1, 0.16]],
      belt: [[0, 0.13], [0.1, 0.2], [0.3, 0.228], [0.9, 0.255], [0.97, 0.252], [1, 0.16]] },
  ];

  function blendCar(wts, yScale, spokes) {
    const mix = (get) => wts.reduce((s, w, i) => s + w * get(ARCH[i]), 0);
    const pts = (key) => ARCH[0][key].map((_, j) => [mix((a) => a[key][j][0]), mix((a) => a[key][j][1]) * yScale]);
    return { wts, yScale, spokes, top: pts("top"), belt: pts("belt"), W: mix((a) => a.W), wf: mix((a) => a.wf), wb: mix((a) => a.wb), wr: mix((a) => a.wr), clr: mix((a) => a.clr), cd: mix((a) => a.cd),
      name: ARCH[wts.indexOf(Math.max(...wts))].name };
  }
  function sampleCar(r) {
    let wts = ARCH.map(() => Math.pow(r(), 4) + 0.001);
    const s = wts.reduce((a, b) => a + b, 0);
    wts = wts.map((w) => w / s);
    return blendCar(wts, lerp(0.98, 1.03, r()), 5 + Math.floor(r() * 3));
  }

  // Catmull-Rom through (x, z) points with increasing x → z(x)
  function curveFn(pts) {
    const P = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let s = 0; s < 8; s++) {
        const t = s / 8, t2 = t * t, t3 = t2 * t;
        P.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    P.push(pts[pts.length - 1]);
    return (x) => {
      if (x <= P[0][0]) return P[0][1];
      for (let i = 1; i < P.length; i++) if (P[i][0] >= x) { const a = P[i - 1], b = P[i]; return lerp(a[1], b[1], (x - a[0]) / ((b[0] - a[0]) || 1)); }
      return P[P.length - 1][1];
    };
  }

  function buildCar(c, NX) {
    const zTop = curveFn(c.top), zBelt = curveFn(c.belt);
    const hw = (x) => c.W * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * x - 1), 6)), 1 / 6);
    const zLow = (x) => c.clr + 0.042 * (1 - smooth(0, 0.15, x)) + 0.05 * smooth(0.86, 1, x);
    const rings = [], meta = [];
    for (let i = 0; i < NX; i++) {
      const x = 0.5 - 0.5 * Math.cos((Math.PI * i) / (NX - 1));
      const zt = zTop(x), zl = Math.min(zLow(x), zt - 0.004), zb = clamp(zBelt(x), zl + 0.004, zt - 0.006);
      const W = hw(x), Wc = W * 0.7, cf = smooth(0.012, 0.05, zt - zb), H = zb - zl;
      const side = [[W * 0.9, zl], [W, zl + H * 0.2], [W, zl + H * 0.62], [W * 0.98, zb - H * 0.08], [W * 0.93, zb]];
      const hood = [[W * 0.84, lerp(zb, zt, 0.3)], [W * 0.62, lerp(zb, zt, 0.75)], [W * 0.32, zt - 0.001], [0, zt]];
      const cab = [[W * 0.87, zb + 0.004], [lerp(W * 0.87, Wc, 0.85), zt - 0.028], [Wc * 0.78, zt - 0.004], [0, zt]];
      const half = side.concat(hood.map((p, k) => [lerp(p[0], cab[k][0], cf), lerp(p[1], cab[k][1], cf)]));
      const ring = half.map(([y, z]) => [x, -y, z]).concat(half.slice(0, 8).reverse().map(([y, z]) => [x, y, z]));
      rings.push(ring);
      meta.push({ x, cf, slope: (zTop(x + 0.004) - zTop(x - 0.004)) / 0.008 });
    }
    return { rings, meta, hw, zTop, zLow };
  }

  // Perspective turntable camera
  function camera(w, h, { yaw, pitch, scale, ox = 0.5, oy = 0.55, center = [0.5, 0, 0.15] }) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), D = 3, S = w * scale;
    const rot = (v) => { const X = v[0] * cy - v[1] * sy, Y = v[0] * sy + v[1] * cy, Z = v[2]; return [X, Y * cp - Z * sp, Z * cp + Y * sp]; };
    const view = (p) => rot([p[0] - center[0], p[1] - center[1], p[2] - center[2]]);
    const proj = (p) => { const v = view(p), k = D / (D + v[1]); return [w * ox + v[0] * k * S, h * oy - v[2] * k * S, v[1]]; };
    return { rot, view, proj, D, S };
  }

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const LIGHT = norm([-0.4, -0.6, 0.75]);

  // mode: "field" (pressure-like colouring), "shade" (neutral clay), "wire" (dark with mint mesh)
  function renderCar(ctx, c, cam, { mode = "field", NX = 44, spin = 0, tint = null, edges = true, wheelsDetail = true } = {}) {
    const car = buildCar(c, NX), { rings, meta, hw } = car;
    const camPos = [0, -cam.D, 0];

    // contact shadow
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const x = i / 24, p = cam.proj([x, -hw(x) * 1.04 - 0.01, 0]); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    for (let i = 24; i >= 0; i--) { const x = i / 24, p = cam.proj([x, hw(x) * 1.04 + 0.01, 0]); ctx.lineTo(p[0], p[1]); }
    ctx.closePath(); ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 18; ctx.fill();
    ctx.restore();

    // wheels: which side faces the camera?
    const nearY = cam.view([0.5, 1, 0])[1] < cam.view([0.5, -1, 0])[1] ? 1 : -1;
    const wheelXs = [c.wf, c.wf + c.wb];
    const drawWheel3D = (wx, ys, face) => {
      const R = c.wr, yo = ys * (hw(wx) - 0.004), yi = ys * (hw(wx) - 0.052), N = 32;
      const ring = (y, r) => Array.from({ length: N }, (_, k) => { const a = (k / N) * TAU; return [wx + r * Math.cos(a), y, R + r * Math.sin(a)]; });
      const out = ring(yo, R), inn = ring(yi, R);
      // tread
      const quads = [];
      for (let k = 0; k < N; k++) { const q = [out[k], out[(k + 1) % N], inn[(k + 1) % N], inn[k]].map(cam.proj); quads.push({ q, d: (q[0][2] + q[2][2]) / 2 }); }
      quads.sort((a, b) => b.d - a.d).forEach(({ q }) => { ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = "#121a22"; ctx.fill(); ctx.strokeStyle = "rgba(160,220,210,0.10)"; ctx.lineWidth = 0.6; ctx.stroke(); });
      if (!face) return;
      const path = (pts) => { ctx.beginPath(); pts.map(cam.proj).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
      path(out); ctx.fillStyle = "#0d141b"; ctx.fill(); ctx.strokeStyle = "rgba(160,220,210,0.35)"; ctx.lineWidth = 1; ctx.stroke();
      const yr = yo + ys * 0.002;
      path(ring(yr, R * 0.68)); ctx.fillStyle = "rgba(184,191,255,0.10)"; ctx.fill(); ctx.strokeStyle = NIGHT.mint; ctx.lineWidth = 1.2; ctx.stroke();
      if (wheelsDetail) {
        ctx.strokeStyle = "rgba(184,191,255,0.8)"; ctx.lineCap = "round";
        const sw = Math.max(1.2, R * cam.S * 0.09);
        for (let k = 0; k < c.spokes; k++) {
          const a = spin * ys + (k / c.spokes) * TAU;
          const p1 = cam.proj([wx + R * 0.16 * Math.cos(a), yr, R + R * 0.16 * Math.sin(a)]);
          const p2 = cam.proj([wx + R * 0.64 * Math.cos(a + 0.18), yr, R + R * 0.64 * Math.sin(a + 0.18)]);
          ctx.lineWidth = sw; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
        ctx.lineCap = "butt";
        path(ring(yr, R * 0.15)); ctx.fillStyle = NIGHT.mint; ctx.fill();
      }
    };
    wheelXs.forEach((wx) => drawWheel3D(wx, -nearY, false));

    // body faces
    const faces = [];
    for (let i = 0; i < rings.length - 1; i++) {
      const A = rings[i], B = rings[i + 1], m = meta[i], m2 = meta[i + 1];
      for (let j = 0; j < A.length - 1; j++) {
        const P = [A[j], A[j + 1], B[j + 1], B[j]];
        let n = norm(cross(sub(P[2], P[0]), sub(P[3], P[1])));
        const mid = [(P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2, (P[0][2] + P[2][2]) / 2];
        if (dot(n, sub(mid, [0.5, 0, 0.13])) < 0) n = [-n[0], -n[1], -n[2]];
        const vMid = cam.view(mid), vn = cam.rot(n);
        if (dot(vn, sub(vMid, camPos)) > 0.02) continue; // back-face
        const cf = (m.cf + m2.cf) / 2, slope = Math.abs((m.slope + m2.slope) / 2);
        const sideGlass = (j === 5 || j === 10) && cf > 0.6;
        const topGlass = (j >= 6 && j <= 9) && cf > 0.5 && slope > 0.45;
        faces.push({ q: P.map(cam.proj), d: vMid[1], n, glass: sideGlass || topGlass });
      }
    }
    faces.sort((a, b) => b.d - a.d);
    for (const f of faces) {
      const lam = 0.45 + 0.55 * Math.max(0, dot(f.n, LIGHT));
      let fill;
      if (f.glass) fill = `rgba(${Math.round(18 + 40 * lam)},${Math.round(32 + 60 * lam)},${Math.round(44 + 66 * lam)},1)`;
      else if (mode === "field") {
        const v = clamp(0.38 + 0.62 * Math.max(0, -f.n[0]) * 1.1 - 0.32 * Math.max(0, f.n[2]) * (1 - Math.max(0, -f.n[0])) + 0.08 * f.n[1] * f.n[1], 0, 1);
        const [r, g, b] = viridis(v); fill = `rgb(${Math.round(r * (0.6 + 0.4 * lam))},${Math.round(g * (0.6 + 0.4 * lam))},${Math.round(b * (0.6 + 0.4 * lam))})`;
      } else if (mode === "shade") {
        const base = tint || [150, 170, 182], k = 0.35 + 0.65 * lam;
        fill = `rgb(${Math.round(base[0] * k)},${Math.round(base[1] * k)},${Math.round(base[2] * k)})`;
      } else fill = `rgb(${Math.round(14 + 14 * lam)},${Math.round(22 + 22 * lam)},${Math.round(30 + 24 * lam)})`;
      ctx.beginPath(); f.q.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill();
      if (edges) {
        ctx.strokeStyle = mode === "wire" ? "rgba(184,191,255,0.55)" : f.glass ? "rgba(160,220,210,0.18)" : "rgba(8,12,18,0.35)";
        ctx.lineWidth = mode === "wire" ? 0.7 : 0.5; ctx.stroke();
      } else { ctx.strokeStyle = fill; ctx.lineWidth = 0.6; ctx.stroke(); }
    }

    // near wheels + arch lines
    wheelXs.forEach((wx) => drawWheel3D(wx, nearY, true));
    ctx.strokeStyle = mode === "wire" ? NIGHT.mint : "rgba(232,238,242,0.55)"; ctx.lineWidth = 1.1;
    for (const wx of wheelXs) {
      ctx.beginPath();
      for (let k = 0; k <= 20; k++) { const a = Math.PI * (0.06 + 0.88 * (k / 20)), r = c.wr * 1.14, x = wx - r * Math.cos(a); const p = cam.proj([x, nearY * (hw(x) + 0.002), c.wr + r * Math.sin(a)]); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
      ctx.stroke();
    }
    return car;
  }

  // ---------- flowing silk-like ribbons (purely decorative) ----------
  // opts.bands: ribbon definitions; opts.weight: "right" fades the left side so text stays readable.
  const PEARL = [228, 231, 242], LAVENDER = [176, 184, 255];   // on dark backgrounds
  const INDIGO = [63, 75, 168], PERIWINKLE = [118, 132, 214];  // on the light navy hero
  const RIBBON_PRESETS = {
    hero: [
      { n: 96, hue: LAVENDER, amp: 0.13, f: 0.9, twist: 1.0, speed: 1, y: 0.5, gap: 0.0040, lw: 1.2 },
      { n: 64, hue: PEARL, amp: 0.10, f: 1.25, twist: 1.3, speed: -0.7, y: 0.56, gap: 0.0038, lw: 1 },
    ],
    band: [
      { n: 28, hue: LAVENDER, amp: 0.30, f: 0.9, twist: 1.2, speed: 0.8, y: 0.52, gap: 0.021, lw: 1.1 },
      { n: 20, hue: PEARL, amp: 0.22, f: 1.3, twist: 1.5, speed: -0.6, y: 0.5, gap: 0.02, lw: 1 },
    ],
  };
  function ribbons(canvas, opts = {}) {
    const light = opts.theme === "light";
    const bands = RIBBON_PRESETS[opts.preset || "hero"].map((b) => (light ? { ...b, hue: b.hue === LAVENDER ? INDIGO : PERIWINKLE } : b));
    const host = canvas.parentElement;
    let px = 0.5, py = 0.5, tx = 0.5, ty = 0.5; // pointer, eased
    host.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; });
    host.addEventListener("pointerleave", () => { tx = 0.5; ty = 0.5; });
    const right = opts.weight === "right";
    function draw(now) {
      const { ctx, w, h } = fit(canvas);
      ctx.clearRect(0, 0, w, h);
      px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      const t = reduceMotion ? 0 : now * 0.0002;
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      const STEPS = 110;
      for (const b of bands) {
        for (let i = 0; i < b.n; i++) {
          const k = i / (b.n - 1) - 0.5; // −0.5 … 0.5 across the ribbon
          ctx.beginPath();
          for (let s = 0; s <= STEPS; s++) {
            const u = s / STEPS, x = -0.05 + u * 1.1;
            const phase = u * Math.PI * 2 * b.f + t * b.speed * 2;
            const twist = Math.cos(u * Math.PI * b.twist + t * b.speed * 1.3 + (px - 0.5));
            const y = b.y + (py - 0.5) * 0.06
              + b.amp * Math.sin(phase) * (0.55 + 0.45 * Math.sin(u * Math.PI))
              + k * b.n * b.gap * twist * 1.6
              + 0.03 * Math.sin(phase * 2.3 + i * 0.05);
            s ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h);
          }
          const edge = 1 - Math.abs(k) * 2; // brighter in the middle of the ribbon
          const a = light ? 0.04 + 0.26 * edge : 0.04 + 0.2 * edge, [r, g2, b2] = b.hue;
          const g = ctx.createLinearGradient(0, 0, w, 0);
          const c = (al) => `rgba(${r},${g2},${b2},${al})`;
          if (right) { g.addColorStop(0, c(0)); g.addColorStop(0.35, c(a * 0.25)); g.addColorStop(0.7, c(a)); g.addColorStop(1, c(a * 0.5)); }
          else { g.addColorStop(0, c(0)); g.addColorStop(0.15, c(a * 0.8)); g.addColorStop(0.55, c(a)); g.addColorStop(0.9, c(a * 0.6)); g.addColorStop(1, c(0)); }
          ctx.strokeStyle = g; ctx.lineWidth = b.lw || 1;
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (reduceMotion) { draw(0); window.addEventListener("resize", () => draw(0)); }
    else animateWhileVisible(canvas, draw, opts.fps || 50);
  }

  // =====================================================================
  //  Research figures — each one is a small diagram with a single message
  // =====================================================================
  function label(ctx, text, x, y, { color = NIGHT.ink2, align = "left", size = 10, weight = 400 } = {}) {
    ctx.fillStyle = color; ctx.textAlign = align; ctx.font = `${weight} ${size}px 'JetBrains Mono', monospace`; ctx.fillText(text, x, y); ctx.textAlign = "left";
  }
  function arrow(ctx, x1, y1, x2, y2, color = NIGHT.mint) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - 6, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 8, y2 - 4.5); ctx.lineTo(x2 - 8, y2 + 4.5); ctx.closePath(); ctx.fill();
  }
  function panelBg(ctx, w, h) {
    ctx.fillStyle = NIGHT.bg; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
    g.addColorStop(0, "rgba(184,191,255,0.06)"); g.addColorStop(1, "rgba(184,191,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  function miniCar(ctx, c, x, y, size, opts) {
    const cam = { ...camera(size * 1.25, size, { yaw: 0.6, pitch: 0.28, scale: 0.92, oy: 0.62 }) };
    ctx.save(); ctx.translate(x - size * 0.625, y - size * 0.5);
    renderCar(ctx, c, cam, { NX: 26, wheelsDetail: false, edges: false, ...opts });
    ctx.restore();
  }

  // fig 1 — few references → generative model → many new designs
  function figGenerative(canvas, seed) {
    const { ctx, w, h } = fit(canvas);
    const r = rng(seed);
    panelBg(ctx, w, h);
    const pure = (i) => blendCar(ARCH.map((_, k) => (k === i ? 1 : 0)), 1, 5);
    const refs = [pure(0), pure(2), pure(3)];
    const colW = w * 0.24, s = Math.min(colW * 0.8, h * 0.22);
    label(ctx, "REFERENCES", colW * 0.5, 22, { align: "center" });
    refs.forEach((c, i) => miniCar(ctx, c, colW * 0.5, h * (0.3 + i * 0.26), s, { mode: "shade", tint: [160, 172, 182] }));

    // generative model block
    const mx = w * 0.36, mw = w * 0.13;
    ctx.strokeStyle = NIGHT.mint; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.strokeRect(mx, h * 0.3, mw, h * 0.4); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(184,191,255,0.06)"; ctx.fillRect(mx, h * 0.3, mw, h * 0.4);
    for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(184,191,255,${0.3 + r() * 0.5})`; ctx.beginPath(); ctx.arc(mx + mw * (0.2 + r() * 0.6), h * (0.36 + r() * 0.28), 1.6, 0, TAU); ctx.fill(); }
    label(ctx, "latent", mx + mw / 2, h * 0.3 - 8, { align: "center", color: NIGHT.mint });
    label(ctx, "space", mx + mw / 2, h * 0.7 + 14, { align: "center", color: NIGHT.mint });
    arrow(ctx, colW * 0.98, h * 0.5, mx - 4, h * 0.5);
    arrow(ctx, mx + mw + 4, h * 0.5, w * 0.54, h * 0.5);

    // generated grid
    const gx = w * 0.56, gw = w * 0.42, cols = 3, rows = 3, cw = gw / cols, ch = (h - 40) / rows;
    label(ctx, "GENERATED DESIGNS", gx + gw / 2, 22, { align: "center" });
    const best = Math.floor(r() * 9);
    for (let i = 0; i < 9; i++) {
      const c = sampleCar(r), cx = gx + (i % cols + 0.5) * cw, cy = 32 + (Math.floor(i / cols) + 0.5) * ch;
      if (i === best) { ctx.strokeStyle = NIGHT.mint; ctx.lineWidth = 1.2; ctx.strokeRect(cx - cw * 0.47, cy - ch * 0.46, cw * 0.94, ch * 0.92); label(ctx, "selected", cx - cw * 0.44, cy - ch * 0.46 + 12, { color: NIGHT.mint, size: 9 }); }
      miniCar(ctx, c, cx, cy + 2, Math.min(cw * 0.78, ch * 0.95), { mode: "shade", tint: i === best ? [184, 191, 255] : [150, 156, 170] });
    }
  }

  // fig 2 — geometry → neural surrogate → predicted field (no simulation in the loop)
  function figField(canvas, seed) {
    const { ctx, w, h } = fit(canvas);
    panelBg(ctx, w, h);
    const c = sampleCar(rng(seed * 31 + 7));
    const s = Math.min(w * 0.26, h * 0.56);
    label(ctx, "INPUT GEOMETRY", w * 0.19, 22, { align: "center" });
    miniCar(ctx, c, w * 0.19, h * 0.52, s, { mode: "wire", edges: true, NX: 34 });
    // surrogate block
    const bx = w * 0.4, bw = w * 0.17, by = h * 0.36, bh = h * 0.28;
    ctx.fillStyle = "rgba(184,191,255,0.07)"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = NIGHT.mint; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    // tiny network glyph
    const layers = [3, 5, 5, 3], lx = (k) => bx + bw * (0.18 + 0.64 * (k / 3));
    ctx.strokeStyle = "rgba(184,191,255,0.25)";
    for (let k = 0; k < 3; k++) for (let a = 0; a < layers[k]; a++) for (let b = 0; b < layers[k + 1]; b++) {
      const ya = by + bh * ((a + 1) / (layers[k] + 1)), yb = by + bh * ((b + 1) / (layers[k + 1] + 1));
      ctx.beginPath(); ctx.moveTo(lx(k), ya); ctx.lineTo(lx(k + 1), yb); ctx.stroke();
    }
    ctx.fillStyle = NIGHT.mint;
    layers.forEach((n, k) => { for (let a = 0; a < n; a++) { ctx.beginPath(); ctx.arc(lx(k), by + bh * ((a + 1) / (n + 1)), 2.2, 0, TAU); ctx.fill(); } });
    label(ctx, "neural surrogate", bx + bw / 2, by - 10, { align: "center", color: NIGHT.mint });
    label(ctx, "milliseconds, no CAE", bx + bw / 2, by + bh + 18, { align: "center", size: 9 });
    arrow(ctx, w * 0.33, h * 0.5, bx - 4, h * 0.5);
    arrow(ctx, bx + bw + 4, h * 0.5, w * 0.62, h * 0.5);
    label(ctx, "PREDICTED SURFACE FIELD", w * 0.8, 22, { align: "center" });
    miniCar(ctx, c, w * 0.81, h * 0.52, s, { mode: "field", edges: true, NX: 34 });
    const cbx = w * 0.66, cby = h - 24, cbw = w * 0.28;
    for (let i = 0; i < cbw; i++) { const [r, g, b] = viridis(i / cbw); ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(cbx + i, cby, 1, 5); }
    label(ctx, "low", cbx, cby - 4, { size: 9 }); label(ctx, "high", cbx + cbw, cby - 4, { size: 9, align: "right" });
  }

  // fig 3 — wheel design domain & loads → topology-optimized spoke layout → ML-generated variants
  // Wheels are real 3D meshes (tyre, rim barrel with flanges and drop centre, swept spokes, hub with
  // lug nuts) rendered with a painter's algorithm and Blinn-Phong shading.
  // Model units: rim radius ≈ 1, tyre radius 1.35; axis along +y (y = 0 is the outer face).
  function wheelMesh(p, { domain = false, M = 64 } = {}) {
    const quads = [];
    const P = (r, y, a) => [r * Math.cos(a), y, r * Math.sin(a)];
    const revolve = (prof, mat, m = M) => {
      for (let i = 0; i < m; i++) {
        const a0 = (i / m) * TAU, a1 = ((i + 1) / m) * TAU;
        for (let j = 0; j < prof.length - 1; j++) quads.push({ mat, pts: [P(prof[j][0], prof[j][1], a0), P(prof[j][0], prof[j][1], a1), P(prof[j + 1][0], prof[j + 1][1], a1), P(prof[j + 1][0], prof[j + 1][1], a0)] });
      }
    };
    const hub = p.hub * 0.9;
    const face = (r) => 0.03 + 0.13 * Math.pow(clamp((0.9 - r) / (0.9 - hub), 0, 1), 1.4); // concave spoke face
    // tyre (rounded sidewalls, flat-ish tread)
    revolve([[1.0, 0.06], [1.035, 0.012], [1.1, -0.004], [1.2, -0.008], [1.29, 0.025], [1.34, 0.09], [1.355, 0.25], [1.34, 0.41], [1.29, 0.475], [1.2, 0.508], [1.1, 0.504], [1.035, 0.488], [1.0, 0.44]], "rubber");
    // rim barrel: outer flange, bead seat, drop centre, inner flange
    revolve([[0.88, 0.0], [0.96, -0.012], [0.995, 0.008], [0.975, 0.05], [0.93, 0.08], [0.9, 0.12], [0.81, 0.2], [0.8, 0.33], [0.9, 0.4], [0.93, 0.44], [0.975, 0.462], [0.95, 0.5]], "rim");
    if (domain) {
      // design domain: a solid concave plate between hub and rim
      revolve(Array.from({ length: 7 }, (_, k) => { const r = hub + (0.9 - hub) * (k / 6); return [r, face(r)]; }), "domain");
    } else {
      // swept spokes (optionally splitting into two arms toward the rim)
      const S = 16, t = 0.075;
      for (let k = 0; k < p.n; k++) {
        const base = (k / p.n) * TAU;
        for (const s of p.split ? [-1, 1] : [0]) {
          const st = [];
          for (let q = 0; q <= S; q++) {
            const r = hub * 0.95 + (0.9 - hub * 0.95) * (q / S);
            const spread = p.split * ease(clamp((r - p.rs) / (0.86 - p.rs), 0, 1));
            const a = base + p.twist * (r - hub) * (r - hub) + s * spread;
            const hw = p.w * (1 - 0.35 * (r - hub)) * (s ? 0.62 + 0.38 * (1 - ease(clamp((r - p.rs) / (0.86 - p.rs), 0, 1))) : 1);
            const c = P(r, face(r), a), l = [-Math.sin(a), 0, Math.cos(a)];
            st.push({ FL: [c[0] + l[0] * hw, c[1], c[2] + l[2] * hw], FR: [c[0] - l[0] * hw, c[1], c[2] - l[2] * hw] });
          }
          for (let q = 0; q < S; q++) {
            const A = st[q], B = st[q + 1], back = (v) => [v[0], v[1] + t, v[2]];
            quads.push({ mat: "metal", pts: [A.FL, A.FR, B.FR, B.FL] });
            quads.push({ mat: "metal", pts: [back(A.FL), back(B.FL), back(B.FR), back(A.FR)] });
            quads.push({ mat: "metal", pts: [A.FL, B.FL, back(B.FL), back(A.FL)] });
            quads.push({ mat: "metal", pts: [A.FR, back(A.FR), back(B.FR), B.FR] });
          }
        }
      }
    }
    // hub: face disc + barrel, centre bore, lug nuts
    const yh = face(hub) - 0.01;
    revolve([[hub * 0.24, yh], [hub, yh], [hub * 1.02, yh + 0.03], [hub * 1.02, yh + 0.14]], "metal", Math.max(32, M / 2));
    revolve([[0, yh + 0.02], [hub * 0.24, yh + 0.02], [hub * 0.24, yh]], "cap", 24);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU - Math.PI / 2, lx = hub * 0.62 * Math.cos(a), lz = hub * 0.62 * Math.sin(a), rr = hub * 0.12;
      const N = (y, rad, b) => [lx + rad * Math.cos(b), y, lz + rad * Math.sin(b)];
      for (let i = 0; i < 6; i++) {
        const b0 = (i / 6) * TAU, b1 = ((i + 1) / 6) * TAU;
        quads.push({ mat: "nut", pts: [N(yh, rr, b0), N(yh, rr, b1), N(yh - 0.035, rr, b1), N(yh - 0.035, rr, b0)] });
        quads.push({ mat: "nut", pts: [N(yh - 0.035, rr, b0), N(yh - 0.035, rr, b1), N(yh - 0.035, 0, b1), N(yh - 0.035, 0, b0)] });
      }
    }
    return { quads, yh, hub };
  }

  function renderWheel3D(ctx, cx, cy, Rpx, p, { domain = false, tone = [214, 218, 230], yaw = 0.58, pitch = 0.16, M = 64 } = {}) {
    const { quads, yh, hub } = wheelMesh(p, { domain, M });
    const s = Rpx / 1.36, D = 7, cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const proj = (v) => {
      const x = v[0], y = v[1] - 0.25, z = v[2];
      const X = x * cyw - y * syw, Y = x * syw + y * cyw, depth = Y * cp - z * sp, up = z * cp + Y * sp, k = D / (D + depth);
      return [cx + X * k * s, cy - up * k * s, depth];
    };
    const V = norm([-syw, -cyw, 0.3]), L = norm([-0.55, -0.75, 0.75]), H = norm([V[0] + L[0], V[1] + L[1], V[2] + L[2]]);

    // ground shadow
    ctx.save(); ctx.filter = `blur(${Math.max(4, Rpx * 0.06)}px)`; ctx.fillStyle = "rgba(0,0,0,0.5)";
    const g0 = proj([0, 0.25, -1.36]);
    ctx.beginPath(); ctx.ellipse(g0[0] + Rpx * 0.05, g0[1] + Rpx * 0.02, Rpx * 0.75, Rpx * 0.11, 0, 0, TAU); ctx.fill(); ctx.restore();

    const faces = quads.map((q) => {
      const pp = q.pts.map(proj);
      let n = norm(cross(sub(q.pts[2], q.pts[0]), sub(q.pts[3], q.pts[1])));
      if (dot(n, V) < 0) n = [-n[0], -n[1], -n[2]]; // two-sided shading
      return { pp, n, mat: q.mat, d: (pp[0][2] + pp[1][2] + pp[2][2] + pp[3][2]) / 4 };
    }).sort((a, b) => b.d - a.d);

    for (const f of faces) {
      const lam = Math.max(0, dot(f.n, L)), spec = Math.pow(Math.max(0, dot(f.n, H)), 40);
      let rgb, a = 1;
      if (f.mat === "rubber") rgb = [30, 31, 36].map((c) => c * (0.6 + 0.8 * lam) + 70 * spec);
      else if (f.mat === "domain") rgb = [118, 122, 136].map((c) => c * (0.45 + 0.7 * lam) + 120 * spec);
      else if (f.mat === "cap") rgb = tone.map((c) => c * 0.35);
      else {
        const k = f.mat === "rim" ? 0.9 : f.mat === "nut" ? 0.75 : 1;
        rgb = tone.map((c) => c * k * (0.22 + 0.78 * lam) + 255 * 0.55 * spec);
      }
      const col = `rgba(${rgb.map((c) => Math.round(clamp(c, 0, 255))).join(",")},${a})`;
      ctx.beginPath(); f.pp.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
      ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 0.6; ctx.stroke();
    }
    return { proj, yh, hub };
  }

  function arrowTo(ctx, x1, y1, x2, y2, color) {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - 6 * Math.cos(a), y2 - 6 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(a - 0.45), y2 - 9 * Math.sin(a - 0.45)); ctx.lineTo(x2 - 9 * Math.cos(a + 0.45), y2 - 9 * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  }

  function figTopology(canvas, seed) {
    const { ctx, w, h } = fit(canvas);
    const r = rng(seed);
    panelBg(ctx, w, h);
    const LOAD = "#f6c177";

    // (a) design domain: solid plate between hub and rim, fixed hub, tyre loads
    const aR = Math.min(w * 0.115, h * 0.27), ax = w * 0.15, ay = h * 0.5;
    label(ctx, "DESIGN DOMAIN", ax, 22, { align: "center" });
    const dom = renderWheel3D(ctx, ax, ay, aR, { n: 0, hub: 0.26, w: 0, twist: 0, split: 0, rs: 0.5 }, { domain: true, M: 48 });
    const hubPts = Array.from({ length: 28 }, (_, k) => dom.proj([dom.hub * 1.02 * Math.cos((k / 28) * TAU), dom.yh - 0.04, dom.hub * 1.02 * Math.sin((k / 28) * TAU)]));
    ctx.save(); ctx.beginPath(); hubPts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    ctx.fillStyle = "rgba(29,30,34,0.55)"; ctx.fill(); ctx.clip();
    ctx.strokeStyle = "rgba(232,236,244,0.8)"; ctx.lineWidth = 1;
    for (let k = -aR; k < aR; k += 4) { ctx.beginPath(); ctx.moveTo(ax + k - aR * 0.3, ay - aR * 0.3); ctx.lineTo(ax + k + aR * 0.3, ay + aR * 0.3); ctx.stroke(); }
    ctx.restore();
    const contact = dom.proj([0, 0.0, -1.36]); arrowTo(ctx, contact[0], contact[1] + 26, contact[0], contact[1] + 2, LOAD);
    const side = dom.proj([-1.36, 0.0, 0.1]); arrowTo(ctx, side[0] - 26, side[1], side[0] - 2, side[1], LOAD);
    label(ctx, "fixed hub", ax, ay - aR - 10, { align: "center", size: 9 });
    label(ctx, "tyre loads", ax, contact[1] + 42, { align: "center", size: 9, color: LOAD });
    arrow(ctx, ax + aR * 1.2, h * 0.5, w * 0.335, h * 0.5);
    label(ctx, "TO", (ax + aR * 1.2 + w * 0.335) / 2, h * 0.5 - 10, { align: "center", color: NIGHT.mint, size: 9 });

    // (b) optimized spoke layout
    const bR = Math.min(w * 0.17, h * 0.38), bx = w * 0.52, by = h * 0.52;
    label(ctx, "OPTIMIZED SPOKE LAYOUT", bx, 22, { align: "center" });
    renderWheel3D(ctx, bx, by, bR, { n: 5, hub: 0.26, w: 0.1, twist: 0.55, split: 0.16, rs: 0.5 }, { tone: [222, 226, 236] });
    arrow(ctx, bx + bR * 1.12, h * 0.5, w * 0.765, h * 0.5);
    label(ctx, "ML", (bx + bR * 1.12 + w * 0.765) / 2, h * 0.5 - 10, { align: "center", color: NIGHT.mint, size: 9 });

    // (c) generated variants
    const cx = w * 0.88, cR = Math.min(w * 0.06, (h - 56) / 6.8);
    label(ctx, "GENERATED VARIANTS", cx, 22, { align: "center" });
    for (let k = 0; k < 3; k++) {
      const p = { n: 4 + Math.floor(r() * 5), hub: lerp(0.22, 0.3, r()), w: lerp(0.07, 0.12, r()), twist: lerp(-0.9, 0.9, r()), split: r() > 0.4 ? lerp(0.1, 0.2, r()) : 0, rs: lerp(0.4, 0.6, r()) };
      renderWheel3D(ctx, cx, 44 + cR + k * (cR * 2 + 12), cR, p, { tone: k === 0 ? [184, 191, 255] : [210, 214, 226], M: 40 });
    }
  }

  // fig 4 — two objectives to minimise (compliance, aesthetic penalty) → Pareto front near the origin
  function figPreference(canvas, seed) {
    const { ctx, w, h } = fit(canvas);
    const r = rng(seed);
    panelBg(ctx, w, h);
    const L = 58, R = w - 26, T = 30, B = h - 44;
    const X = (x) => L + x * (R - L), Y = (y) => B - y * (B - T);
    ctx.strokeStyle = "rgba(232,238,242,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    label(ctx, "compliance (predicted) →", R, B + 28, { align: "right" });
    ctx.save(); ctx.translate(L - 32, (T + B) / 2); ctx.rotate(-Math.PI / 2); label(ctx, "aesthetic penalty (predicted) →", 0, 0, { align: "center" }); ctx.restore();
    label(ctx, "↙ better", L + 8, B - 10, { color: NIGHT.mint, size: 9 });

    const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
    const front = (x) => 0.07 + 0.72 * Math.pow(1 - x, 2.1); // convex, bowing toward the origin
    const pts = Array.from({ length: 70 }, () => {
      const x = 0.05 + r() * 0.9;
      return { x, y: clamp(front(x) + Math.abs(gauss()) * 0.16 + r() * 0.12, 0.03, 0.97), p: sampleWheel(r) };
    });
    const pf = pts.filter((a) => !pts.some((b) => b !== a && b.x <= a.x && b.y <= a.y)).sort((a, b) => a.x - b.x);
    // dominated region (up-right of the staircase)
    ctx.beginPath(); ctx.moveTo(X(pf[0].x), Y(1));
    pf.forEach((a, i) => { ctx.lineTo(X(a.x), Y(a.y)); if (i < pf.length - 1) ctx.lineTo(X(pf[i + 1].x), Y(a.y)); });
    ctx.lineTo(X(1), Y(pf[pf.length - 1].y)); ctx.lineTo(X(1), Y(1)); ctx.closePath();
    ctx.fillStyle = "rgba(232,236,244,0.04)"; ctx.fill();
    for (const a of pts) { ctx.fillStyle = "rgba(170,174,188,0.5)"; ctx.beginPath(); ctx.arc(X(a.x), Y(a.y), 2.4, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = NIGHT.mint; ctx.lineWidth = 1.6; ctx.beginPath();
    pf.forEach((a, i) => (i ? ctx.lineTo(X(a.x), Y(a.y)) : ctx.moveTo(X(a.x), Y(a.y)))); ctx.stroke();
    for (const a of pf) { ctx.fillStyle = NIGHT.mint; ctx.beginPath(); ctx.arc(X(a.x), Y(a.y), 3.6, 0, TAU); ctx.fill(); }
    const mid = pf[Math.floor(pf.length * 0.5)];
    label(ctx, "Pareto front", X(mid.x) - 12, Y(mid.y) + 18, { color: NIGHT.mint, align: "right" });

    // three picks along the front, rendered as 3D wheels
    const picks = [pf[0], pf[Math.floor((pf.length - 1) / 2)], pf[pf.length - 1]];
    const names = ["stiff", "balanced", "aesthetic"];
    const gR = Math.min(26, h * 0.085);
    picks.forEach((a, k) => {
      const gx = clamp(X(a.x) + 46, L + gR + 6, R - gR - 6), gy = clamp(Y(a.y) - 40, T + gR + 4, B - gR - 18);
      ctx.strokeStyle = "rgba(232,238,242,0.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(a.x), Y(a.y)); ctx.lineTo(gx - gR * 0.7, gy + gR * 0.5); ctx.stroke();
      const spec = { n: a.p.n, hub: lerp(0.22, 0.28, a.p.hub * 3 % 1), w: 0.06 + 0.06 * (1 - k / 2), twist: a.p.twist, split: k === 2 ? 0.14 : a.p.split ? 0.12 : 0, rs: 0.5 };
      renderWheel3D(ctx, gx, gy, gR, spec, { tone: k === 1 ? [184, 191, 255] : [214, 218, 230], M: 30 });
      label(ctx, names[k], gx, gy + gR + 14, { align: "center", color: NIGHT.mint, size: 9 });
    });
  }

  window.Visuals = { ribbons, gallery: figGenerative, field: figField, ribs: figTopology, latent: figPreference };
})();
