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

// Redline "Notice fills" — the tone/50 scale. Neutral and violet have no
// redlined fill; their tint is used.
const FILLS = {
  neutral: 'bg-neutral-100',
  green: 'bg-green-50',
  amber: 'bg-amber-50',
  red: 'bg-red-50',
  blue: 'bg-blue-50',
  violet: 'bg-violet-100',
}

// Redline "Notice label · 1px tone/200" — a border scale the source uses but
// never tokenised; added in spec Appendix A.1. Neutral and violet have no
// redlined border, so they use the soft hairline.
const PILL_BORDERS = {
  neutral: 'border-soft',
  green: 'border-notice-border-green',
  amber: 'border-notice-border-amber',
  red: 'border-notice-border-red',
  blue: 'border-notice-border-blue',
  violet: 'border-soft',
}

const tone = computed(() => (TONES.includes(props.tone) ? props.tone : DEFAULT_TONE))
const fillClass = computed(() => FILLS[tone.value])
const textClass = computed(() => TONE_TEXT[tone.value])
const pillBorderClass = computed(() => PILL_BORDERS[tone.value])

// role="status" is implicitly aria-live="polite" — assistive tech waits for a
// pause. An error must interrupt instead, so it gets role="alert".
const role = computed(() => (tone.value === 'red' ? 'alert' : 'status'))
</script>

<template>
  <div
    class="flex min-h-notice items-center gap-3 rounded-notice py-1 pr-2.5 pl-1"
    :class="fillClass"
    :role="role"
  >
    <!-- Redline "Notice shell · min-h 32px · radius 16px · pad 4px 10px 4px 4px
         · gap 12px". No border: the outlined pill carries the meaning and the
         surface stays almost white. -->
    <!-- Redline "Notice label · 24px · radius 16px · pad 0 12px · 12.5px / 400
         · 1px tone/200" — transparent fill, tone outline. -->
    <span
      data-pill
      class="inline-flex h-6 flex-none items-center rounded-notice border px-3 text-field-label font-normal"
      :class="[textClass, pillBorderClass]"
      >{{ label }}</span
    >

    <!-- Redline "Notice text · 13px / 400 in tone colour on tone/50" -->
    <p data-body class="m-0 min-w-0 text-notice" :class="textClass"><slot /></p>
  </div>
</template>
