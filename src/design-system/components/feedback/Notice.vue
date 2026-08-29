<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONE_TEXT, TONES } from '../tones'

const props = defineProps({
  tone: {
    type: String,
    default: DEFAULT_TONE,
    validator: (value) => TONES.includes(value),
  },
  label: { type: String, required: true },
})

// Surface stays almost white; the outlined pill carries the meaning. Own to
// Notice — genuinely different from Chip's filled tint — so it stays local
// rather than moving into tones.js.
const SURFACES = {
  neutral: 'bg-neutral-100 border-soft',
  green: 'bg-green-50 border-soft',
  amber: 'bg-amber-50 border-soft',
  red: 'bg-red-50 border-red-border',
  blue: 'bg-blue-50 border-soft',
  violet: 'bg-violet-100 border-soft',
}

// The pill's border per tone; its text colour comes from the shared
// TONE_TEXT table below, which is identical to Chip's foreground colour.
const PILL_BORDERS = {
  neutral: 'border-soft',
  green: 'border-soft',
  amber: 'border-soft',
  red: 'border-red-border',
  blue: 'border-soft',
  violet: 'border-soft',
}

const surfaceClass = computed(() => SURFACES[props.tone] ?? SURFACES[DEFAULT_TONE])
const pillClass = computed(
  () =>
    `${TONE_TEXT[props.tone] ?? TONE_TEXT[DEFAULT_TONE]} ${PILL_BORDERS[props.tone] ?? PILL_BORDERS[DEFAULT_TONE]}`,
)

// role="status" is implicitly aria-live="polite" — assistive tech waits for
// a pause before announcing it. An error notice must interrupt instead, so
// it gets role="alert" (implicitly aria-live="assertive"). Every other tone
// stays polite.
const role = computed(() => (props.tone === 'red' ? 'alert' : 'status'))
</script>

<template>
  <div
    class="flex items-center gap-2.5 rounded-notice border px-3 py-2 text-body text-ink-700"
    :class="surfaceClass"
    :role="role"
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
