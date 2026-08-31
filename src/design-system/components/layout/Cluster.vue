<script setup>
import { gapProp } from './gaps.js'

/**
 * Redline "Cluster · Row with wrap on · gap 7–8 — chips, tags, filter pills,
 * service lists". A group whose COUNT you do not control: it must wrap, and
 * the caller must not have to remember to say so.
 *
 * The redline gives 7–8 rather than one value because the Chips group settles
 * it per context (7px tone rows, 8px filter rows) — 8 is the scale value and
 * the default; ChipGroup owns the 7px case.
 */
defineProps({
  gap: gapProp(8),
  align: { type: String, default: 'center' },
})
</script>

<template>
  <div data-cluster class="ds-cluster" :style="{ gap: `${gap}px`, alignItems: align }">
    <slot />
  </div>
</template>

<style scoped>
.ds-cluster {
  display: flex;
  flex-wrap: wrap;
}
</style>
