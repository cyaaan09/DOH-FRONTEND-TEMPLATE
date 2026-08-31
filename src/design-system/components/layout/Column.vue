<script setup>
import { gapProp } from './gaps.js'

/**
 * Redline "Column · flex column · align stretch · gap 12 default — stacked
 * fields, card bodies". The workhorse of the system.
 */
defineProps({
  gap: gapProp(12),
  align: { type: String, default: 'stretch' },
})
</script>

<template>
  <div data-column class="ds-column" :style="{ gap: `${gap}px`, alignItems: align }">
    <slot />
  </div>
</template>

<style scoped>
.ds-column {
  display: flex;
  flex-direction: column;
}
</style>
