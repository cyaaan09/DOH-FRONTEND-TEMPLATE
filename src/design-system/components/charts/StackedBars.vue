<script setup>
import { computed } from 'vue'

/**
 * Redline "Bars · gap 12px · max-width 34px · radius 5px on the outer end only
 * · 2px between stack segments · value 11px mono / 700 above, --ink-900 on the
 * emphasised column and --text-meta elsewhere".
 *
 * "Outer end only" is the detail that makes a stack read as one bar: rounding
 * every segment would draw a column of separate pills.
 */
const props = defineProps({
  /** [{ label, segments: [{ key, value }] }] — segments run bottom-up. */
  columns: { type: Array, required: true },
  /** [{ key, label, tone }] in stack order; the tone is any chart token. */
  series: { type: Array, required: true },
  /** Column label to draw at full weight — the redline allows exactly one. */
  emphasis: { type: String, default: '' },
  height: { type: Number, default: 112 },
})

const totals = computed(() => props.columns.map((c) => c.segments.reduce((n, s) => n + s.value, 0)))
const peak = computed(() => Math.max(1, ...totals.value))
const toneOf = (key) => props.series.find((s) => s.key === key)?.tone ?? 'var(--chart-idle)'

// Redline "Bars · radius 5px on the outer end only" — the ends of what is
// actually drawn. Counting against the raw segment list would round the wrong
// edge on any column whose top or bottom series is zero.
const drawn = (column) => column.segments.filter((s) => s.value > 0)
const cornerFor = (index, column) => {
  const count = drawn(column).length
  if (count === 1) return '5px'
  if (index === 0) return '5px 5px 0 0'
  return index === count - 1 ? '0 0 5px 5px' : '0'
}
</script>

<template>
  <div data-stacked-bars class="bars" :style="{ height: `${height + 34}px` }">
    <div
      v-for="(column, index) in columns"
      :key="column.label"
      data-bar-column
      class="bars__column"
      :data-emphasis="column.label === emphasis || undefined"
    >
      <span data-bar-value class="bars__value font-mono">{{ totals[index] }}</span>
      <span
        class="bars__stack"
        :style="{ height: `${(totals[index] / peak) * height}px` }"
        aria-hidden="true"
      >
        <!-- reversed: the array runs bottom-up, the DOM paints top-down -->
        <!-- A zero segment is not rendered at all. `min-height: 2px` keeps a
             small-but-real value visible, and would otherwise paint a 2px mark
             for a value of none — a red sliver on a month with no overdue
             licences, which is worse than the rounding it exists to fix. -->
        <span
          v-for="(segment, s) in [...column.segments].reverse().filter((x) => x.value > 0)"
          :key="segment.key"
          data-bar-segment
          class="bars__segment"
          :style="{
            flex: segment.value,
            background: toneOf(segment.key),
            borderRadius: cornerFor(s, column),
          }"
        />
      </span>
      <span data-bar-label class="bars__label">{{ column.label }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Redline "Bars · gap 12px". */
.bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.bars__column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  min-width: 0;
}

.bars__value {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-meta);
}

/* Redline "One emphasis · exactly one element at full weight per chart". */
.bars__column[data-emphasis] .bars__value {
  color: var(--ink-900);
}

/* Redline "Bars · max-width 34px · 2px between stack segments". */
.bars__stack {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 2px;
  width: 100%;
  max-width: 34px;
}

.bars__segment {
  display: block;
  min-height: 2px;
}

.bars__label {
  font-size: 10.5px;
  color: var(--chart-axis);
}
</style>
