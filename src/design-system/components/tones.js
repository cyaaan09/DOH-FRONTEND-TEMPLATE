/**
 * Shared six-tone vocabulary consumed by every tone-bearing component
 * (Chip, Notice, and — per spec — Phase 3 additions). Centralising the tone
 * list and its foreground colour means a new tone, or a rename, is a
 * one-place edit instead of one edit per component's hardcoded table.
 *
 * Each component still owns its own background/border/pill class mapping
 * where that genuinely differs (Chip's filled tint vs. Notice's near-white
 * surface with an outlined pill) — only the part that was byte-for-byte
 * identical across components is extracted here.
 */

/** Valid tone names, in display order. Reused as a Vue prop `validator`. */
export const TONES = ['neutral', 'green', 'amber', 'red', 'blue', 'violet']

/** The tone every tone-bearing component falls back to for an unknown value. */
export const DEFAULT_TONE = 'neutral'

// The text/foreground utility for each tone. Identical in Chip's fill (tint
// background + this text colour) and in Notice's pill (this text colour +
// an outline) — the one piece of the six-tone table that was truly
// duplicated verbatim rather than merely parallel.
export const TONE_TEXT = {
  neutral: 'text-ink-600',
  green: 'text-green-text',
  amber: 'text-amber-text',
  red: 'text-red-700',
  blue: 'text-blue-700',
  violet: 'text-violet-700',
}
