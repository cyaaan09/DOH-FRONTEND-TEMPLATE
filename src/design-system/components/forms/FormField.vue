<script setup>
import { computed, useId } from 'vue'

/**
 * A field in a form grid: its label, its required/optional mark, its control,
 * and ONE message slot shared by help text and the error.
 *
 * Redline "Help/error slot · one shared slot per field: 5px below the
 * control, min-height 32px, line-height 1.35 — reserved for two lines so
 * validating never reflows the row". The reservation is the point: a form
 * that grows when a field goes invalid pushes everything below it down, and
 * the user loses their place at exactly the moment they need it.
 */
const props = defineProps({
  label: { type: String, required: true },
  /** Help text, shown while there is no error. */
  hint: { type: String, default: '' },
  /** REPLACES the hint in the shared slot — never appears beside it. */
  error: { type: String, default: '' },
  /**
   * Redline "Required mark · used on required fields only" and "Optional
   * mark". Most fields are required, so the grey `optional` marks the few
   * that are not and the asterisk carries the rest.
   */
  required: { type: Boolean, default: false },
  optional: { type: Boolean, default: false },
})

const id = useId()
const messageId = `${id}-message`
const describedBy = computed(() => (props.hint || props.error ? messageId : undefined))
</script>

<template>
  <div data-form-field class="form-field min-w-0">
    <div class="form-field__label-row flex items-baseline">
      <span data-label class="text-field-label text-ink-700">{{ label }}</span>
      <span
        v-if="required"
        data-required
        aria-hidden="true"
        class="form-field__required text-red-700"
        >*</span
      >
      <span v-else-if="optional" data-optional class="form-field__optional text-ink-300"
        >optional</span
      >
    </div>

    <!-- The control arrives bare: FormField owns the label and the message. -->
    <slot :described-by="describedBy" />

    <!-- Redline "Error text · REPLACES help text in the shared slot" — one
         element, two states, so the row's height never depends on which. -->
    <div
      :id="messageId"
      data-message
      class="form-field__message"
      :class="error ? 'form-field__message--error' : 'text-text-meta'"
    >
      <template v-if="error">
        <span
          data-error-badge
          aria-hidden="true"
          class="form-field__badge grid flex-none place-items-center rounded-pill"
          >!</span
        >
        <span class="min-w-0">{{ error }}</span>
      </template>
      <template v-else>{{ hint }}</template>
    </div>
  </div>
</template>

<style scoped>
.form-field__label-row {
  gap: 4px;
  margin-bottom: 6px;
}

/* Redline "Required mark · * --red-700 · 4px gap". aria-hidden because the
   requirement belongs on the control as `required`, not read as a literal
   asterisk in the middle of the label. */
.form-field__required {
  font-size: 12.5px;
}

/* Redline "Optional mark · 11.5px --ink-300 lowercase". */
.form-field__optional {
  font-size: 11.5px;
}

/* Redline "Help/error slot · 5px below the control, min-height 32px,
   line-height 1.35". The min-height is what reserves two lines. */
.form-field__message {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  min-height: 32px;
  margin-top: 5px;
  font-size: 11.5px;
  line-height: 1.35;
}

.form-field__message--error {
  font-weight: 500;
  color: var(--red-700);
}

/* Redline "Error text · 13px round ! badge, align-items flex-start". Filled,
   unlike the outline ring TextField draws in the Text fields section — the
   two sections dress the same signal differently and both are D.1 facts. */
.form-field__badge {
  width: 13px;
  height: 13px;
  margin-top: 1px;
  background: var(--red-700);
  color: var(--red-on-fill);
  font-size: 9px;
  font-weight: 700;
}
</style>
