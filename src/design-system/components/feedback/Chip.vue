<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  dot: { type: Boolean, default: false },
})

const TONES = {
  neutral: 'bg-neutral-100 text-ink-600',
  green: 'bg-green-100 text-green-text',
  amber: 'bg-amber-100 text-amber-text',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
}

const toneClass = computed(() => TONES[props.tone] ?? TONES.neutral)
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
