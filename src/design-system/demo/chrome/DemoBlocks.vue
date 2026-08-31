<script setup>
defineProps({
  /**
   * The auto-fit track minimum. 268px is the page-wide default (§17.1); the
   * Selection controls card row uses 300px so that two cards, not three,
   * share the width (Appendix D.1).
   */
  min: { type: String, default: '268px' },
  /**
   * Set on a grid that CLOSES a card rather than opening it. Appendix D.1's
   * Selection controls is two stacked grids: the first opens the card at
   * pad `18px 24px 6px`, the second closes it at `6px 24px 22px`.
   */
  tail: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="demo-blocks px-card-x"
    :class="tail ? 'pt-1.5 pb-5.5' : 'pt-4.5 pb-1.5'"
    :style="{ '--demo-blocks-min': min }"
  >
    <slot />
  </div>
</template>

<style scoped>
/* Spec §17.1 — repeat(auto-fit, minmax(268px, 1fr)), gap 24px. Tailwind has
 * no utility for an auto-fit track list, so it is expressed here. The
 * minimum is a custom property so a section can widen the track without a
 * second grid-template-columns declaration competing with this one. */
.demo-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--demo-blocks-min, 268px), 1fr));
  gap: 24px;
}
</style>
