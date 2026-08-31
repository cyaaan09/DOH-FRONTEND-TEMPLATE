<script setup>
/**
 * Redline "Token field · min-height 38px · pad 5px 8px · chips 26px
 * --green-100 / --green-text with × at .75 opacity".
 *
 * Grows with its contents rather than scrolling: a facility's service list is
 * the thing being edited, and hiding half of it behind a scrollbar inside a
 * 38px shell is how services get missed at inspection.
 */
defineProps({
  /** Array<string> — the chosen tokens. */
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Add…' },
  removeLabel: { type: String, default: 'Remove' },
})

defineEmits(['remove'])
</script>

<template>
  <div
    data-token-field
    class="token-field flex flex-wrap items-center rounded-field border border-field bg-surface"
  >
    <span
      v-for="token in modelValue"
      :key="token"
      data-token
      class="token flex items-center rounded-pill bg-green-100 text-chip text-green-text"
    >
      {{ token }}
      <button
        data-token-remove
        type="button"
        data-icon-button
        class="token__remove"
        :aria-label="`${removeLabel} ${token}`"
        @click="$emit('remove', token)"
      >
        ×
      </button>
    </span>
    <span data-token-placeholder class="token-field__placeholder text-body text-ink-500">{{
      placeholder
    }}</span>
  </div>
</template>

<style scoped>
.token-field {
  min-height: var(--h-field);
  gap: 6px;
  padding: 5px 8px;
}

/* Redline "chips 26px". */
.token {
  height: 26px;
  gap: 6px;
  padding: 0 4px 0 9px;
}

.token__remove {
  opacity: 0.75;
  cursor: pointer;
  padding: 0 3px;
  font-weight: 700;
}

@media (hover: hover) {
  .token__remove:hover {
    opacity: 1;
  }
}

.token-field__placeholder {
  padding-left: 4px;
}
</style>
