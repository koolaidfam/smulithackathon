/**
 * Where each node was last drawn on screen, in stage pixels.
 *
 * The cloud writes to this every frame. The isolated view reads it once, so a
 * node can start the transition exactly where the eye last saw it rather than
 * appearing from nowhere. Both views share the same stage box, so the
 * coordinates are directly comparable.
 */
export const lastScreen = new Map<string, { x: number; y: number }>();
