// A first-person camera on the declared `look` contract (templates/camera.js#camera:
// orientation.source "look"): the engine integrates the mouse at display rate with the rig's
// sensitivity / minPitch / maxPitch and owns the presented facing: read it back as ctx.self.view.
// The rig owns the EYE: every tick the camera sits at your eyes (at the body's drawn height), on a seat
// too, and faces where the view looks, so the camera's own row stays honest for everything that
// reads it (the audio listener, god-mode entry at the play camera). Numbers live in
// lib/data/camera.yml.
// Hiding your own body is THIS rig's decision (ctx.self.hideLocalPlayer: the rig's layer, which
// dies with the rig), never a flag on the camera def. A rewrite that never names it shows the body
// again.
import CAMERA from './lib/data/camera.yml'

const RAD_TO_DEG = 180 / Math.PI
// The body the eye height is for: camera.yml's eyeHeight is the eye on a body drawn 1.8 m tall.
const BODY_HEIGHT = 1.8

export function finiteNumber(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

// Seated on the ride: your body hangs under it, on the ride itself or on one of its parts.
function seatedOn(player, ride) {
  for (let p = player?.parent; p; p = p.parent) if (p.id === ride.id) return true
  return false
}

export function update(ctx, dt) {
  // The eye sits inside the body, so the body is not drawn for its owner (everyone else still sees it).
  ctx.self.hideLocalPlayer = true

  const target = ctx.self.target
  if (!target) return

  // While you drive, the target is the ride (a kart, a horse, a ship). Seated on it, the eye is your
  // own on the seat: the ride's feet sit under the whole ride, so an eye there is inside anything
  // taller than you.
  const seated = seatedOn(ctx.player, target) ? ctx.player : null
  const body = seated ?? target
  // Your body's height as drawn, along its own up (its model's own size, its fit and every parent's
  // scale), so a ride that rolls does not move the eye. A playing clip never changes this height: the box
  // is the model's own, so a walk poses the model and leaves the box and the eye where they are. A thing
  // you drive and do not sit on keeps its scale.
  const height = body.id === ctx.player?.id ? 2 * body.bounds?.obb.halfExtents.y : undefined
  const eyeHeight = finiteNumber(CAMERA.eyeHeight, 1.6) * (height > 0 ? height / BODY_HEIGHT : finiteNumber(body.effectiveScale?.y, 1))
  const pos = seated ? seated.worldFeetPosition : target.feetPosition
  ctx.self.feetPosition = { x: pos.x, y: pos.y + eyeHeight, z: pos.z }

  // The presented facing (radians) as the one rotation grammar (degrees): undefined before the first frame.
  const view = ctx.self.view
  if (view) ctx.self.rotation = { yaw: view.yaw * RAD_TO_DEG, pitch: view.pitch * RAD_TO_DEG }
}
