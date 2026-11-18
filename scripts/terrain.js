// Seaside college town ground. Sea to the south (+Z), shoreline near z = 55.
// Town square at the origin, college up the hill to the north, lighthouse headland east, bathhouse point west.
import { shore } from "builtin/terrain";
const SEA = 0;
const c01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);
function bump(x, z, cx, cz, r) { const d = Math.hypot(x - cx, z - cz) / r; return d >= 1 ? 0 : smooth(1 - d); }
export function heightAt(ctx) {
  const { x, z, noise, seedOffset } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 120, octaves: 3, seed: seedOffset(0) });
  // the coast wiggles a little along x
  const coast = 55 + 8 * noise.fbm2({ x, z: 0, frequency: 1 / 90, octaves: 2, seed: seedOffset(1) });
  // land: rises gently inland (north, -Z), a terrace for the college
  const inland = c01((coast - z) / 140);
  let h = 2.2 + 16 * smooth(inland) + n * 1.2 * inland;
  // beach apron and shallows: from 2.2 at the town edge down below the sea
  const beach = c01((z - (coast - 25)) / 45);
  h = h * (1 - beach) + (2.2 - 5.5 * beach) * beach;
  // lighthouse headland (east), rocky point (west)
  h = Math.max(h, 13 * bump(x, z, 82, 72, 38) + n * 2 * bump(x, z, 82, 72, 38));
  h = Math.max(h, 4.5 * bump(x, z, -68, 66, 22));
  // hills behind everything
  const far = c01((Math.hypot(x, z * 1.2) - 220) / 200);
  h += far * (40 + 30 * noise.fbm2({ x, z, frequency: 1 / 300, octaves: 2, seed: seedOffset(2) })) * c01((60 - z) / 60);
  return shore(h, SEA);
}
export function materialAt(ctx) {
  const { worldHeight, slope, noise, x, z, seedOffset } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 25, octaves: 3, seed: seedOffset(5) });
  const rock = c01((slope - 0.22 + n * 0.1) * 4);
  if (worldHeight < 1.4 + n * 0.6) return { sand: 1 - rock, rock };
  return { grass: 1 - rock, rock };
}
