<script setup>
import { TooltipRoot, TooltipTrigger, TooltipPositioner, TooltipContent } from '@ark-ui/vue/tooltip'

/**
 * Redline "Rule · if it contains a button, it is a popover — a tooltip holds
 * one line of text and nothing else". So this takes a STRING, not a slot:
 * the constraint is the component's job to enforce, not the caller's to
 * remember.
 *
 * Redline "Tooltip a11y · aria-describedby · shows on keyboard focus too ·
 * never focusable itself" — all three come from Ark's machine; the tooltip
 * content is not a tab stop, and focusing the trigger opens it.
 */
defineProps({
  /** One line, under 48 characters, sentence case, no full stop. */
  label: { type: String, required: true },
  /** Redline "Tooltip timing · 120ms delay in, none out". */
  openDelay: { type: Number, default: 120 },
  closeDelay: { type: Number, default: 0 },
  placement: { type: String, default: 'top' },
})
</script>

<template>
  <TooltipRoot
    :open-delay="openDelay"
    :close-delay="closeDelay"
    :positioning="{ placement, gutter: 6 }"
  >
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPositioner>
      <TooltipContent data-tooltip class="tooltip rounded-tile">{{ label }}</TooltipContent>
    </TooltipPositioner>
  </TooltipRoot>
</template>

<style scoped>
/* Redline "Tooltip · pad 6px 9px · radius --r-tile · --ink-900 · 12px / 500
   --surface · nowrap". The chip is the one surface on the page that INVERTS,
   so it never reads as part of the layout.
   INFERRED for dark: Appendix C's Dark mode group has no tooltip row, and
   writing it as --ink-900 on --surface means it keeps inverting — a
   near-white chip on the dark canvas. That is the conventional reading, but
   it is a guess until the source says otherwise, and the dark sweep excepts
   it by name rather than by accident. */
.tooltip {
  padding: 6px 9px;
  background: var(--ink-900);
  color: var(--surface);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: var(--z-popover);
}
</style>
