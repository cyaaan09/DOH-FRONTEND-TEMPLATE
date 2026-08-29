<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
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

const ROWS = [
  { cls: 'text-page-title', name: 'Page title', sample: 'Issued LTO' },
  { cls: 'text-card-figure', name: 'Card figure', sample: '211' },
  { cls: 'text-section-title', name: 'Section title', sample: 'Application history' },
  { cls: 'text-row-title', name: 'Row title', sample: 'Buenavista Health Center' },
  { cls: 'text-body', name: 'Body', sample: 'Stored encrypted at rest.' },
  { cls: 'text-field-label', name: 'Field label', sample: 'Certificate password' },
  { cls: 'text-hint', name: 'Meta / hint', sample: 'Updated 8 minutes ago' },
  { cls: 'text-column-header', name: 'Column header', sample: 'FACILITY TYPE' },
  { cls: 'text-mono font-mono', name: 'Mono', sample: '16-015-2527-PCF-1' },
]
</script>

<template>
  <DemoCard
    title="Type scale"
    description="DM Sans at three weights — 400 body, 500 labels, 700 anything that titles something. JetBrains Mono for numbers you might copy."
  >
    <DemoBlocks>
      <div class="flex flex-col gap-3">
        <div v-for="row in ROWS" :key="row.name" class="flex items-baseline gap-4">
          <span class="text-hint text-text-meta w-32 shrink-0">{{ row.name }}</span>
          <span :class="row.cls" class="text-ink-900">{{ row.sample }}</span>
        </div>
      </div>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
