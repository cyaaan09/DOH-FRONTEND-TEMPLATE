<script setup>
/**
 * Redline "Hinted trigger · inline text that owns a tooltip takes a 1px
 * dashed underline in its own tone + cursor help".
 *
 * The underline is the whole point: a tooltip that only appears on hover with
 * no visible affordance is invisible to anyone who does not happen to hover
 * there. Pair it with `Tooltip`, which supplies the keyboard path.
 */
defineProps({
  /** Matches the text's own tone, so the underline never introduces a colour. */
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'green', 'amber', 'red', 'blue', 'violet'].includes(v),
  },
})

const UNDERLINE = {
  neutral: 'border-soft',
  green: 'border-toast-border-green',
  amber: 'border-toast-border-amber',
  red: 'border-red-border',
  blue: 'border-toast-border-blue',
  violet: 'border-violet-100',
}
</script>

<template>
  <span data-hinted class="hinted" :class="UNDERLINE[tone]"><slot /></span>
</template>

<style scoped>
.hinted {
  border-bottom-width: 1px;
  border-bottom-style: dashed;
  cursor: help;
}
</style>
