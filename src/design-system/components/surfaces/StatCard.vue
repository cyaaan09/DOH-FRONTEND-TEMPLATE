<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONES } from '../tones'

/**
 * A single figure with its label and hint. `urgent` and `dot` mark a number that needs
 * attention; `muted` retires one that does not.
 */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  hint: { type: String, default: '' },
  muted: { type: Boolean, default: false },
  // Redline "Label" — an optional status dot, 8px, gap 7px.
  dot: { type: String, default: '' },
  // Redline "Hint" — urgent variant renders at 700 weight.
  urgent: { type: Boolean, default: false },
  // Redline "Card selected" — green border + ring shadow.
  selected: { type: Boolean, default: false },
})

// The dot's fill per tone. --dot-green is the source's dedicated dot colour;
// the redline warns it is 3.29:1 and must never sit behind white text.
const DOTS = {
  neutral: 'bg-ink-300',
  green: 'bg-dot-green',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  blue: 'bg-blue-700',
  violet: 'bg-violet-700',
}

const dotClass = computed(() => DOTS[props.dot] ?? DOTS[DEFAULT_TONE])
const showDot = computed(() => TONES.includes(props.dot))
</script>

<template>
  <div
    class="flex flex-col rounded-panel border px-4 py-3.5"
    :class="[
      muted ? 'bg-surface-card-muted' : 'bg-surface',
      // Redline 'Card selected' — border and shadow are resolved together
      // as one state, never layered alongside the default hairline border
      // and card shadow (the same one-class-per-property shape as Button's
      // disabled fix elsewhere in this pass).
      selected ? 'border-green-500 statcard--selected' : 'border-hairline shadow-card',
    ]"
  >
    <!-- Redline "Label" — 12px/500, dot 8px, gap 7px, no uppercase. -->
    <span data-label class="flex items-center text-hint font-medium text-text-meta">
      <span v-if="showDot" data-dot class="statcard__dot" :class="dotClass" aria-hidden="true" />
      {{ label }}
    </span>

    <!-- Redline "Figure" — 23px/700/-0.01em, 5px above. -->
    <span
      data-figure
      class="text-card-figure mt-1.25"
      :class="muted ? 'text-text-header' : 'text-ink-900'"
      >{{ value }}</span
    >

    <!-- Redline "Hint" — 11.5px/400, urgent variant 700 weight. -->
    <span
      v-if="hint"
      data-hint
      class="text-stat-hint mt-1"
      :class="urgent ? 'text-red-700 font-bold' : 'text-text-meta'"
      >{{ hint }}</span
    >
  </div>
</template>

<style scoped>
/* Redline "Label" — dot 8px, gap 7px; neither has a utility step. */
.statcard__dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  margin-right: 7px;
}

/* Redline "Card selected" — the ring shadow has no utility namespace
 * (spec §4.2), so it is applied here rather than through a class that would
 * compete with the default `shadow-card` utility for the same property. */
.statcard--selected {
  box-shadow: var(--ring-select);
}
</style>
