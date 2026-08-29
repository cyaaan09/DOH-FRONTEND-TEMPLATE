<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, required: true },
})

const percent = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

// Screen readers derive a percentage from valuenow/min/max, so the
// announced value must be clamped the same way the visual fill is — an
// out-of-range raw value (150 of 100, or -5) would otherwise announce
// nonsense.
const clampedValue = computed(() => Math.min(props.max, Math.max(0, props.value)))
</script>

<template>
  <div
    class="meter h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted"
    role="progressbar"
    :aria-valuenow="clampedValue"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="label"
  >
    <div data-fill class="meter__fill h-full rounded-pill" :style="{ width: `${percent}%` }" />
  </div>
</template>

<style scoped>
/* --grad-meter has no utility namespace — spec §4.2. */
.meter__fill {
  background: var(--grad-meter);
  transition: width var(--t-control) ease;
}
</style>
