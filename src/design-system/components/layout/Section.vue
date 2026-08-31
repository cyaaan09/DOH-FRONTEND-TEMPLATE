<script setup>
/**
 * Redline "Section · one card + 22px below · cards never nest — divide
 * (1px --divider) or sink (--surface-sunken) instead".
 *
 * The no-nesting rule is the reason this exists as a primitive rather than a
 * div: a Section IS the card, so there is no way to put one inside another
 * without it reading as a mistake. `DividedCard` and the sunken strip are the
 * two sanctioned alternatives.
 */
</script>

<template>
  <section
    data-ds-section
    class="ds-section overflow-hidden rounded-card border border-hairline bg-surface shadow-card"
  >
    <slot />
  </section>
</template>

<style scoped>
/* Redline "one card + 22px below" — --gap-section is exactly that 22px. */
.ds-section {
  margin-bottom: var(--gap-section);
}
</style>
