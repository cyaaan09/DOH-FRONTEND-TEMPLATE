<script setup>
import { computed, useId } from 'vue'

/**
 * A multi-line field carrying the same label, hint and error contract as TextField,
 * plus an optional character counter.
 */
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
  /**
   * Render the control alone — no label, no message. `FormField` owns both
   * inside a form grid, where the message slot is a RESERVED two-line box
   * shared with the error and the error badge is filled rather than an
   * outline ring. Drawing either here as well would double them.
   */
  bare: { type: Boolean, default: false },
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
    <div v-if="!bare" class="flex items-baseline justify-between gap-3">
      <label :for="id" class="text-field-label text-ink-700 mb-1.5">{{ label }}</label>
      <span v-if="counter" class="text-hint text-text-meta">{{ counter }}</span>
    </div>

    <textarea
      :id="id"
      :aria-label="bare ? label : undefined"
      class="field__input w-full resize-y rounded-field border px-3 py-2.75 text-body transition-colors"
      :class="[
        // Redline 'Error' and 'Read only' both set a border colour, so
        // this is one chain, not two independent ternaries — exactly one
        // border class must ever apply, never two competing for the same
        // property. Appendix C has no row for error+readonly together;
        // error wins because a field showing a validation error should
        // look like it — that is the more urgent signal.
        error ? 'border-red-700' : disabled || readonly ? 'border-hairline' : 'border-field',
        // Redline 'Read only' — input well surface, muted text.
        disabled || readonly ? 'bg-surface-input text-ink-400' : 'bg-surface text-ink-900',
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
