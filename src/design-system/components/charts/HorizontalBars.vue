<script setup>
import { computed } from 'vue'

/**
 * Redline "Horizontal bars · 7px track --chart-track radius 999 · label 12.5px
 * clipping left · value 12px mono / 700 + share 10.5px --text-meta in a 30px
 * right column".
 *
 * Bars are scaled against the LARGEST row, not the total: this chart ranks, and
 * scaling to the total would leave every bar short and the ranking hard to read.
 * The share column still carries the proportion in text.
 */
const props = defineProps({
  /** [{ label, value, tone? }] in the order they should rank. */
  rows: { type: Array, required: true },
  /** Total for the share column; defaults to the sum of the rows. */
  total: { type: Number, default: 0 },
})

const sum = computed(() => props.total || props.rows.reduce((n, r) => n + r.value, 0))
const peak = computed(() => Math.max(1, ...props.rows.map((r) => r.value)))
const share = (value) => Math.round((value / (sum.value || 1)) * 100)
</script>

<template>
  <div data-horizontal-bars class="hbars">
    <div
      v-for="(row, index) in rows"
      :key="row.label"
      data-hbar-row
      class="hbars__row"
      :data-emphasis="index === 0 || undefined"
    >
      <div class="hbars__head">
        <span data-hbar-label class="hbars__label">{{ row.label }}</span>
        <span class="hbars__figures">
          <span data-hbar-value class="hbars__value font-mono">{{ row.value }}</span>
          <span data-hbar-share class="hbars__share">{{ share(row.value) }}%</span>
        </span>
      </div>
      <div class="hbars__track" aria-hidden="true">
        <span
          data-hbar-fill
          class="hbars__fill"
          :style="{
            width: `${(row.value / peak) * 100}%`,
            background: row.tone ?? 'var(--chart-ok)',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hbars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hbars__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

/* Redline "label 12.5px clipping left" — the label truncates, never the value:
   a facility type is recognisable from its opening words, a count is not. */
.hbars__label {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 400;
  color: var(--ink-700);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Redline "One emphasis · the top row". */
.hbars__row[data-emphasis] .hbars__label {
  font-weight: 700;
  color: var(--ink-900);
}

.hbars__figures {
  display: inline-flex;
  flex: none;
  align-items: baseline;
  gap: 6px;
}

.hbars__value {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-900);
}

/* A fixed 30px column so the percentages line up down the chart. */
.hbars__share {
  width: 30px;
  font-size: 10.5px;
  color: var(--text-meta);
  text-align: right;
}

/* Redline "7px track --chart-track radius 999". */
.hbars__track {
  overflow: hidden;
  height: 7px;
  border-radius: var(--r-pill);
  background: var(--chart-track);
}

.hbars__fill {
  display: block;
  height: 100%;
  border-radius: var(--r-pill);
}
</style>
