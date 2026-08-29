<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  max: { type: Number, default: 100 },
  label: { type: String, required: true },
  // Redline "Meter caption" — 12px/400, value at 700 weight, 7px above.
  caption: { type: String, default: '' },
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
  <div>
    <p v-if="caption" data-caption class="meter__caption text-hint text-text-meta">
      {{ caption }}
      <span class="font-bold text-green-text">{{ clampedValue }}</span>
    </p>

    <!-- Redline "Meter track" — 6px, radius 999px, neutral-100 fill. -->
    <div
      class="meter h-1.5 w-full overflow-hidden rounded-pill bg-neutral-100"
      role="progressbar"
      :aria-valuenow="clampedValue"
      :aria-valuemin="0"
      :aria-valuemax="max"
      :aria-label="label"
    >
      <div data-fill class="meter__fill h-full rounded-pill" :style="{ width: `${percent}%` }" />
    </div>
  </div>
</template>

<style scoped>
/* --grad-meter has no utility namespace — spec §4.2. */
.meter__fill {
  background: var(--grad-meter);
  transition: width var(--t-control) ease;
}

/* Redline "Meter caption" — 7px above; no utility step. */
.meter__caption {
  margin: 0 0 7px;
}
</style>
