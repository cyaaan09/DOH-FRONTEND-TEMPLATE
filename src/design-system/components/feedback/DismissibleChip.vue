<script setup>
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

.chip__remove {
  display: grid;
  place-items: center;
  width: 14px;
  height: 14px;
  flex: none;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
  line-height: 1;
}

.chip__remove:hover {
  color: var(--ink-700);
  background: var(--surface-muted);
}

.chip__remove:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
