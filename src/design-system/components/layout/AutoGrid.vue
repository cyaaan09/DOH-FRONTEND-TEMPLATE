<script setup>
import { gapProp } from './gaps.js'

/**
 * Redline "AutoGrid · repeat(auto-fit, minmax(min,1fr)) · gap 12 · min 190px
 * stats, 240–300px panels". Reflows without a media query, which is why
 * every stat and panel grid on the page is one of these.
 */
defineProps({
  /** The auto-fit track minimum. 190px for stat cards, 240–300px for panels. */
  min: { type: String, default: '240px' },
  gap: gapProp(12),
})
</script>

<template>
  <div data-auto-grid class="ds-autogrid" :style="{ gap: `${gap}px`, '--ds-autogrid-min': min }">
    <slot />
  </div>
</template>

<style scoped>
.ds-autogrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--ds-autogrid-min, 240px), 1fr));
}
</style>
