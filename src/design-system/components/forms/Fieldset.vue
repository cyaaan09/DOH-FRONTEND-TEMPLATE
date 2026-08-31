<script setup>
/**
 * Redline "Fieldset label · 10.5px / 700 / 0.08em --text-header + 1px
 * --divider rule · 24px above, 14px below".
 *
 * A rule, not a card — the Containers group forbids nesting, so a form's
 * sections divide rather than stacking cards inside a card. The section's own
 * rule card says so: "Sections are rules, not cards".
 */
defineProps({
  label: { type: String, required: true },
  /** The first fieldset in a form sits flush; the rest take the 24px above. */
  first: { type: Boolean, default: false },
})
</script>

<template>
  <div data-fieldset class="fieldset" :class="first ? '' : 'fieldset--spaced'">
    <div class="fieldset__head flex items-baseline">
      <div data-fieldset-label class="text-column-header text-text-header">{{ label }}</div>
      <span aria-hidden="true" class="fieldset__rule" />
    </div>
    <slot />
  </div>
</template>

<style scoped>
.fieldset--spaced {
  margin-top: 24px;
}

.fieldset__head {
  gap: 10px;
  margin-bottom: 14px;
}

.fieldset__rule {
  flex: 1;
  height: 1px;
  background: var(--divider);
}
</style>
