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
  // Redline "Default · 38px · pad 0 16px · radius 9px · 13.5px / 700"
  default: 'h-field px-4 rounded-field text-body',
  // Redline "Compact · 34px · pad 0 14px · radius 8px · 12.5px"
  compact: 'h-compact px-3.5 rounded-control text-field-label',
  // Redline "Icon only · 34×34px · radius 8px"
  icon: 'h-compact w-compact rounded-control text-field-label',
  // Not in the redline table; the source's responsive group specifies 44px
  // for the one primary action on a mobile-width form.
  touch: 'h-touch px-5 rounded-field text-body',
}

const VARIANTS = {
  // Redline "Primary · flat green bg · white text · shadow 0 1px 2px rgba(20,80,40,.25)"
  // (hex values omitted from this comment — the guards test below bans raw
  // hex literals anywhere in this file, comments included).
  primary: 'btn--primary bg-green-fill text-green-on-fill',
  // Redline "Secondary · white bg · 1px grey-blue border · dark ink text / 500" + "hover light-grey surface"
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted',
  // Redline "Destructive · white bg · 1px red border · red text · hover red-tint"
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50',
  // Redline "Ghost · transparent · green text / 700 · hover green-tint"
  ghost: 'text-green-text hover:bg-green-tint',
}

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.default)
const variantClass = computed(() => VARIANTS[props.variant] ?? VARIANTS.primary)
</script>

<template>
  <button
    class="btn inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed disabled:border disabled:bg-surface-input disabled:border-hairline disabled:text-ink-200"
    :class="[sizeClass, variantClass]"
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
 * --green-fill utility now, not the gradient: redline "Primary · flat green bg".
 * (hex omitted — the guards test below bans raw hex literals file-wide.) */
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

/* Redline "Pending · primary-hover green + 12px spinner, 2px track rgba(255,255,255,.4)" */
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
