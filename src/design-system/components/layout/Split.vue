<script setup>
import { gapProp } from './gaps.js'

/**
 * Redline "Split · Row with a flex:1 spacer — content left, actions right ·
 * wraps at 640px".
 *
 * Two slots rather than a spacer the caller inserts: the spacer is the whole
 * point of the primitive, and a caller who forgets it gets a Row. Below
 * 640px the two groups stack, so a card header does not squeeze its actions
 * into an unreadable strip.
 */
defineProps({
  gap: gapProp(12),
  align: { type: String, default: 'center' },
})
</script>

<template>
  <div data-split class="ds-split" :style="{ gap: `${gap}px`, alignItems: align }">
    <div data-split-start class="ds-split__start min-w-0"><slot /></div>
    <div v-if="$slots.end" data-split-end class="ds-split__end"><slot name="end" /></div>
  </div>
</template>

<style scoped>
.ds-split {
  display: flex;
}

/* The flex:1 spacer IS the primitive — it lives on the start group rather
   than as an empty node, so there is no stray element to style around. */
.ds-split__start {
  flex: 1;
}

.ds-split__end {
  flex: none;
}

/* Redline "wraps at 640px" — a container query would be truer, but the
   redline names a viewport and the shell is one column below it anyway. */
@media (max-width: 640px) {
  .ds-split {
    flex-wrap: wrap;
  }

  .ds-split__start {
    flex-basis: 100%;
  }
}
</style>
