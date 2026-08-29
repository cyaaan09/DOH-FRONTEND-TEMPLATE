<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search' },
  label: { type: String, default: 'Search' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field relative flex items-center">
    <svg
      class="pointer-events-none absolute left-3 h-4 w-4 text-ink-400"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.6" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>

    <input
      class="field__input h-field w-full rounded-field border border-field bg-surface pl-9 pr-9 text-body text-ink-900 transition-colors"
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="label"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <button
      v-if="modelValue"
      data-clear
      type="button"
      class="field__clear absolute right-2"
      aria-label="Clear search"
      @click="emit('update:modelValue', '')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.field__clear {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
  line-height: 1;
}

.field__clear:hover {
  color: var(--ink-700);
  background: var(--surface-muted);
}

.field__clear:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
