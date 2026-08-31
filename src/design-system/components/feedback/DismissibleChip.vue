<script setup>
/**
 * An applied-filter chip whose × is a real <button> with its own aria-label, not a
 * glyph. Emits the filter's key so the caller removes it by identity rather than by
 * index.
 */
defineProps({
  chipKey: { type: String, required: true },
  value: { type: String, required: true },
})

const emit = defineEmits(['dismiss'])
</script>

<template>
  <span
    class="chip inline-flex items-center gap-1.5 rounded-pill text-chip whitespace-nowrap bg-surface border border-soft text-ink-600"
  >
    <span class="text-ink-500">{{ chipKey }}</span>
    <span>{{ value }}</span>
    <button
      type="button"
      data-icon-button
      class="chip__remove"
      :aria-label="`Remove ${chipKey} ${value}`"
      @click="emit('dismiss', { chipKey, value })"
    >
      ×
    </button>
  </span>
</template>

<style scoped>
.chip {
  padding: var(--chip-pad);
}

/* Redline "Dismiss ×" — a filled 17px circle, not a bare glyph: border-card
 * background, border-field on hover, ink-600 glyph (the ink-500/text-meta
 * colour this used to share with the icon strokes fails at 4.05:1). */
.chip__remove {
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: var(--border-card);
  color: var(--ink-600);
  cursor: pointer;
  line-height: 1;
}

@media (hover: hover) {
  .chip__remove:hover {
    background: var(--border-field);
  }
}

.chip__remove:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
