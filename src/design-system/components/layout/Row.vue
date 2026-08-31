<script setup>
import { gapProp } from './gaps.js'

/**
 * Redline "Row · flex · align center · gap 12 default · wrap off — toolbars,
 * button pairs, label rows".
 *
 * Redline "Rule": a primitive sets direction, gap and alignment ONLY. It
 * carries no colour, border or padding of its own, so a screen is composed
 * rather than hand-measured. A test asserts that.
 */
defineProps({
  gap: gapProp(12),
  align: { type: String, default: 'center' },
  justify: { type: String, default: 'flex-start' },
  wrap: { type: Boolean, default: false },
})
</script>

<template>
  <div
    data-row
    class="ds-row"
    :style="{
      gap: `${gap}px`,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap ? 'wrap' : 'nowrap',
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-row {
  display: flex;
}
</style>
