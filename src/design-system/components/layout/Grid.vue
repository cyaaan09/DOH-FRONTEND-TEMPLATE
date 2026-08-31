<script setup>
import { isGap } from './gaps.js'

/**
 * Redline "Grid · repeat(12, minmax(0,1fr)) · gap 16 row / 24 col · children
 * span 4 / 6 / 8 / 12, floor 172px" — the form grid.
 *
 * minmax(0,1fr), not 1fr: a bare 1fr track has an `auto` minimum, so one long
 * unbroken string widens the whole grid instead of ellipsising. That is the
 * same failure the "Flex children · min-width: 0" redline names for flex, and
 * it is baked in here rather than left to the caller.
 *
 * Children carry their span with `GridItem`; the redline's floor keeps a
 * 4-span cell from collapsing below a usable field width on a narrow card.
 */
defineProps({
  cols: { type: Number, default: 12 },
  /** Row gap. */
  gapY: { type: [Number, String], default: 16, validator: isGap },
  /** Column gap — wider than the row gap, per the redline. */
  gapX: { type: [Number, String], default: 24, validator: isGap },
})
</script>

<template>
  <div data-grid class="ds-grid" :style="{ gap: `${gapY}px ${gapX}px`, '--ds-grid-cols': cols }">
    <slot />
  </div>
</template>

<style scoped>
.ds-grid {
  display: grid;
  grid-template-columns: repeat(var(--ds-grid-cols, 12), minmax(0, 1fr));
  /* Establishes the query container GridItem's floor measures against. A
     Grid sits inside cards of different widths, so the floor has to react to
     ITS width, not the viewport's. */
  container-type: inline-size;
  container-name: ds-grid;
}
</style>
