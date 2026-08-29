<template>
  <div class="chip-group flex flex-wrap items-center">
    <slot />
  </div>
</template>

<style scoped>
/* Redline "Gap in row" (Chips) says 7px. The source document's own verbatim
 * token block says --gap-chip-row: 8px, and tokens.css reproduces that
 * value byte-for-byte with a test guarding it — a genuine contradiction in
 * the source, not a drift bug. Spec §2 rules Appendix C wins where the two
 * disagree, so this sets the row gap directly rather than through the
 * token: tokens.css stays untouched and --gap-chip-row remains defined but
 * unused here. Do not "fix" this back to the gap-chip-row utility. */
.chip-group {
  gap: 7px;
}
</style>
