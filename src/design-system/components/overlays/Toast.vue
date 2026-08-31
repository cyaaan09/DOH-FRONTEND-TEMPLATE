<script setup>
import { computed } from 'vue'
import {
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastActionTrigger,
  ToastCloseTrigger,
} from '@ark-ui/vue/toast'

const props = defineProps({
  /** The toast object Ark's <Toaster> hands to its default slot. */
  toast: { type: Object, required: true },
  /** Label for the secondary text dismiss beside the action. */
  dismissLabel: { type: String, default: 'Dismiss' },
  /** Accessible name for the × in the corner. */
  closeLabel: { type: String, default: 'Close notification' },
})

// Ark keys toasts by `type` (success | error | warning | info | loading);
// the design system's own vocabulary is the six `tone` names in tones.js.
// This table is the join between them, and it is deliberately NOT
// TONE_TEXT: a toast's icon tile, action link and timer bar each take a
// different colour from the same tone, which no other component needs.
// One entry per type, each naming every property it owns.
const TONES = {
  success: {
    border: 'border-toast-border-green',
    icon: 'bg-green-text',
    action: 'text-green-text',
    timer: 'bg-dot-green',
    glyph: '✓',
  },
  error: {
    border: 'border-red-border',
    icon: 'bg-red-700',
    action: 'text-red-700',
    timer: 'bg-red-500',
    glyph: '!',
  },
  warning: {
    border: 'border-toast-border-amber',
    icon: 'bg-amber-text',
    action: 'text-amber-text',
    timer: 'bg-amber-400',
    glyph: '!',
  },
  info: {
    border: 'border-toast-border-blue',
    icon: 'bg-blue-700',
    action: 'text-blue-700',
    timer: 'bg-blue-700',
    glyph: 'i',
  },
}

const tone = computed(() => TONES[props.toast.type] ?? TONES.info)
const hasAction = computed(() => Boolean(props.toast.action?.label))
</script>

<template>
  <ToastRoot
    data-toast
    class="toast flex items-start border bg-surface"
    :class="tone.border"
    :style="{ '--toast-duration': `${toast.duration ?? 5000}ms` }"
  >
    <!-- Redline "Toast icon" — 26px tile filled with the tone's link colour,
         12px/700 glyph in white. Decorative: the title carries the meaning,
         and Ark's region is already aria-live. -->
    <span
      data-icon
      aria-hidden="true"
      class="toast__icon grid flex-none place-items-center rounded-control text-green-on-fill"
      :class="tone.icon"
      >{{ tone.glyph }}</span
    >

    <div class="min-w-0 flex-1">
      <ToastTitle data-title class="text-body font-bold text-ink-900">{{ toast.title }}</ToastTitle>
      <ToastDescription
        v-if="toast.description"
        data-body
        class="toast__body text-caption text-text-meta"
        >{{ toast.description }}</ToastDescription
      >

      <div v-if="hasAction" data-actions class="toast__actions flex">
        <ToastActionTrigger
          data-action
          class="toast__action text-caption font-bold"
          :class="tone.action"
          >{{ toast.action.label }}</ToastActionTrigger
        >
        <ToastCloseTrigger
          data-dismiss
          class="toast__action text-caption font-medium text-text-meta"
          >{{ dismissLabel }}</ToastCloseTrigger
        >
      </div>
    </div>

    <ToastCloseTrigger
      data-close
      class="toast__close flex-none rounded-bar text-ink-200"
      :aria-label="closeLabel"
      >×</ToastCloseTrigger
    >

    <!-- Redline "Timer" — a 3px bar draining left to right over the toast's
         own lifetime. aria-hidden: the countdown is a visual affordance, and
         Ark already pauses it on hover and focus. -->
    <span data-timer aria-hidden="true" class="toast__timer" :class="tone.timer" />
  </ToastRoot>
</template>

<style scoped>
/* Ark positions the stack by writing CUSTOM PROPERTIES and leaves applying
   them to the consumer's stylesheet: it sets `position: absolute; bottom: 0`
   on every toast plus `--offset` (the cumulative height-and-gap of the ones
   below) and `--y: calc(var(--lift) * var(--offset))`. Nothing reads --y by
   itself, so without this rule every toast renders at bottom: 0, piled on
   top of the others — and the pile LOOKS fine whenever the toasts happen to
   differ in height, because a taller one still pokes out above a shorter.
   That is why it survived both existing toast tests and only showed up on a
   narrower viewport where the body text wrapped to an extra line. */
.toast {
  transform: translateY(var(--y, 0px));
  transition:
    transform var(--t-control) cubic-bezier(0.21, 1.02, 0.73, 1),
    opacity var(--t-control) ease;
  gap: 11px;
  padding: 13px 12px 15px 13px;
  border-radius: var(--r-panel);
  overflow: hidden;
  box-shadow: var(--sh-toast);
}

/* Leaving: fade out and drop by one gap, so a dismissed toast reads as
   leaving rather than blinking out. --lift-amount is Ark's own value for
   exactly this. */
.toast[data-state='closed'] {
  opacity: 0;
  transform: translateY(calc(var(--y, 0px) - var(--lift-amount, 0px)));
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    transition: none;
  }
}

.toast__icon {
  width: 26px;
  height: 26px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.toast__body {
  margin-top: 2px;
  line-height: 1.45;
  text-wrap: pretty;
}

.toast__actions {
  gap: 14px;
  margin-top: 9px;
}

.toast__action {
  cursor: pointer;
}

.toast__close {
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--t-control) ease,
    color var(--t-control) ease;
}

.toast__close:hover {
  background: var(--surface-muted);
  color: var(--text-meta);
}

.toast__timer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: toast-timer var(--toast-duration, 5000ms) linear forwards;
}

@keyframes toast-timer {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* The bar is a countdown, not decoration that should keep running when the
   user has asked for no motion. Freezing it full-width says "paused". */
@media (prefers-reduced-motion: reduce) {
  .toast__timer {
    animation: none;
  }
}
</style>
