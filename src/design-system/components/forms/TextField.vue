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
  /**
   * A unit shown inside the field, after the value — Appendix D.1's
   * `beds`. 12px/400 in the meta grey. NOT the redlined "Trailing action",
   * which this prop was previously styled as: that row (11.5/700, pad 6px)
   * describes the interactive `action` button below, and applying it here
   * made a static unit look like a control.
   */
  suffix: { type: String, default: '' },
  /**
   * A static trailing status word — Appendix D.1's `SYNCED` on the
   * read-only field. 11px/700 in the meta grey, the chip type step.
   */
  badge: { type: String, default: '' },
  /**
   * Label for a trailing text button — Appendix D.1's `SHOW` / `HIDE` on
   * the password field. This is the redlined "Trailing action": 11.5/700,
   * the meta grey, pad 6px. Emits `action` when clicked; the parent owns what it
   * does, so the same button serves reveal, clear, or unlock.
   */
  action: { type: String, default: '' },
  /**
   * A muted qualifier after the label — Appendix D.1's `· with leading
   * icon` and `· read only`. Rendered inside the <label> so it stays part
   * of the field's accessible name, which is how the artifact reads it.
   */
  qualifier: { type: String, default: '' },
  /**
   * Render the control alone — no label, no message. `FormField` owns both
   * inside a form grid, where the message slot is a RESERVED two-line box
   * shared with the error and the error badge is filled rather than an
   * outline ring. Drawing either here as well would double them.
   */
  bare: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'action'])

const id = useId()
const messageId = `${id}-message`
const message = computed(() => props.error || props.hint)
</script>

<template>
  <div class="flex flex-col">
    <!-- Appendix D.1 — the qualifier is a text node's worth of space then a
         muted span, both inside the <label>, so `Search · with leading icon`
         reads as one accessible name. The space must sit on this line: Vue's
         whitespace: 'condense' drops any run that contains a newline. -->
    <label v-if="!bare" :for="id" class="text-field-label text-ink-700 mb-1.5">
      {{ label }} <span v-if="qualifier" data-qualifier class="text-ink-500">{{ qualifier }}</span>
    </label>

    <div class="relative flex items-center">
      <input
        :id="id"
        class="field__input h-field w-full rounded-field border px-3 text-body transition-colors"
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
          mono ? 'font-mono' : '',
          suffix || badge || action ? 'pr-14' : '',
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
      <!-- Appendix D.1 — three distinct trailing treatments, mutually
           exclusive. A unit is quiet body-adjacent text; a badge is a chip-
           weight status word; only the action is a control. -->
      <span v-if="suffix" data-suffix class="absolute right-3 text-hint text-text-meta">{{
        suffix
      }}</span>
      <span v-else-if="badge" data-badge class="absolute right-3 text-chip text-text-meta">{{
        badge
      }}</span>
      <!-- Redline "Trailing action" — 11.5px/700, meta grey, 6px padding. -->
      <button
        v-else-if="action"
        data-action
        type="button"
        class="field__action absolute right-2.5 text-stat-hint font-bold text-text-meta p-1.5"
        @click="$emit('action')"
      >
        {{ action }}
      </button>
    </div>

    <!-- Appendix D.1 — an ERROR carries a 13px ring glyph before its text at
         a 7px gap; a hint is text alone. Built as one <p> for both, the
         error lost its glyph. -->
    <div v-if="error && !bare" :id="messageId" class="field__error mt-1.25 flex">
      <span data-error-glyph aria-hidden="true" class="field__error-glyph flex-none rounded-pill" />
      <span class="field__error-text text-hint text-red-700">{{ error }}</span>
    </div>
    <p v-else-if="hint && !bare" :id="messageId" class="text-hint text-text-meta mt-1.25">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
/* Appendix D.1 — the error row: 7px between a 13px ring and its text, the
   ring nudged 1px down to sit on the text's cap height. 1.45 line-height is
   tighter than a hint's default because an error wraps more often. */
.field__error {
  gap: 7px;
}

.field__error-glyph {
  width: 13px;
  height: 13px;
  border: 1.6px solid var(--red-700);
  margin-top: 1px;
}

.field__error-text {
  line-height: 1.45;
}

/* The focus ring is the only focus signal — spec §4.2 routes it via var(). */
.field__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}
</style>
