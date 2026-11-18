// Plays the rig's idle loop forever, blinks, and talks softly now and then.
// state.idle tunes the idle ({ duration, breath, sway, hair }); state.talk { speak, duration } or false silences her.
// state.emotion: one of EMOTIONS (happy, sad, surprised, pouty, flustered, neutral).
// state.cycle: seconds per emotion; set, she steps through all five on her own (the test reel). state.label names a sign to write.
import { idle, blink, talk, emotion, emotionHold, EMOTIONS } from "./lib/rig2d-clips.js";
const REEL = ["happy", "sad", "surprised", "pouty", "flustered"];
export function onSpawn(ctx) {
  const s = ctx.self.state;
  ctx.self.anim.idle = { clip: idle(s.idle ?? {}), loop: true, weight: 1 };
  feel(ctx, s.emotion ?? "neutral", "neutral");
  if (s.cycle) ctx.after(s.cycle, "next");
}
// lay an emotion: the face bones ease from the last one, then hold; blink and talk carry its eyes and lips
function feel(ctx, to, from) {
  if (!EMOTIONS[to]) to = "neutral";
  const e = EMOTIONS[to], s = ctx.self.state;
  ctx.self.anim.emotion = { clip: emotion(to, from), loop: "once", weight: 1 };
  ctx.after(0.5, "hold", { to });
  ctx.self.anim.blink = { clip: blink({ ...(s.blink ?? {}), open: e.eye }), loop: true, weight: 1 };
  ctx.self.anim.talk = s.talk === false ? null : { clip: talk({ ...(s.talk ?? {}), biasU: e.lipU, biasL: e.lipL }), loop: true, weight: 1 };
  ctx.self.session.felt = to;
  if (s.emotion !== to) s.emotion = to;
  const sign = s.label && ctx.getObject(s.label);
  if (sign) sign.state.text = to;
}
export function hold(ctx, { to }) {
  if (ctx.self.session.felt === to) ctx.self.anim.emotion = { clip: emotionHold(to), loop: true, weight: 1 };
}
export function next(ctx) {
  const s = ctx.self.state, from = ctx.self.session.felt ?? s.emotion ?? "neutral";
  feel(ctx, REEL[(REEL.indexOf(from) + 1) % REEL.length], from);
  if (s.cycle) ctx.after(s.cycle, "next");
}
export function update(ctx) {
  // an emotion set from outside (a scene, a choice) eases in on its own
  const want = ctx.self.state.emotion;
  if (want && want !== ctx.self.session.felt) feel(ctx, want, ctx.self.session.felt ?? "neutral");
  ctx.sleep();
}
