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
    validator: (value) => ['default', 'compact', 'touch'].includes(value),
  },
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const SIZES = {
  default: 'h-field px-4',
  compact: 'h-compact px-3',
  touch: 'h-touch px-5',
}

const VARIANTS = {
  primary: 'btn--primary text-green-on-fill',
  secondary: 'bg-surface text-ink-700 border border-field hover:bg-surface-muted',
  destructive: 'bg-surface text-red-700 border border-red-border-btn hover:bg-red-50',
  ghost: 'text-ink-600 hover:bg-surface-muted',
}

const sizeClass = computed(() => SIZES[props.size] ?? SIZES.default)
const variantClass = computed(() => VARIANTS[props.variant] ?? VARIANTS.primary)
</script>

<template>
  <button
    class="btn inline-flex items-center justify-center gap-2 rounded-field text-body font-medium whitespace-nowrap select-none transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
/* Gradient, focus ring and keyframe animation have no utility namespace —
 * spec §4.2 routes those through var() here. */
.btn:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.btn--primary {
  background: var(--grad-primary);
  box-shadow: var(--sh-primary);
}

.btn--primary:hover:not(:disabled) {
  background: var(--green-fill-hover);
}

.btn__spinner {
  width: 13px;
  height: 13px;
  flex: none;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 600ms linear infinite;
}
</style>
