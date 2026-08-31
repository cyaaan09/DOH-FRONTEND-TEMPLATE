<script setup>
// Appendix D.1 — the section-body grid is NOT one shared treatment. Every
// section the audit checked runs its own track minimum, gap and vertical
// padding, so those three are props rather than the single §17.1 default the
// page was built on. Each arrives as a custom property, which keeps exactly
// one declaration per CSS property: a second grid-template-columns or gap
// from a consumer class is this codebase's recurring defect.
defineProps({
  /** auto-fit track minimum. 268px = §17.1's default (Selection controls row 1). */
  min: { type: String, default: '268px' },
  /** Grid gap; sections with a tighter row rhythm pass `20px 24px`. */
  gap: { type: String, default: '24px' },
  /** Top padding. The horizontal 24px stays on the --pad-card-x token. */
  pt: { type: String, default: '18px' },
  /** Bottom padding — 6px when another wrapper follows, 22-24px when this closes the card. */
  pb: { type: String, default: '6px' },
  /** Appendix D.1's Dropdowns grid sets align-items: start so short cells don't stretch. */
  alignStart: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="demo-blocks px-card-x"
    :class="{ 'items-start': alignStart }"
    :style="{ '--db-min': min, '--db-gap': gap, '--db-pt': pt, '--db-pb': pb }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* Spec §17.1 — repeat(auto-fit, minmax(<min>, 1fr)). Tailwind has no utility
 * for an auto-fit track list, so it is expressed here. */
.demo-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(var(--db-min, 268px), 100%), 1fr));
  gap: var(--db-gap, 24px);
  padding-top: var(--db-pt, 18px);
  padding-bottom: var(--db-pb, 6px);
}
</style>
