<script setup>
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
  <div class="flex flex-col gap-3">
    <div v-for="row in ROWS" :key="row.name" class="flex items-baseline gap-4">
      <span class="text-hint text-text-meta w-32 shrink-0">{{ row.name }}</span>
      <span :class="row.cls" class="text-ink-900">{{ row.sample }}</span>
    </div>
  </div>
</template>
