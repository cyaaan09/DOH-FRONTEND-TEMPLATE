<script setup>
/**
 * Redline "Loading · the plot area becomes one --chart-grid block at the
 * chart's height — never animated bars growing from zero".
 *
 * The never matters: bars that animate up from zero read as real values
 * arriving, so a user starts interpreting a chart that has no data in it yet.
 */
defineProps({
  height: { type: Number, default: 108 },
  label: { type: String, default: 'Loading chart' },
})
</script>

<template>
  <div
    data-chart-loading
    role="status"
    :aria-label="label"
    class="loading"
    :style="{ height: `${height}px` }"
  />
</template>

<style scoped>
.loading {
  border-radius: var(--r-panel);
  background: var(--chart-grid);
}
</style>
