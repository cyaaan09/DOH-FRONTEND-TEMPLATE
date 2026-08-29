<script setup>
import { computed } from 'vue'

const props = defineProps({
  // The validator only warns on a typo in dev; it must not change runtime
  // behaviour, so the `?? DEFAULT` fallbacks below are unchanged. A
  // defineProps() validator cannot reference a variable declared elsewhere
  // in <script setup> (Vue hoists the props option out of setup()), so the
  // allowed values are spelled out here rather than derived from SIZES /
  // VARIANTS below.
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'destructive', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'icon', 'touch'].includes(value),
  },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const SIZES = {
  // Redline "Default"
  default: 'h-field px-4 rounded-field text-body',
  // Redline "Compact"
  compact: 'h-compact px-3.5 rounded-control text-field-label',
  // Redline "Icon only"
  icon: 'h-compact w-compact rounded-control text-field-label',
  // Not in the redline table; the source's responsive group specifies 44px
  // for the one primary action on a mobile-width form.
  touch: 'h-touch px-5 rounded-field text-body',
}

const VARIANTS = {
  // Redline "Primary"
  primary: 'btn--primary bg-green-fill text-green-on-fill',
  // Redline "Secondary" (+ "Secondary hover")
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted',
  // Redline "Destructive"
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50',
  // Redline "Ghost"
  ghost: 'text-green-text hover:bg-green-tint',
}

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.default)
const variantClass = computed(() => VARIANTS[props.variant] ?? VARIANTS.primary)

// The native `disabled` attribute below is set for two different reasons
// (disabled prop OR busy prop), but the two reasons must not look the same:
// redline "Pending" keeps the primary fill at its hover green, while redline
// "Disabled" swaps in a distinct grey surface/border/text. Driving the look
// from a `disabled:` variant conflates the two, because both cases set the
// same attribute — so the appearance is driven from the props directly,
// with busy taking priority when a caller (unusually) sets both.
const stateClass = computed(() => {
  if (props.busy) return 'btn--busy'
  if (props.disabled) return 'bg-surface-input border border-hairline text-ink-200'
  return ''
})
</script>

<template>
  <button
    class="btn inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed"
    :class="[sizeClass, variantClass, stateClass]"
    :type="type"
    :disabled="disabled || busy"
    :aria-busy="busy || undefined"
  >
    <span v-if="busy" data-spinner class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
/* Shadow, focus ring and the spinner keyframe have no utility namespace —
 * spec §4.2 routes those through var() here. The primary FILL is a flat
 * --green-fill utility now, not the gradient: redline "Primary". */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.btn--primary {
  box-shadow: var(--sh-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--green-fill-hover);
}

/* Redline "Pending": the primary fill sits at its hover green while busy,
 * rather than falling back to the Disabled row's grey — busy and disabled
 * both set the native `disabled` attribute, but must not look alike. Scoped
 * to the primary variant; other variants keep their own look while busy. */
.btn--busy.btn--primary {
  background: var(--green-fill-hover);
}

/* Redline "Pending" spinner: 12px, 2px track. */
.btn__spinner {
  width: 12px;
  height: 12px;
  flex: none;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 0.4);
  border-top-color: currentColor;
  animation: spin 600ms linear infinite;
}
</style>
