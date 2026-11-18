// Motion library for scripts/rig2d.js rigs: Live2D's "parameters" as looping clips.
// Rotation values are euler XYZ degrees as offsets from rest; roll (Z) tilts in the picture plane.
const loop = (n, k) => Array.from({ length: n + 1 }, (_, i) => k(i / n));
const T = (n, dur) => loop(n, (t) => t * dur);
const S = (t, phase = 0, cycles = 1) => Math.sin((t * cycles + phase) * Math.PI * 2);
const rot = (n, f) => loop(n, (t) => [0, 0, f(t)]).flat();

export function idle({ duration = 4, breath = 1, sway = 1, hair = 1 } = {}) {
  const n = 32, times = T(n, duration);
  return {
    name: `rig2d-idle5-${duration}-${breath}-${sway}-${hair}`, duration,
    tracks: [
      { bone: "chest", prop: "position", times, values: loop(n, (t) => [0, 0.008 * breath * (S(t) + 1) / 2, 0]).flat() },
      { bone: "chest", prop: "scale", times, values: loop(n, (t) => [1 + 0.008 * breath * S(t), 1 + 0.014 * breath * S(t), 1]).flat() },
      { bone: "body", prop: "rotation", times, values: rot(n, (t) => 0.6 * sway * S(t, 0.1)) },
      { bone: "head", prop: "rotation", times, values: rot(n, (t) => 2.2 * sway * S(t, 0.25) + 0.6 * S(t, 0, 2)) },
      { bone: "armL", prop: "rotation", times, values: rot(n, (t) => -0.4 + 1.2 * breath * (S(t, 0.02) + 1) / 2 * -1 + 0.4 + 0.3 * S(t, 0.2, 3)) },
      { bone: "armR", prop: "rotation", times, values: rot(n, (t) => 1.2 * breath * (S(t, 0.02) + 1) / 2 - 0.3 * S(t, 0.5, 3)) },
      { bone: "bust", prop: "scale", times, values: loop(n, (t) => { const b = (S(t) + 1) / 2; return [1 - 0.035 * breath * b, 1 + 0.03 * breath * b, 1]; }).flat() },
      { bone: "bust", prop: "position", times, values: loop(n, (t) => [0, 0.01 * breath * (S(t, -0.03) + 1) / 2, 0]).flat() },
      { bone: "hem", prop: "rotation", times, values: rot(n, (t) => 0.8 * sway * S(t, 0.3) + 0.3 * S(t, 0.1, 2)) },
      { bone: "hairL", prop: "rotation", times, values: rot(n, (t) => -3 * hair * S(t, 0.12) + 1 * S(t, 0.3, 2)) },
      { bone: "hairR", prop: "rotation", times, values: rot(n, (t) => -3 * hair * S(t, 0.17) - 1 * S(t, 0.4, 2)) },
      // earrings: little pendulums, a beat behind the head
      { bone: "earL", prop: "rotation", times, values: rot(n, (t) => -4 * sway * S(t, 0.12) + 1.5 * S(t, 0.3, 4)) },
      { bone: "earR", prop: "rotation", times, values: rot(n, (t) => -4 * sway * S(t, 0.14) - 1.5 * S(t, 0.55, 4)) },
      // the chain lags a beat per link and swings wider toward the tip: hair, not cardboard
      { bone: "hairL2", prop: "rotation", times, values: rot(n, (t) => -2.5 * hair * S(t, 0.04) + 0.8 * S(t, 0.2, 3)) },
      { bone: "hairL3", prop: "rotation", times, values: rot(n, (t) => -3.5 * hair * S(t, -0.06) + 1.2 * S(t, 0.1, 3)) },
      { bone: "hairR2", prop: "rotation", times, values: rot(n, (t) => -2.5 * hair * S(t, 0.09) - 0.8 * S(t, 0.35, 3)) },
      { bone: "hairR3", prop: "rotation", times, values: rot(n, (t) => -3.5 * hair * S(t, -0.01) - 1.2 * S(t, 0.25, 3)) },
      { bone: "lockL", prop: "rotation", times, values: rot(n, (t) => -2 * hair * S(t, 0.05) + 1.4 * S(t, 0.6, 2)) },
      { bone: "lockR", prop: "rotation", times, values: rot(n, (t) => -2 * hair * S(t, 0.1) - 1.4 * S(t, 0.15, 2)) },
    ],
  };
}

export function nod({ duration = 1.2 } = {}) {
  const n = 24, times = T(n, duration);
  const bump = (t) => Math.sin(Math.min(1, t * 1.6) * Math.PI);
  return {
    name: `rig2d-nod3-${duration}`, duration,
    tracks: [
      { bone: "head", prop: "position", times, values: loop(n, (t) => [0, -0.02 * bump(t), 0]).flat() },
      { bone: "head", prop: "rotation", times, values: rot(n, (t) => 3 * bump(t)) },
      { bone: "hairL", prop: "rotation", times, values: rot(n, (t) => -4 * bump(Math.max(0, t - 0.08))) },
      { bone: "hairR", prop: "rotation", times, values: rot(n, (t) => -4 * bump(Math.max(0, t - 0.1))) },
      { bone: "hairL3", prop: "rotation", times, values: rot(n, (t) => -5 * bump(Math.max(0, t - 0.18))) },
      { bone: "hairR3", prop: "rotation", times, values: rot(n, (t) => -5 * bump(Math.max(0, t - 0.2))) },
      { bone: "earL", prop: "rotation", times, values: rot(n, (t) => -7 * bump(Math.max(0, t - 0.15)) * Math.cos(t * 9)) },
      { bone: "earR", prop: "rotation", times, values: rot(n, (t) => -7 * bump(Math.max(0, t - 0.15)) * Math.cos(t * 9)) },
      { bone: "lockL", prop: "rotation", times, values: rot(n, (t) => 3 * bump(Math.max(0, t - 0.12))) },
      { bone: "lockR", prop: "rotation", times, values: rot(n, (t) => -3 * bump(Math.max(0, t - 0.12))) },
    ],
  };
}

// blink: open most of the loop, a quick close and open (and a second, softer one now and then)
export function blink({ duration = 4.3, double = true, open = 1 } = {}) {
  const lid = (t) => {
    const k = (c, w) => Math.max(0, 1 - Math.abs(t * duration - c) / w);
    return Math.max(k(1.2, 0.09), double ? k(1.45, 0.08) * 0.85 : 0);
  };
  // the open eye dips a little (the lid starting down), then the painted closed lid covers it at the bottom
  const times = [], vals = [], lidZ = [];
  for (let i = 0; i <= 172; i++) {
    const t = i / 172, l = lid(t); times.push(t * duration);
    vals.push(1, 1, 1); // the open eye never squashes (it dragged the hair over it); the painted lid does the blink
    lidZ.push(0, 0, l > 0.5 ? -0.008 : 0);
  }
  return { name: `rig2d-blink4-${duration}-${double}-${open}`, duration,
    tracks: [{ bone: "eyeL", prop: "scale", times, values: vals }, { bone: "eyeR", prop: "scale", times, values: vals },
      { bone: "lidL", prop: "position", times, values: lidZ }, { bone: "lidR", prop: "position", times, values: lidZ }] };
}

// talk: Live2D's MouthOpenY as soft syllables for `speak` seconds, then the lips rest, parted a breath.
// the lower lip and chin drop, the upper lip lifts a little; some syllables barely part, some open wide.
export function talk({ duration = 7, speak = 3, open = 1, biasU = 0, biasL = 0 } = {}) {
  const n = 210, times = [], up = [], low = [];
  const syl = (t) => {
    const k = Math.floor(t * 5.2), f = t * 5.2 - k;              // ~5 syllables a second
    const size = [0.35, 0.9, 0.55, 0.2, 1, 0.45, 0.7, 0.3][k % 8]; // each one its own height
    return size * Math.pow(Math.sin(Math.PI * f), 1.4);
  };
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * duration; times.push(t);
    const env = t < speak ? Math.min(1, t / 0.15, (speak - t) / 0.2) : 0;
    const o = Math.max(0, env * syl(t)) * open;
    low.push(0, biasL - 0.013 * o, 0); up.push(0, biasU + 0.0025 * o, 0);
  }
  return { name: `rig2d-talk3-${duration}-${speak}-${open}-${biasU}-${biasL}`, duration,
    tracks: [{ bone: "lipL", prop: "position", times, values: low }, { bone: "lipU", prop: "position", times, values: up }] };
}

// emotions: Live2D's expression files. each is a pose of the face bones as offsets from rest:
// brows (y lift, inner-end lift in degrees, x pinch toward the nose), mouth corners (y, out),
// cheeks (y), eye opening (lid scale), lips (y), blush (0..1). numbers are my picks, tuned by eye.
export const EMOTIONS = {
  neutral:   { brow: 0,      inner: 0,  pinch: 0,     corner: 0,      out: 0,      cheek: 0,     eye: 1,    lipU: 0,      lipL: 0,      blush: 0 },
  happy:     { brow: 0.004,  inner: 2,  pinch: 0,     corner: 0.007,  out: 0.003,  cheek: 0.005, eye: 0.8,  lipU: 0,      lipL: 0,      blush: 0 },
  sad:       { brow: 0.002,  inner: 11, pinch: 0.003, corner: -0.006, out: -0.001, cheek: 0,     eye: 0.86, lipU: 0,      lipL: 0.001,  blush: 0 },
  surprised: { brow: 0.013,  inner: 3,  pinch: 0,     corner: 0.001,  out: -0.005, cheek: 0,     eye: 1.18, lipU: 0.003,  lipL: -0.013, blush: 0 },
  pouty:     { brow: -0.004, inner: -9, pinch: 0.004, corner: -0.003, out: -0.006, cheek: 0.002, eye: 0.84, lipU: -0.001, lipL: 0.002,  blush: 0.4 },
  flustered: { brow: 0.004,  inner: 8,  pinch: 0.002, corner: 0.003,  out: -0.002, cheek: 0.003, eye: 0.88, lipU: 0,      lipL: -0.003, blush: 1 },
};
const poseTracks = (e) => {
  // browL is the picture's left brow: its inner end lies toward −x, so an inner lift is a negative roll
  return {
    browL: { position: [-e.pinch * 1.5, e.brow * 1.6, 0], rotation: [0, 0, -e.inner * 1.4] },
    browR: { position: [e.pinch * 1.5, e.brow * 1.6, 0], rotation: [0, 0, e.inner * 1.4] },
    cornerL: { position: [e.out, e.corner, 0] },
    cornerR: { position: [-e.out, e.corner, 0] },
    cheekL: { position: [0, 0, 0] }, cheekR: { position: [0, 0, 0] },
    blushL: { position: [0, 0, -0.009 * e.blush] }, blushR: { position: [0, 0, -0.009 * e.blush] },
  };
};
const REST = { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
// emotion: eases the brows, corners, cheeks and blush from one pose to the next (play once), then
// emotionHold keeps it. these bones belong to emotions alone; eye opening rides blink({ open }) and
// the lips ride talk({ biasU, biasL }), so every channel owns its own bones and nothing fights.
export function emotionHold(to = "neutral") {
  const B = poseTracks(EMOTIONS[to] ?? EMOTIONS.neutral), tracks = [];
  for (const bone in B) for (const prop in B[bone]) tracks.push({ bone, prop, times: [0, 1], values: [...B[bone][prop], ...B[bone][prop]] });
  return { name: `rig2d-emohold3-${to}`, duration: 1, tracks };
}
export function emotion(to = "happy", from = "neutral", { ease = 0.45, hold = 0.5 } = {}) {
  const A = poseTracks(EMOTIONS[from] ?? EMOTIONS.neutral), B = poseTracks(EMOTIONS[to] ?? EMOTIONS.neutral);
  const n = 10, times = [];
  for (let i = 0; i <= n; i++) times.push((i / n) * ease);
  times.push(ease + hold);
  const k = (t) => t * t * (3 - 2 * t);
  const tracks = [];
  for (const bone in B) for (const prop in B[bone]) {
    const a = A[bone][prop], b = B[bone][prop], values = [];
    for (let i = 0; i <= n; i++) values.push(...a.map((x, j) => x + (b[j] - x) * k(i / n)));
    values.push(...b);
    tracks.push({ bone, prop, times, values });
  }
  return { name: `rig2d-emo5-${from}-${to}-${ease}`, duration: ease + hold, tracks };
}
