import { FLOOR_H } from "./rooms.config"

// Geometry of the atrium staircase (world/Stairs.tsx), shared with the lobby's
// railing gaps (world/Lobby.tsx). Stair-local frame: flight 1 climbs +x along
// z < 0, flight 2 climbs back -x along z > 0; both ends sit at x = X0.

export const RISE = FLOOR_H / 2 // per flight
export const X0 = -3.3 // flight 1 foot / flight 2 head
export const X1 = 2.3 // flights' landing end
export const X2 = 3.3 // landing far edge
export const RUN = X1 - X0
export const W = 1.6 // flight width
export const Z_IN = 0.1 // flights start this far from the spine's center
export const Z_OUT = Z_IN + W
export const STEPS = 14
export const SLOPE = Math.atan2(RISE, RUN)
export const RAMP_LEN = Math.hypot(RUN, RISE)
export const RAMP_T = 0.25 // ramp slab thickness
export const RAIL_H = 0.95
/** The atrium edge the pads reach under; Lobby.tsx cuts the hole at ATRIUM_R. */
export const PAD_X = -4.4

/** Stair-local point (x, z) of each end, for the railing gaps in Lobby.tsx. */
export const STAIR_ARRIVAL = { x: X0, zMin: Z_IN, zMax: Z_OUT } // flight 2 head, on floor from + 1
export const STAIR_DEPARTURE = { x: X0, zMin: -Z_OUT, zMax: -Z_IN } // flight 1 foot, on floor from

/** The turn of the staircase leaving `floor`: local -x (the foot) points to +z on the ground floor. */
export const stairTurn = (floor: number) => Math.PI / 2 + (floor % 2) * Math.PI
