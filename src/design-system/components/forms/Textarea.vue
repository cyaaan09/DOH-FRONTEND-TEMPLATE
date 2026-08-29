<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: 0 },
})

defineEmits(['update:modelValue'])

const id = useId()
const messageId = `${id}-message`
const message = computed(() => props.error || props.hint)
const counter = computed(() =>
  props.maxlength ? `${props.modelValue.length} / ${props.maxlength}` : '',
)
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-field-label text-ink-700 mb-1.5">{{ label }}</label>
      <span v-if="counter" class="text-hint text-text-meta">{{ counter }}</span>
    </div>

    <textarea
      :id="id"
      class="field__input w-full resize-y rounded-field border px-3 py-2.75 text-body transition-colors"
      :class="[
        // Redline 'Error' — strong red border, not the pale tint used
        // for toast and notice outlines.
        error ? 'border-red-700' : 'border-field',
        // Redline 'Read only' — input well surface, hairline border, muted text.
        disabled || readonly
          ? 'bg-surface-input border-hairline text-ink-400'
          : 'bg-surface text-ink-900',
      ]"
      :rows="rows"
      :value="modelValue"
      :maxlength="maxlength || undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="message ? messageId : undefined"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p
      v-if="message"
      :id="messageId"
      class="text-hint mt-1.25"
      :class="error ? 'text-red-700' : 'text-text-meta'"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
