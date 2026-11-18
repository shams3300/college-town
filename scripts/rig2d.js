// Live2D-style rig: one painted cutout stretched over a triangle grid, skinned to bones,
// so a breath, a head tilt or a hair swing BENDS the picture instead of sliding flat cards.
// params: texture (cutout png), width/height (m), cols/rows (grid), and the regions in picture
// space (u 0..1 left→right, v 0..1 top→bottom): headU, headV (face centre), neckV, waistV,
// faceHalfW (half the face width in u), hairEndV (where side hair ends).
// Front is −Z: the picture reads correctly from in front of the object.
// The rig's frame: width 1, height 1.5 (a 2:3 picture); size it with the object's scale.
const R = { width: 1, height: 1.5, headU: 0.47, headV: 0.22, neckV: 0.37, waistV: 0.78, faceHalfW: 0.13, hairEndV: 0.68,
  shoulderV: 0.42, shoulderLU: 0.2, shoulderRU: 0.82, torsoHalfU: 0.23, bustU: 0.5, bustV: 0.57, bustR: 0.13,
  strandV2: 0.46, strandV3: 0.58, lockOutW: 1.35,
  // the face, in picture space: each a centre and half-size (an ellipse); a lid closes toward its lower lash line
  eyeL: [0.395, 0.219, 0.052, 0.022], eyeR: [0.558, 0.181, 0.05, 0.022],
  // the lips: the line between them runs corner to corner (u, v); the inside of the mouth is a swatch
  // painted in the picture's empty top-left corner (u0, v0, u1, v1): teeth at its top, tongue at its foot
  lipLine: [0.476, 0.2875, 0.551, 0.2727],
  // the painted line where the lips meet, traced column by column (darkest pixel): the split follows it, not a straight cut
  lipCurve: [[0.476, 0.2875], [0.488, 0.287], [0.5, 0.2862], [0.51, 0.2832], [0.52, 0.2812], [0.53, 0.2788], [0.54, 0.2766], [0.551, 0.2727]], mouthSwatch: [0.004, 0.003, 0.029, 0.019],
  // the brows: each a stroke from its outer end to its inner end (u, v, u, v), half-thickness in v
  browL: [0.355, 0.197, 0.432, 0.18, 0.009], browR: [0.605, 0.142, 0.488, 0.168, 0.009],
  // the cheek pads under each eye (centre, half-size), lifted by a smile; the blush rides them
  cheekL: [0.405, 0.252, 0.04, 0.018], cheekR: [0.578, 0.216, 0.04, 0.018],
  blushSwatch: [0.955, 0.003, 0.995, 0.028], blushSize: [0.075, 0.032],
  earL: [0.383, 0.279, 0.011, 0.015], earR: [0.66, 0.238, 0.011, 0.02],
  face: [0.33, 0.7, 0.14, 0.31],
  // layers: 2 = the texture is an atlas, two pictures side by side: left the body with a bare painted
  // forehead (nothing hidden is missing), right the bangs alone. the bangs card floats in front of the face
  // over bangBox (u0, v0, u1, v1), weighted like the hair and head but never by eyes, brows, cheeks or lips.
  layers: 1, bangBox: [0.32, 0.06, 0.63, 0.3] }; // the box drawn with a fine grid so lids and lips bend cleanly
const P = (ctx) => ({ cols: 30, rows: 45, ...R, ...ctx.params, width: R.width, height: R.height });
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const BONES = ["root", "body", "chest", "head", "hairL", "hairR", "armL", "armR", "hem", "bust", "hairL2", "hairR2", "hairL3", "hairR3", "lockL", "lockR", "eyeL", "eyeR", "lipU", "lipL", "earL", "earR", "browL", "browR", "cornerL", "cornerR", "cheekL", "cheekR", "blushL", "blushR", "lidL", "lidR"];

export function skeleton() {
  const p = R;
  const X = (u) => (0.5 - u) * p.width, Y = (v) => (1 - v) * p.height;
  return {
    root: { pivot: [0, 0, 0] },
    body: { parent: "root", pivot: [0, Y(p.waistV), 0] },
    chest: { parent: "body", pivot: [0, Y((p.waistV + p.neckV) / 2), 0] },
    head: { parent: "chest", pivot: [X(p.headU), Y(p.neckV), 0] },
    hairL: { parent: "head", pivot: [X(p.headU - p.faceHalfW), Y(p.headV), 0] },
    hairR: { parent: "head", pivot: [X(p.headU + p.faceHalfW), Y(p.headV), 0] },
    armL: { parent: "chest", pivot: [X(p.shoulderLU), Y(p.shoulderV), 0] },
    armR: { parent: "chest", pivot: [X(p.shoulderRU), Y(p.shoulderV), 0] },
    hem: { parent: "body", pivot: [0, Y(p.waistV), 0] },
    bust: { parent: "chest", pivot: [X(p.bustU), Y(p.bustV), 0] },
    // each side's long hair is a chain of three, so a sway rolls down the curl
    hairL2: { parent: "hairL", pivot: [X(p.headU - p.faceHalfW * 1.4), Y(p.strandV2), 0] },
    hairL3: { parent: "hairL2", pivot: [X(p.headU - p.faceHalfW * 1.5), Y(p.strandV3), 0] },
    hairR2: { parent: "hairR", pivot: [X(p.headU + p.faceHalfW * 1.4), Y(p.strandV2), 0] },
    hairR3: { parent: "hairR2", pivot: [X(p.headU + p.faceHalfW * 1.5), Y(p.strandV3), 0] },
    // the front locks that frame her face, hung from the temples
    lockL: { parent: "head", pivot: [X(p.headU - p.faceHalfW * 0.9), Y(p.headV - 0.04), 0] },
    lockR: { parent: "head", pivot: [X(p.headU + p.faceHalfW * 0.9), Y(p.headV - 0.04), 0] },
    eyeL: { parent: "head", pivot: [X(p.eyeL[0]), Y(p.eyeL[1] + p.eyeL[3] * 0.55), 0] },
    eyeR: { parent: "head", pivot: [X(p.eyeR[0]), Y(p.eyeR[1] + p.eyeR[3] * 0.55), 0] },
    lipU: { parent: "head", pivot: [X((p.lipLine[0] + p.lipLine[2]) / 2), Y((p.lipLine[1] + p.lipLine[3]) / 2), 0] },
    lipL: { parent: "head", pivot: [X((p.lipLine[0] + p.lipLine[2]) / 2), Y((p.lipLine[1] + p.lipLine[3]) / 2), 0] },
    browL: { parent: "head", pivot: [X((p.browL[0] + p.browL[2]) / 2), Y((p.browL[1] + p.browL[3]) / 2), 0] },
    browR: { parent: "head", pivot: [X((p.browR[0] + p.browR[2]) / 2), Y((p.browR[1] + p.browR[3]) / 2), 0] },
    cornerL: { parent: "head", pivot: [X(p.lipLine[0]), Y(p.lipLine[1]), 0] },
    cornerR: { parent: "head", pivot: [X(p.lipLine[2]), Y(p.lipLine[3]), 0] },
    cheekL: { parent: "head", pivot: [X(p.cheekL[0]), Y(p.cheekL[1]), 0] },
    cheekR: { parent: "head", pivot: [X(p.cheekR[0]), Y(p.cheekR[1]), 0] },
    blushL: { parent: "cheekL", pivot: [X(p.cheekL[0]), Y(p.cheekL[1]), 0] },
    blushR: { parent: "cheekR", pivot: [X(p.cheekR[0]), Y(p.cheekR[1]), 0] },
    lidL: { parent: "head", pivot: [X(p.eyeL[0]), Y(p.eyeL[1]), 0] },
    lidR: { parent: "head", pivot: [X(p.eyeR[0]), Y(p.eyeR[1]), 0] },
    earL: { parent: "head", pivot: [X(p.earL[0]), Y(p.earL[1] - p.earL[3]), 0] },
    earR: { parent: "head", pivot: [X(p.earR[0]), Y(p.earR[1] - p.earR[3]), 0] },
  };
}

// how much of the picture around (u, v) is hair: chestnut pixels, read from params.mask
function hairFrac(p, u, v) {
  const m = p.mask; if (!m || !m.data) return 1;
  const max = 2 ** (m.depth || 8) - 1, rad = 0.02;
  let hit = 0, n = 0;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const x = Math.round((u + i * rad / 2) * (m.width - 1)), y = Math.round((v + j * rad / 2) * (m.height - 1));
    if (x < 0 || y < 0 || x >= m.width || y >= m.height) continue;
    const o = (y * m.width + x) * m.channels, r = m.data[o] / max * 255, g = m.data[o + 1] / max * 255, b = m.data[o + 2] / max * 255;
    const a = m.channels > 3 ? m.data[o + 3] / max : 1;
    n++; if (a > 0.3 && r > 95 && r < 200 && r - b > 45 && g < r - 15) hit++;
  }
  return n ? Math.min(1, (hit / n) * 1.6) : 0;
}

// how much of the picture around (u, v) is apron: the brown cloth and leather, never skin or the white shirt
function apronFrac(p, u, v) {
  const m = p.mask; if (!m || !m.data) return 0;
  const max = 2 ** (m.depth || 8) - 1, rad = 0.016;
  let hit = 0, n = 0;
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const x = Math.round((u + i * rad / 2) * (m.width - 1)), y = Math.round((v + j * rad / 2) * (m.height - 1));
    if (x < 0 || y < 0 || x >= m.width || y >= m.height) continue;
    const o = (y * m.width + x) * m.channels, r = m.data[o] / max, g = m.data[o + 1] / max, b = m.data[o + 2] / max;
    const a = m.channels > 3 ? m.data[o + 3] / max : 1;
    const lum = 0.3 * r + 0.59 * g + 0.11 * b;
    n++; if (a > 0.3 && lum < 0.5 && r >= g && g >= b - 0.03 && r - b > 0.06) hit++;
  }
  return n ? Math.min(1, (hit / n) * 1.5) : 0;
}

// the lips: how far (u, v) sits above or below the lip line, and how much each lip owns it.
// the middle parts most, the corners stay pinned; the lower lip drags the chin skin a little (the jaw).
function lipProfile(p, u) {
  const [u0, , u1] = p.lipLine, t = (u - u0) / (u1 - u0);
  return Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t + 0.04) / 1.08)))), 0.6);
}
function lipV(p, u) {
  const c = p.lipCurve;
  if (u <= c[0][0]) return c[0][1];
  for (let i = 1; i < c.length; i++) if (u <= c[i][0]) { const t = (u - c[i - 1][0]) / (c[i][0] - c[i - 1][0]); return c[i - 1][1] + (c[i][1] - c[i - 1][1]) * t; }
  return c[c.length - 1][1];
}
function lipAt(p, u, v) {
  const line = lipV(p, u), d = v - line, prof = lipProfile(p, u);
  return { up: d <= 0 ? prof * (1 - ss(0.004, 0.012, -d)) : 0, low: d > 0 ? prof * (1 - ss(0.007, 0.017, d)) : 0, prof };
}

// one pixel of the mask: is (u, v) itself hair? (chestnut, not the darker brow or lash lines)
function hairPx(p, u, v) {
  const m = p.mask; if (!m || !m.data) return 0;
  const max = 2 ** (m.depth || 8) - 1, x = Math.round(u * (m.width - 1)), y = Math.round(v * (m.height - 1));
  const o = (y * m.width + x) * m.channels, r = m.data[o] / max * 255, g = m.data[o + 1] / max * 255, b = m.data[o + 2] / max * 255;
  return r > 110 && r < 220 && r - b > 40 && g < r - 12 ? 1 : 0;
}
function weightsAt(p, u, v, noFace = false) {
  const du = u - p.headU;
  const side = ss(p.faceHalfW * 0.8, p.faceHalfW * 1.5, Math.abs(du)); // outside the face
  const hang = ss(p.headV - 0.05, p.hairEndV, v) * (1 - ss(p.hairEndV, p.hairEndV + 0.08, v));
  // the torso core (straps, buttons, apron) never counts as hair below the neck
  const core = ss(p.neckV, p.neckV + 0.06, v) * (1 - ss(0.25, 0.3, Math.abs(u - 0.5)));
  const hair = side * hang * 0.95 * hairFrac(p, u, v) * (1 - core);
  const rest = 1 - hair;
  const head = rest * ss(p.neckV + 0.03, p.neckV - 0.03, v);
  const torso = rest - head;
  const c = ss(p.waistV, p.neckV, v);
  // arms: the sleeves and forearms outside the torso, fading in below the shoulder
  const out = ss(p.torsoHalfU - 0.02, p.torsoHalfU + 0.05, Math.abs(u - 0.5)) * ss(p.shoulderV - 0.02, p.shoulderV + 0.08, v);
  // apron (bib, straps) inside the torso band: never the arm's, and the straps share the bib's lift
  const band = 1 - ss(0.26, 0.31, Math.abs(u - 0.5));
  const apron = apronFrac(p, u, v) * band * ss(p.neckV + 0.02, p.neckV + 0.06, v);
  const arm = torso * out * 0.9 * (1 - apron);
  // hem: the apron below the waist, more the lower it hangs
  const hemW = (torso - arm) * ss(p.waistV, 1, v) * 0.8;
  const bd = Math.hypot((u - p.bustU) / p.bustR, (v - p.bustV) / (p.bustR * 0.7));
  const bustCore = 1 - ss(0.5, 1, bd);
  const strapLift = apron * ss(p.bustV + 0.04, p.bustV, v) * 0.6; // straps above the bib ride its lift
  const bustW = (torso - arm - hemW) * Math.min(0.85, Math.max(bustCore * 0.85, strapLift));
  const t2 = torso - arm - hemW - bustW;
  // split the hair: locks hugging the face, the outer mass down a chain of three by height
  const lock = 1 - ss(p.faceHalfW * (p.lockOutW - 0.2), p.faceHalfW * (p.lockOutW + 0.15), Math.abs(du));
  const lockW = hair * lock, outer = hair - lockW;
  const s2 = ss(p.strandV2 - 0.04, p.strandV2 + 0.04, v), s3 = ss(p.strandV3 - 0.04, p.strandV3 + 0.05, v);
  const h1 = outer * (1 - s2), h2 = outer * s2 * (1 - s3), h3 = outer * s3;
  const L = du < 0;
  const w = { body: t2 * (1 - c), chest: t2 * c, head, hairL: L ? h1 : 0, hairR: L ? 0 : h1,
    hairL2: L ? h2 : 0, hairR2: L ? 0 : h2, hairL3: L ? h3 : 0, hairR3: L ? 0 : h3,
    lockL: L ? lockW : 0, lockR: L ? 0 : lockW,
    eyeL: 0, eyeR: 0, lipU: 0, lipL: 0, earL: 0, earR: 0, browL: 0, browR: 0, cornerL: 0, cornerR: 0, cheekL: 0, cheekR: 0,
    armL: u < 0.5 ? arm : 0, armR: u >= 0.5 ? arm : 0, hem: hemW, bust: bustW };
  // face features take their patch whole, fading out past their rim
  const blob = (e, inner, outer) => 1 - ss(inner, outer, Math.hypot((u - e[0]) / e[2], (v - e[1]) / e[3]));
  const lp = lipAt(p, u, v);
  // a brow: full weight along its stroke, fading a little above and below so the skin follows it
  const stroke = ([ua, va, ub, vb, th]) => {
    const dx = ub - ua, dy = vb - va, t = Math.min(1, Math.max(0, ((u - ua) * dx + (v - va) * dy) / (dx * dx + dy * dy)));
    const d = Math.hypot(u - (ua + dx * t), (v - (va + dy * t)) * 1.0);
    return 1 - ss(th, th * 2.6, d);
  };
  const corner = (cu, cv) => 1 - ss(0.35, 1.3, Math.hypot((u - cu) / 0.014, (v - cv) / 0.012));
  const f = { eyeL: blob(p.eyeL, 0.85, 1.5), eyeR: blob(p.eyeR, 0.85, 1.5), lipU: lp.up, lipL: lp.low,
    earL: 0, earR: 0, // the earrings tore the jaw where it meets the ear: they move again as their own cut layer
    browL: stroke(p.browL), browR: stroke(p.browR),
    cornerL: corner(p.lipLine[0], p.lipLine[1]), cornerR: corner(p.lipLine[2], p.lipLine[3]),
    cheekL: blob(p.cheekL, 0.3, 0.9) * 0.6, cheekR: blob(p.cheekR, 0.3, 0.9) * 0.6 };
  // (the hair over the brows rides the bangs card in front, so the brow keeps every one of its own pixels: a
  // per-pixel hair test split the brow, whose ink reads as hair, into a moving half and a still half)
  // the lips give their ends to the corners, so a smile curls the line instead of sliding it
  f.lipU *= 1 - Math.max(f.cornerL, f.cornerR); f.lipL *= 1 - Math.max(f.cornerL, f.cornerR);
  const fs = Math.min(1, Object.values(f).reduce((a, b) => a + b, 0));
  if (fs > 0 && !noFace) { for (const k in w) w[k] *= 1 - fs; for (const k in f) w[k] = f[k]; }
  const top = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const sum = top.reduce((s, [, x]) => s + x, 0) || 1;
  return top.map(([n, x]) => [BONES.indexOf(n), x / sum]);
}

export function geometry(ctx) {
  const p = P(ctx);
  const cols = ctx.lod >= 3 ? 10 : p.cols, rows = ctx.lod >= 3 ? 15 : p.rows;
  if (p.texture) ctx.albedo(p.texture);
  const uvs = [], joints = [], weights = [];
  const AU = p.layers === 2 ? 0.5 : 1; // atlas: the body picture is the left half
  const vert = (u, v, layer = 0, z = 0) => {
    uvs.push(layer ? 0.5 + u * AU : u * AU, 1 - v);
    for (const [j, w] of weightsAt(p, u, v, layer === 1).concat([[0, 0], [0, 0], [0, 0], [0, 0]]).slice(0, 4)) { joints.push(j); weights.push(w); }
    return [(0.5 - u) * p.width, (1 - v) * p.height, z];
  };
  // the grid lines: even, plus a fine mesh over the face box at close range
  const lines = (n, lo, hi, step, lo2, hi2, step2) => {
    const xs = Array.from({ length: n + 1 }, (_, i) => i / n);
    if (ctx.lod < 3) for (let x = lo; x < hi; x += step) xs.push(x);
    if (ctx.lod < 3) for (let x = lo2; x < hi2; x += step2) xs.push(x);
    return [...new Set(xs.map((x) => Math.round(x * 2000) / 2000))].sort((a, b) => a - b);
  };
  const U = lines(cols, p.face[0], p.face[1], 0.009, p.lipLine[0] - 0.012, p.lipLine[2] + 0.012, 0.004);
  const V = lines(rows, p.face[2], p.face[3], 0.005, Math.min(p.lipLine[1], p.lipLine[3]) - 0.012, Math.max(p.lipLine[1], p.lipLine[3]) + 0.03, 0.0025);
  const sw = p.mouthSwatch;
  for (let r = 0; r < V.length - 1; r++) for (let c = 0; c < U.length - 1; c++) {
    const u0 = U[c], u1 = U[c + 1], v0 = V[r], v1 = V[r + 1];
    if (u0 < sw[2] + 0.002 && v0 < sw[3] + 0.002) continue; // the swatch's corner is empty picture; never drawn flat
    if (u1 > p.blushSwatch[0] - 0.002 && v0 < p.blushSwatch[3] + 0.002) continue; // so is the blush's
    // seen from −Z: u grows toward −X, so this order winds CCW to the front
    const a = vert(u0, v0), b = vert(u0, v1), d = vert(u1, v1);
    ctx.tri(...a, ...b, ...d);
    const a2 = vert(u0, v0), d2 = vert(u1, v1), e = vert(u1, v0);
    ctx.tri(...a2, ...d2, ...e);
  }
  // the inside of the mouth: a strip hugging the lip line, zero-tall at rest, a hair in front of the face.
  // its top rides the upper lip, its foot the lower; parting the lips opens it like Live2D's masked interior.
  if (ctx.lod < 3) {
    const iU = BONES.indexOf("lipU"), iL = BONES.indexOf("lipL"), iH = BONES.indexOf("head"), N = 30;
    const [lu0, lv0, lu1, lv1] = p.lipLine;
    const raw = (i, low) => {
      const t = i / N, u = lu0 + (lu1 - lu0) * t, v = lipV(p, u), pr = lipProfile(p, u);
      uvs.push((sw[0] + (sw[2] - sw[0]) * t) * AU, 1 - (low ? sw[3] : sw[1]));
      joints.push(low ? iL : iU, iH, 0, 0); weights.push(pr, 1 - pr, 0, 0);
      return [(0.5 - u) * p.width, (1 - v) * p.height, -0.0015];
    };
    for (let i = 0; i < N; i++) {
      ctx.tri(...raw(i, false), ...raw(i, true), ...raw(i + 1, true));
      ctx.tri(...raw(i, false), ...raw(i + 1, true), ...raw(i + 1, false));
    }
  }
  // the blush: a hatched card on each cheek, tucked a hair BEHIND the face so it's hidden at rest;
  // the blush bones pull it forward through the skin (z −) and it shows. one card per cheek, whole.
  if (ctx.lod < 4 && p.blush) { // off: a card behind the face showed through as speckles. a painted blush layer replaces it
    const bs = p.blushSwatch, [bw, bh] = p.blushSize;
    for (const [name, c] of [["blushL", p.cheekL], ["blushR", p.cheekR]]) {
      const j = BONES.indexOf(name);
      const at = (su, sv) => {
        uvs.push((bs[0] + (bs[2] - bs[0]) * su) * AU, 1 - (bs[1] + (bs[3] - bs[1]) * sv));
        joints.push(j, 0, 0, 0); weights.push(1, 0, 0, 0);
        return [(0.5 - (c[0] - bw / 2 + bw * su)) * p.width, (1 - (c[1] + 0.006 - bh / 2 + bh * sv)) * p.height, 0.004];
      };
      ctx.tri(...at(0, 0), ...at(0, 1), ...at(1, 1));
      ctx.tri(...at(0, 0), ...at(1, 1), ...at(1, 0));
    }
  }
  // the closed lids: painted closed-eye patches in the atlas's right half (picture v + 0.5), one oval card per eye
  // tucked behind the face; at the bottom of a blink the lid bone pulls it forward over the open eye
  if (p.layers === 2) {
    for (const [name, e] of [["lidL", p.eyeL], ["lidR", p.eyeR]]) {
      const j = BONES.indexOf(name), N = 16, cu = e[0], cv = e[1] + 0.006, hu = e[2] * 1.45, hv = e[3] * 1.55;
      const at = (k) => {
        const a = (k / N) * Math.PI * 2, u = k < 0 ? cu : cu + Math.cos(a) * hu, v = k < 0 ? cv : cv + Math.sin(a) * hv;
        uvs.push(0.5 + u * 0.5, 1 - (v + 0.5) * 1); joints.push(j, 0, 0, 0); weights.push(1, 0, 0, 0);
        return [(0.5 - u) * p.width, (1 - v) * p.height, 0.004];
      };
      for (let k = 0; k < N; k++) ctx.tri(...at(-1), ...at(k + 1), ...at(k));
    }
  }
  // the blush: painted rosy cheeks (atlas right half, picture v + 0.6), an oval card per cheek tucked behind the
  // face; the blush bones pull it forward over the plain cheek. hair and eyes are cut out of it, so it only tints skin
  if (p.layers === 2) {
    for (const [name, c] of [["blushL", p.cheekL], ["blushR", p.cheekR]]) {
      const j = BONES.indexOf(name), N = 20, hu = 0.065, hv = 0.032;
      const at = (k) => {
        const a = (k / N) * Math.PI * 2, u = k < 0 ? c[0] : c[0] + Math.cos(a) * hu, v = k < 0 ? c[1] : c[1] + Math.sin(a) * hv;
        uvs.push(0.5 + u * 0.5, 1 - (v + 0.6)); joints.push(j, 0, 0, 0); weights.push(1, 0, 0, 0);
        return [(0.5 - u) * p.width, (1 - v) * p.height, 0.004];
      };
      for (let k = 0; k < N; k++) ctx.tri(...at(-1), ...at(k + 1), ...at(k));
    }
  }
  // the bangs card: the same grid lines over bangBox, a hair in front of everything on the face
  if (p.layers === 2) {
    const [b0, c0, b1, c1] = p.bangBox, BU = U.filter((x) => x >= b0 && x <= b1), BV = V.filter((y) => y >= c0 && y <= c1);
    for (let r = 0; r < BV.length - 1; r++) for (let c = 0; c < BU.length - 1; c++) {
      const u0 = BU[c], u1 = BU[c + 1], v0 = BV[r], v1 = BV[r + 1], Z = -0.007;
      const a = vert(u0, v0, 1, Z), b = vert(u0, v1, 1, Z), d = vert(u1, v1, 1, Z);
      ctx.tri(...a, ...b, ...d);
      const a2 = vert(u0, v0, 1, Z), d2 = vert(u1, v1, 1, Z), e = vert(u1, v0, 1, Z);
      ctx.tri(...a2, ...d2, ...e);
    }
  }
  return { uvs, joints, weights };
}

export function collider() { return null; }
