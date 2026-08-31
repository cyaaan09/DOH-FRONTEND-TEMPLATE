/**
 * Redline "Gap scale · 6 · 8 · 12 · 14 · 16 · 22 · 24 · 32 — no 10, 18, or 20".
 *
 * The exclusions are the point: 10, 18 and 20 are the values a hand-measured
 * layout drifts into, and the scale exists to make that drift a validator
 * failure rather than a thing someone notices six screens later. Every
 * layout primitive validates its `gap` against this list.
 */
export const GAPS = [6, 8, 12, 14, 16, 22, 24, 32]

/** Reusable Vue prop validator. */
export const isGap = (value) => GAPS.includes(Number(value))

/** Shared `gap` prop definition — same shape in every primitive. */
export const gapProp = (fallback = 12) => ({
  type: [Number, String],
  default: fallback,
  validator: isGap,
})
