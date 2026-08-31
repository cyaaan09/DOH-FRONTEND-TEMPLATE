<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Rule cards - spec Appendix D, typeRules. Missed by the original rule
// extraction (its regex did not match this array's shape), so Appendix D
// showed an empty "Rule cards:" heading under Type scale and this footer was
// never built. Extracted since; render it exactly like every other section.
const RULES = [
  {
    title: 'Three weights only',
    body: "400 for prose, 500 for field labels and values, 700 for titles and figures. No 600 — DM Sans's 500 already reads as emphasis.",
  },
  {
    title: 'Tighten as you scale up',
    body: 'Anything above 20px takes -0.015em; anything under 12px takes +0.08em and uppercase. Body text stays at 0.',
  },
  {
    title: 'Mono earns its place',
    body: 'JetBrains Mono only for values a user might copy or compare digit by digit — LTO numbers, serials, dates in tables.',
  },
]

// Appendix D.1 — nine rows, each a token / sample / spec triple, in the
// artifact's order. The section had been built as a two-column list: no SPEC
// column, no header row, the order shuffled (Card figure above Section
// title) and two samples cut down to fragments.
const ROWS = [
  {
    cls: 'text-page-title text-ink-900',
    name: 'Page title',
    sample: 'Issued LTO',
    spec: '26px / 700 / -0.015em',
  },
  {
    cls: 'text-section-title text-ink-900',
    name: 'Section title',
    sample: 'Application history',
    spec: '17px / 700',
  },
  {
    cls: 'text-card-figure text-ink-900',
    name: 'Card figure',
    sample: '211',
    spec: '23px / 700 / -0.01em',
  },
  {
    cls: 'text-row-title text-ink-900',
    name: 'Row title',
    sample: 'Buenavista Primary Health Care Center',
    spec: '14px / 700',
  },
  {
    cls: 'text-body text-ink-600',
    name: 'Body',
    sample: 'Your PNPKI certificate and its password are stored encrypted.',
    spec: '13.5px / 400 / 1.55',
  },
  {
    cls: 'text-field-label text-ink-700',
    name: 'Field label',
    sample: 'Certificate password',
    spec: '12.5px / 500',
  },
  {
    cls: 'text-hint text-text-meta',
    name: 'Meta / hint',
    sample: 'Updated 8 minutes ago',
    spec: '12px / 400',
  },
  {
    cls: 'text-column-header text-text-header',
    name: 'Column header',
    sample: 'FACILITY TYPE',
    spec: '10.5px / 700 / 0.08em',
  },
  {
    cls: 'text-mono font-mono text-green-text',
    name: 'Mono',
    sample: '16-015-2527-PCF-1',
    spec: '12.5px / 500 mono',
  },
]
</script>

<template>
  <DemoCard
    title="Type scale"
    description="DM Sans at three weights — 400 body, 500 labels, 700 anything that titles something. JetBrains Mono for numbers you might copy."
  >
    <!-- Appendix D.1 — a full-bleed three-column table, not a DemoBlocks
         grid: TOKEN / SAMPLE / SPEC on a 132px 1fr 210px track at gap 20px,
         each row ruled off with --divider-row. Sits outside DemoBlocks
         because its header and rows carry their own 24px gutters. -->
    <div data-type-table>
      <div data-type-head class="type-scale__row bg-surface-sunken border-y border-divider">
        <div class="text-column-header text-text-header">TOKEN</div>
        <div class="text-column-header text-text-header">SAMPLE</div>
        <div class="text-column-header text-text-header">SPEC</div>
      </div>
      <div
        v-for="row in ROWS"
        :key="row.name"
        data-type-row
        class="type-scale__row type-scale__row--body border-b border-divider-row items-baseline"
      >
        <div class="text-field-label font-bold text-ink-600">{{ row.name }}</div>
        <div :class="row.cls">{{ row.sample }}</div>
        <div class="text-hint font-mono text-text-meta">{{ row.spec }}</div>
      </div>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — header pad 12px 24px, body rows 15px 24px, both on the
   same 132px 1fr 210px track at gap 20px. Tailwind has no utility for a
   mixed fixed/fluid track list, so it is expressed here. */
.type-scale__row {
  display: grid;
  grid-template-columns: 132px 1fr 210px;
  gap: 20px;
  padding: 12px var(--pad-card-x);
}

.type-scale__row--body {
  padding-top: 15px;
  padding-bottom: 15px;
}
</style>
