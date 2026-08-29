<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  muted: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="flex flex-col gap-1 rounded-card border border-hairline p-4 shadow-card"
    :class="muted ? 'bg-surface-card-muted' : 'bg-surface'"
  >
    <span data-label class="text-column-header text-text-header uppercase">{{ label }}</span>
    <span data-figure class="text-card-figure text-ink-900">{{ value }}</span>
    <span v-if="hint" data-hint class="text-hint text-text-meta">{{ hint }}</span>
  </div>
</template>
