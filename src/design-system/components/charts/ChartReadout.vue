<script setup>
import { computed } from 'vue'

/**
 * Redline "Hover readout · --readout-bg · radius 11px · pad 11px 13px · shadow
 * 0 10px 28px rgba(16,24,40,.26) · period 10.5px / 700 / 0.07em --ink-300 ·
 * every series in stack order + a total row above a 1px --readout-rule rule ·
 * 12px pointer offset" and "Touch · readout pins under the tapped column
 * instead of following a pointer".
 *
 * Every series, always — including the ones at zero. A readout that hides empty
 * series changes shape between columns, and the row you are looking for moves.
 */
const props = defineProps({
  /** The column being read — "DECEMBER 2026". */
  period: { type: String, required: true },
  /** [{ label, value, tone }] in stack order. */
  rows: { type: Array, required: true },
  totalLabel: { type: String, default: 'Total' },
})

const total = computed(() => props.rows.reduce((n, r) => n + r.value, 0))
</script>

<template>
  <div data-chart-readout role="status" class="readout">
    <div data-readout-period class="readout__period">{{ period }}</div>
    <div v-for="row in rows" :key="row.label" data-readout-row class="readout__row">
      <span class="readout__swatch" aria-hidden="true" :style="{ background: row.tone }" />
      <span class="min-w-0 flex-1 truncate">{{ row.label }}</span>
      <span class="readout__value font-mono">{{ row.value }}</span>
    </div>
    <div data-readout-total class="readout__row readout__row--total">
      <span class="min-w-0 flex-1">{{ totalLabel }}</span>
      <span class="readout__value font-mono">{{ total }}</span>
    </div>
  </div>
</template>

<style scoped>
.readout {
  display: inline-block;
  min-width: 168px;
  padding: 11px 13px;
  border-radius: 11px;
  background: var(--readout-bg);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.26);
}

/* --readout-bg is near-black in light and near-white in dark, so the text on it
   has to invert too. --surface is the one token that tracks it in the right
   direction in both themes. */
.readout__period {
  margin-bottom: 8px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  color: var(--ink-300);
}

.readout__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 11.5px;
  color: var(--surface);
}

/* Redline "a total row above a 1px --readout-rule rule". */
.readout__row--total {
  margin-top: 6px;
  padding-top: 7px;
  border-top: 1px solid var(--readout-rule);
  font-weight: 700;
}

.readout__swatch {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.readout__value {
  font-weight: 700;
  color: var(--surface);
}
</style>
