<script setup>
import DeltaPill from './DeltaPill.vue'
import Sparkline from './Sparkline.vue'

/**
 * Redline "Stat card · pad 15px 16px 12px · radius 14px · 1px --border-card ·
 * label 11.5px --text-meta · figure 24px mono / 700 / -0.03em with the delta
 * baseline-aligned right · spark 12px below".
 *
 * Distinct from the StatCard in Surfaces: that one carries a status dot and an
 * urgency treatment, this one carries a trend. Same redline group, different
 * rows, and merging them would give each half the other's props.
 */
defineProps({
  label: { type: String, required: true },
  figure: { type: [String, Number], required: true },
  delta: { type: String, default: '' },
  deltaDirection: { type: String, default: '' },
  deltaTone: { type: String, default: 'good' },
  values: { type: Array, default: () => [] },
  tone: { type: String, default: 'var(--chart-ok)' },
})
</script>

<template>
  <div data-chart-stat class="stat">
    <div data-stat-label class="stat__label">{{ label }}</div>
    <div class="stat__row">
      <span data-stat-figure class="stat__figure font-mono">{{ figure }}</span>
      <DeltaPill v-if="delta" :label="delta" :direction="deltaDirection" :tone="deltaTone" />
    </div>
    <Sparkline v-if="values.length" class="stat__spark" :values="values" :tone="tone" />
  </div>
</template>

<style scoped>
.stat {
  padding: 15px 16px 12px;
  border: 1px solid var(--border-card);
  border-radius: var(--r-card);
  background: var(--surface);
}

.stat__label {
  font-size: 11.5px;
  color: var(--text-meta);
}

/* baseline, not centre: the redline aligns the pill to the figure's baseline,
   which is what stops a two-character delta from floating above a tall number. */
.stat__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.stat__figure {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink-900);
}

.stat__spark {
  margin-top: 12px;
}
</style>
