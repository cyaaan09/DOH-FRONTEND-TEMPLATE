<script setup>
/**
 * Facts split by internal rules rather than by nested cards — the "no
 * nesting" rule Appendix D states for this pattern in so many words. Cells
 * are ruled with `--divider` on the inside edges only; the card's own border
 * closes the outside, so no cell draws a rule that would double it.
 */
const props = defineProps({
  /** Array<{ label, value, mono? }>, in reading order. */
  cells: { type: Array, required: true },
  /** Cells per row. */
  columns: { type: Number, default: 2 },
})

// A cell keeps its right rule unless it ends a row, and its bottom rule
// unless it sits in the last row — computed rather than declared per cell so
// a list of any length rules correctly.
function edgeClass(index) {
  const endsRow = (index + 1) % props.columns === 0
  const lastRowStart = Math.floor((props.cells.length - 1) / props.columns) * props.columns
  const inLastRow = index >= lastRowStart
  return [endsRow ? '' : 'border-r border-divider', inLastRow ? '' : 'border-b border-divider']
}
</script>

<template>
  <div
    data-divided-card
    class="divided-card grid overflow-hidden rounded-card border border-hairline bg-surface shadow-card"
    :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }"
  >
    <div
      v-for="(cell, index) in cells"
      :key="cell.label"
      data-cell
      class="divided-card__cell"
      :class="edgeClass(index)"
    >
      <!-- Redline "Panel label" territory, but at this card's own 11px/0.06em
           rather than the 10.5px/0.08em column-header step — a fact label
           inside a card, not a table heading. -->
      <div data-cell-label class="divided-card__label text-text-header">{{ cell.label }}</div>
      <div
        data-cell-value
        class="divided-card__value text-body font-medium text-ink-900"
        :class="cell.mono ? 'font-mono' : ''"
      >
        {{ cell.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.divided-card__cell {
  padding: 14px 20px;
}

.divided-card__label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.divided-card__value {
  margin-top: 4px;
}
</style>
