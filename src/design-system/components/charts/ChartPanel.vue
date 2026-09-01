<script setup>
import DeltaPill from './DeltaPill.vue'

/**
 * The shell every chart sits in.
 *
 * Redline "Figure first · label 12px · figure 26px mono / 700 / -0.03em /
 * line-height 1 · period meta 11.5px right-aligned. The header answers the
 * question; the plot adds shape." That ordering is the section's first rule
 * card, so the header is the component and the plot is a slot — not the other
 * way round.
 */
defineProps({
  /** What the figure counts — "Licences issued". */
  label: { type: String, required: true },
  /** The answer, in mono. "88", "122", "84%". */
  figure: { type: [String, Number], required: true },
  /** Right-hand meta, first line — "This month". */
  period: { type: String, default: '' },
  /** Right-hand meta, second line — "744 in 12 months". */
  note: { type: String, default: '' },
  /** Passed straight to DeltaPill; omitted together, the pill does not render. */
  delta: { type: String, default: '' },
  deltaDirection: { type: String, default: '' },
  deltaTone: { type: String, default: 'good' },
  /**
   * Redline "A11y · each chart names the table view holding the same data".
   * A chart is a picture; this is where a keyboard user is sent instead.
   */
  tableHref: { type: String, default: '' },
  tableLabel: { type: String, default: 'View as table' },
})
</script>

<template>
  <figure data-chart-panel class="chart-panel">
    <figcaption data-chart-header class="chart-panel__header">
      <div class="min-w-0">
        <div data-chart-label class="chart-panel__label">{{ label }}</div>
        <div class="chart-panel__figure-row">
          <span data-chart-figure class="chart-panel__figure font-mono">{{ figure }}</span>
          <DeltaPill v-if="delta" :label="delta" :direction="deltaDirection" :tone="deltaTone" />
        </div>
      </div>
      <div v-if="period || note" data-chart-period class="chart-panel__period">
        {{ period }}<template v-if="note"><br />{{ note }}</template>
      </div>
    </figcaption>

    <div data-chart-plot class="chart-panel__plot"><slot /></div>

    <div v-if="$slots.footer || tableHref" data-chart-footer class="chart-panel__footer">
      <slot name="footer" />
      <a v-if="tableHref" data-chart-table-link class="chart-panel__table" :href="tableHref">{{
        tableLabel
      }}</a>
    </div>
  </figure>
</template>

<style scoped>
/* Redline "Panel" — a hairline border, the card radius, the card surface.
   --divider carries that border value; --chart-grid happens to share it in
   light but is the GRIDLINE's token and diverges in dark, where a panel edge
   and a gridline are not the same thing. */
.chart-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--divider);
  border-radius: var(--r-card);
  background: var(--surface);
}

/* Redline "Panel · header 16px 18px 14px". */
.chart-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
}

.chart-panel__label {
  font-size: 12px;
  color: var(--text-meta);
}

.chart-panel__figure-row {
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-top: 5px;
}

/* Redline "Figure first · 26px mono / 700 / -0.03em / line-height 1". The tight
   line-height is what lets the figure and its pill share a baseline. */
.chart-panel__figure {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ink-900);
}

.chart-panel__period {
  flex: none;
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--ink-300);
  text-align: right;
}

/* Redline "Panel · plot 0 18px 16px". flex:1 so panels in one row match
   height even when their headers wrap differently. */
.chart-panel__plot {
  flex: 1;
  padding: 0 18px 16px;
}

/* Redline "Panel · optional footer 12px 18px" on --chart-footer, over a
   --divider-row rule. */
.chart-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-top: 1px solid var(--divider-row);
  background: var(--chart-footer);
}

.chart-panel__table {
  flex: none;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--green-text);
}
</style>
