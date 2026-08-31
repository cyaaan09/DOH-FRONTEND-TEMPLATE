<script setup>
import { computed } from 'vue'
import { DEFAULT_TONE, TONE_TEXT, TONES } from '../tones'

const VARIANTS = ['tint', 'filled', 'service', 'count']

const props = defineProps({
  tone: {
    type: String,
    default: DEFAULT_TONE,
    validator: (value) => TONES.includes(value),
  },
  variant: {
    type: String,
    default: 'tint',
    // Inlined rather than VARIANTS.includes: defineProps is hoisted out of
    // <script setup>'s scope by the compiler, so a validator cannot close
    // over a module-level binding. Keep the two lists in step.
    validator: (value) => ['tint', 'filled', 'service', 'count'].includes(value),
  },
  dot: { type: Boolean, default: false },
})

// Redline "Approved/Pending/Returned/Closed/Online/Add-Modify" — tint background
// per tone, paired with the shared TONE_TEXT foreground.
const BACKGROUNDS = {
  neutral: 'bg-neutral-100',
  green: 'bg-green-100',
  amber: 'bg-amber-100',
  red: 'bg-red-100',
  blue: 'bg-blue-100',
  violet: 'bg-violet-100',
}

const variantClass = computed(() => {
  const variant = VARIANTS.includes(props.variant) ? props.variant : 'tint'
  // Redline "Active (filled)" — green-fill background, green-on-fill text,
  // 6.01:1 contrast.
  if (variant === 'filled') return 'chip--pad bg-green-fill text-green-on-fill text-chip'
  // Redline "Service chip" — 12px/400 type, 5px 12px padding, white surface,
  // 1px border-soft border, ink-600 text.
  if (variant === 'service') {
    return 'chip--service bg-surface border border-soft text-ink-600 text-hint'
  }
  // Appendix D.1's COUNT & OVERFLOW set — a QUIET numeric badge on
  // --surface-muted in --text-meta. Deliberately not the `neutral` tone,
  // which is a full step darker in both (--neutral-100 on --text-header) and
  // reads as a status chip; a count that is not work waiting on you should
  // recede. A count that IS gets tone="red" instead.
  if (variant === 'count') return 'chip--pad bg-surface-muted text-text-meta text-chip'
  const tone = TONES.includes(props.tone) ? props.tone : DEFAULT_TONE
  return `chip--pad ${BACKGROUNDS[tone]} ${TONE_TEXT[tone]} text-chip`
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-pill whitespace-nowrap"
    :class="[variantClass, dot ? 'chip--dotted' : '']"
  >
    <span v-if="dot" data-dot class="chip__dot" aria-hidden="true" />
    <slot />
  </span>
</template>

<style scoped>
/* --chip-pad (3px 9px) has no utility namespace — spec §4.2. */
.chip--pad {
  padding: var(--chip-pad);
}

/* Redline "Service chip" — its own 5px 12px padding, not --chip-pad. */
.chip--service {
  padding: 5px 12px;
}

/* Redline "Dot · 6px circle, gap 6px, left pad 7px" — a dotted chip loses
 * 2px of its left padding so the dot sits closer to the edge. */
.chip--dotted.chip--pad {
  padding-left: 7px;
}

.chip__dot {
  width: 6px;
  height: 6px;
  flex: none;
  border-radius: 50%;
  background: currentColor;
}
</style>
