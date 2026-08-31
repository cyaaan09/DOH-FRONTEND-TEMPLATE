<script setup>
/**
 * A card's action row. `spread` pushes the primary action to the far edge; `narrow`
 * tightens the gutter for dense cards.
 */
defineProps({
  /** The 20px gutter Appendix C allows for "cards under ~360px". */
  narrow: { type: Boolean, default: false },
  /**
   * Push the first child left and the rest right, for a footer that pairs a
   * caption with its action. The default keeps every child right-aligned,
   * which is what a row of buttons wants.
   */
  spread: { type: Boolean, default: false },
})
</script>

<template>
  <div
    data-card-footer
    class="flex items-center gap-2 bg-surface-sunken border-t border-divider"
    :class="[
      spread ? 'justify-between' : 'justify-end',
      narrow ? 'card-footer--narrow' : 'px-card-x py-3.5',
    ]"
  >
    <!-- Redline "Row gap" — 8px inside cards, not the default 10px
         button-row gap. No token exists for 8px, so this uses Tailwind's
         built-in gap-2, which is exactly 8px. -->
    <slot />
  </div>
</template>

<style scoped>
/* Appendix C "Card footer · pad 13-16px 20-24px" — the narrow end of both
   ranges, which is what the artifact's 300px demo card uses. */
.card-footer--narrow {
  padding: 12px 20px;
}
</style>
