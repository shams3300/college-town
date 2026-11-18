// The world's doorway (world.config.yaml engine.behaviors): onArrive fires when a player enters
// this world (first join, rejoin, a link in from another world).
// Adults-only gate: every load in asks again. Only a yes/no flag is kept, no birth date, nothing personal.
export function onArrive(ctx, player) {
  player.state.ageOk = false
  player.state.ageNo = false
}

export function onLeave(ctx, player) {}
