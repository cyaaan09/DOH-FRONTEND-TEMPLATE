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
  type: { type: String, default: 'text' },
  mono: { type: Boolean, default: false },
  suffix: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const id = useId()
const messageId = `${id}-message`
const message = computed(() => props.error || props.hint)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-field-label text-ink-700">{{ label }}</label>

    <div class="relative flex items-center">
      <input
        :id="id"
        class="field__input h-field w-full rounded-field border px-3 text-body text-ink-900 transition-colors"
        :class="[
          error ? 'border-red-border' : 'border-field',
          disabled || readonly ? 'bg-surface-input text-ink-500' : 'bg-surface',
          mono ? 'font-mono' : '',
          suffix ? 'pr-14' : '',
        ]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="message ? messageId : undefined"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span v-if="suffix" class="absolute right-3 text-hint text-ink-500">{{ suffix }}</span>
    </div>

    <p
      v-if="message"
      :id="messageId"
      class="text-hint"
      :class="error ? 'text-red-700' : 'text-text-meta'"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
/* The focus ring is the only focus signal — spec §4.2 routes it via var(). */
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
