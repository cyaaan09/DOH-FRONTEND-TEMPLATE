<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  label: { type: String, required: true },
})

// Surface stays almost white; the outlined pill carries the meaning.
const SURFACES = {
  neutral: 'bg-neutral-100 border-soft',
  green: 'bg-green-50 border-soft',
  amber: 'bg-amber-50 border-soft',
  red: 'bg-red-50 border-red-border',
  blue: 'bg-blue-50 border-soft',
  violet: 'bg-violet-100 border-soft',
}

const PILLS = {
  neutral: 'text-ink-600 border-soft',
  green: 'text-green-text border-soft',
  amber: 'text-amber-text border-soft',
  red: 'text-red-700 border-red-border',
  blue: 'text-blue-700 border-soft',
  violet: 'text-violet-700 border-soft',
}

const surfaceClass = computed(() => SURFACES[props.tone] ?? SURFACES.neutral)
const pillClass = computed(() => PILLS[props.tone] ?? PILLS.neutral)
</script>

<template>
  <div
    class="flex items-center gap-2.5 rounded-notice border px-3 py-2 text-body text-ink-700"
    :class="surfaceClass"
    role="status"
  >
    <span
      data-pill
      class="shrink-0 rounded-pill border bg-surface px-2 py-0.5 text-chip"
      :class="pillClass"
      >{{ label }}</span
    >
    <span class="min-w-0"><slot /></span>
  </div>
</template>
