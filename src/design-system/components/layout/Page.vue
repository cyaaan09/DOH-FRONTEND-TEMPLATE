<script setup>
/**
 * Redline "Page · max-w 1320px detail / 1560px tables · pad 26px 32px ·
 * canvas" — the canvas colour is --canvas, via the bg-canvas utility.
 *
 * Page and Section are the two primitives that DO own colour and padding —
 * the "Rule" row governs Row/Column/Grid and friends, which compose inside
 * them. They are containers, not spacing helpers.
 */
defineProps({
  /** `detail` caps at 1320px; `table` at 1560px for a wide data table. */
  width: { type: String, default: 'detail', validator: (v) => ['detail', 'table'].includes(v) },
})
</script>

<template>
  <div data-page class="ds-page bg-canvas" :class="`ds-page--${width}`">
    <div class="ds-page__inner"><slot /></div>
  </div>
</template>

<style scoped>
.ds-page {
  padding: 26px 32px;
}

.ds-page__inner {
  margin-inline: auto;
}

.ds-page--detail .ds-page__inner {
  max-width: 1320px;
}

.ds-page--table .ds-page__inner {
  max-width: 1560px;
}
</style>
