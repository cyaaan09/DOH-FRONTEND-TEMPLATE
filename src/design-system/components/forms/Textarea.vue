<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])

const id = useId()
const counter = computed(() =>
  props.maxlength ? `${props.modelValue.length} / ${props.maxlength}` : '',
)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-field-label text-ink-700">{{ label }}</label>
      <span v-if="counter" class="text-hint text-text-meta">{{ counter }}</span>
    </div>

    <textarea
      :id="id"
      class="field__input w-full resize-y rounded-field border border-field bg-surface px-3 py-2 text-body text-ink-900 transition-colors"
      :rows="rows"
      :value="modelValue"
      :maxlength="maxlength || undefined"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p v-if="hint" class="text-hint text-text-meta">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
