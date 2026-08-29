<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONE_TEXT, TONES } from '../tones'

const props = defineProps({
  tone: {
    type: String,
    default: DEFAULT_TONE,
    validator: (value) => TONES.includes(value),
  },
  dot: { type: Boolean, default: false },
})

// Chip's own filled tint per tone — genuinely different from Notice's
// near-white surface, so it stays local rather than moving into tones.js.
const BACKGROUNDS = {
  neutral: 'bg-neutral-100',
  green: 'bg-green-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
  blue: 'bg-blue-100',
  violet: 'bg-violet-100',
}

const toneClass = computed(
  () =>
    `${BACKGROUNDS[props.tone] ?? BACKGROUNDS[DEFAULT_TONE]} ${TONE_TEXT[props.tone] ?? TONE_TEXT[DEFAULT_TONE]}`,
)
</script>

<template>
  <span
    class="chip inline-flex items-center gap-1.5 rounded-pill text-chip whitespace-nowrap"
    :class="toneClass"
  >
    <span v-if="dot" data-dot class="chip__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
/* --chip-pad (3px 9px) has no utility namespace — spec §4.2. */
.chip {
  padding: var(--chip-pad);
}

.chip__dot {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}
</style>
