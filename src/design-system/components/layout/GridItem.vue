<script setup>
/**
 * A `Grid` child and its span. The redline names the spans ("children span
 * 4 / 6 / 8 / 12, floor 172px") but not a component, because the source is a
 * static document — something has to carry the value, and a prop keeps it
 * out of the caller's class strings.
 *
 * Below the floor the cell drops to the full width rather than shrinking
 * past a usable field: `min-width: 172px` alone would overflow the track.
 */
defineProps({
  span: { type: Number, default: 12, validator: (v) => [3, 4, 6, 8, 12].includes(v) },
})
</script>

<template>
  <div data-grid-item class="ds-grid-item" :style="{ '--ds-span': span }">
    <slot />
  </div>
</template>

<style scoped>
.ds-grid-item {
  grid-column: span var(--ds-span, 12);
  min-width: 0;
}

/* Redline "floor 172px" — under it the cell takes the whole row rather than
   squeezing a 38px field into something unusable.
   Queries the GRID, not the item: an item queried against itself is already
   the track, so the condition could never be false and the rule was dead CSS
   in the first draft. 780px is where the narrowest span still clears the
   floor — a 4-span of a 12-column grid at the redlined 24px column gap is
   (W - 11 x 24) x 4/12, which reaches 172px at W = 780. */
@container ds-grid (max-width: 780px) {
  .ds-grid-item {
    grid-column: 1 / -1;
  }
}
</style>
