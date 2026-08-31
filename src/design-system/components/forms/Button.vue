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
    validator: (value) =>
      ['primary', 'secondary', 'destructive', 'destructive-fill', 'ghost'].includes(value),
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

// Colour AND WEIGHT per variant — one entry per property. Weight belongs
// here, not on `.btn`: Appendix C gives Secondary its ink colour at 500 and
// Ghost its green at 700, and the artifact renders destructive and disabled
// at 500 too. A blanket `font-bold` on the base class made every variant
// 700, and because nothing else declared a weight there was no competing
// class to notice — so the four 500 variants rendered heavier than the
// redline all along. Kept separate from the `btn--primary` marker class
// below so the marker (which drives the shadow and hover-green in scoped
// CSS) never has to be duplicated inside a colour string.
const VARIANT_COLORS = {
  // Redline "Primary"
  primary: 'bg-green-fill text-green-on-fill font-bold',
  // Redline "Secondary" (+ "Secondary hover")
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted font-medium',
  // Redline "Destructive"
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50 font-medium',
  // Redline "Confirm button" — the FILLED destructive the confirmation
  // dialog uses, red-700 going to red-800 on hover. Appendix C carries the
  // row; nothing implemented it, so Dialog had no button to confirm with.
  'destructive-fill': 'bg-red-700 text-red-on-fill hover:bg-red-800 font-bold',
  // Redline "Ghost"
  ghost: 'text-green-text hover:bg-green-tint font-bold',
}

// Redline "Disabled" — a single colour set that REPLACES the variant's own
// background/border/text rather than sitting alongside it. Two classes for
// the same property (e.g. bg-green-fill AND bg-surface-input) have equal
// specificity in the same Tailwind layer, so the winner would be decided by
// compile order rather than by this code — which is exactly the defect this
// fixes: only primary and ghost happened to compile with the disabled
// colours winning, so secondary rendered dark text and destructive kept its
// red text and border. Because the variant's own hover class is dropped
// entirely rather than left in place, a disabled button also can no longer
// change colour on hover — only primary was previously guarded for that.
const DISABLED_COLORS = 'bg-surface-input border border-hairline text-ink-200 font-medium'

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.default)

const variantKey = computed(() => (VARIANT_COLORS[props.variant] ? props.variant : 'primary'))

// The native `disabled` attribute below is set for two different reasons
// (disabled prop OR busy prop), but the two reasons must not look the same:
// redline "Pending" keeps the primary fill at its hover green, while redline
// "Disabled" swaps in a distinct grey surface/border/text. Colour is
// resolved as exactly one set of classes per state — busy keeps the
// variant's own colours (with `btn--busy` layered on via scoped CSS below),
// disabled replaces them outright — with busy taking priority when a caller
// (unusually) sets both.
const colorClass = computed(() => {
  if (props.disabled && !props.busy) return DISABLED_COLORS
  return VARIANT_COLORS[variantKey.value]
})

// Independent of colour: drives the primary shadow/hover-green and the
// busy-spinner override in scoped CSS. Kept out of colorClass so it never
// competes with a colour utility for the same property.
const markerClass = computed(() => (variantKey.value === 'primary' ? 'btn--primary' : ''))
const busyClass = computed(() => (props.busy ? 'btn--busy' : ''))
</script>

<template>
  <button
    class="btn inline-flex items-center justify-center gap-2 whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed"
    :class="[sizeClass, colorClass, markerClass, busyClass]"
    :type="type"
    :disabled="disabled || busy"
    :aria-busy="busy || undefined"
    :data-icon-button="size === 'icon' ? '' : undefined"
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

@media (hover: hover) {
  .btn--primary:hover:not(:disabled) {
    background: var(--green-fill-hover);
  }
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
  /* Redline "Pending · 2px track rgba(255,255,255,.4)". Written against
     --green-on-fill, not white: on dark that token flips to a near-black,
     so a hardcoded white track no longer belongs to its own button. */
  border: 2px solid color-mix(in srgb, var(--green-on-fill) 40%, transparent);
  border-top-color: currentColor;
  animation: spin 600ms linear infinite;
}
</style>
