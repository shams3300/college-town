// The HUD. First thing on every load: the adults-only question, over the live world.
// The answer is a yes/no flag on the player's own state, nothing else is asked or kept.
// Until "yes", the body stands still (scripts/player.js reads player.state.ageOk).
// A solid mosaic of grey tiles: fully opaque, so nothing of the world shows behind the question.
const MOSAIC = (() => {
  const greys = ['#0a0a0c', '#16161a', '#232328', '#2e2e34', '#3a3a41', '#4a4a52']
  let t = ''
  for (let i = 0; i < 24 * 16; i++) t += `<div style="background:${greys[(i * 7919 + (i >> 3) * 104729) % 6]}"></div>`
  return `<div style="position:fixed;inset:0;display:grid;grid-template-columns:repeat(24,1fr);grid-template-rows:repeat(16,1fr);pointer-events:auto">${t}</div>`
})()

export default function render(ctx, player) {
  const s = player.state ?? {}
  if (s.ageOk) return ''
  if (s.ageNo) {
    return MOSAIC + `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:0 64px;box-sizing:border-box;background:transparent;pointer-events:auto">
      <div style="max-width:420px;padding:20px 22px;background:#0a0a0c;border:2px solid #4a4a52;color:#e6e6ea;text-align:center">
        <div style="font-size:28px;color:#e2b400;margin-bottom:12px">ADULTS ONLY</div>
        <div style="font-size:18px;line-height:1.4;margin-bottom:20px">this game is for players 18 and over.<br>you can leave any time from the menu on the right.</div>
        <button onclick="sendAction('ageBack')" style="padding:8px 18px;background:#4a4a52;color:#e6e6ea;border:0;font-size:16px;cursor:pointer">back</button>
      </div></div>`
  }
  return MOSAIC + `<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:0 64px;box-sizing:border-box;background:transparent;pointer-events:auto">
    <div style="max-width:420px;padding:20px 22px;background:#0a0a0c;border:2px solid #e2b400;color:#e6e6ea;text-align:center">
      <div style="font-size:30px;color:#e2b400;margin-bottom:14px">Adults only / 18</div>
      <div style="font-size:22px;line-height:1.3;margin-bottom:22px">Are you 18 years of age or older?</div>
      <div style="display:flex;gap:14px;justify-content:center">
        <button onclick="sendAction('ageYes')" style="padding:10px 28px;background:#e2b400;color:#0a0a0c;border:0;font-size:20px;cursor:pointer">YES</button>
        <button onclick="sendAction('ageNo')" style="padding:10px 28px;background:#4a4a52;color:#e6e6ea;border:0;font-size:20px;cursor:pointer">NO</button>
      </div>
      <div style="margin-top:18px;font-size:11px;line-height:1.4;color:#9a9aa3;text-align:left">This game contains visually graphic or explicit content and nudity. You must be at least 18 years old to enter. By clicking yes you agree that you are 18+.<br><br>All characters, models, performers, and visual assets depicted in this material are 18 years of age or older. Any resemblance to real persons, living or dead, is purely coincidental unless otherwise stated.<br><br>U.S. Recordkeeping Rules: Under 18 U.S.C. §§ 2257–2257A, producers of visual depictions of actual or simulated explicit conduct must verify and meet labeling and recordkeeping rules.</div>
      </div></div>`
}
