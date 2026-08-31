<script setup>
import { computed } from 'vue'
import {
  CheckboxRoot,
  CheckboxControl,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxHiddenInput,
} from '@ark-ui/vue/checkbox'

const props = defineProps({
  /** Whether the box is checked. Ignored while `indeterminate` is true. */
  modelValue: { type: Boolean, default: false },
  /** The visible row label. */
  label: { type: String, required: true },
  /** Optional second line under the label. */
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  /**
   * Renders the mixed state. Exposed to assistive technology through the
   * native hidden input's `indeterminate` property, not an aria-checked
   * attribute — see Checkbox.spec.js "exposes the mixed state...".
   */
  indeterminate: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// Ark models the tri-state as a value of true | false | 'indeterminate'.
const checked = computed(() => (props.indeterminate ? 'indeterminate' : props.modelValue))

// One branch per state, each setting every property it owns — never a base
// class plus an override, which is this project's recurring defect.
const boxClass = computed(() => {
  if (props.disabled) return 'bg-surface-disabled border-soft text-ink-200'
  if (props.indeterminate || props.modelValue)
    return 'bg-green-fill border-green-fill text-green-on-fill'
  return 'bg-surface border-ink-100'
})
</script>

<template>
  <CheckboxRoot
    :checked="checked"
    :disabled="disabled"
    class="checkbox flex items-start"
    @checked-change="(details) => emit('update:modelValue', details.checked === true)"
  >
    <!-- Redline "Checkbox" — 17x17 from the shared control token, radius 5px,
         1.8px border set in the style block below. -->
    <CheckboxControl
      data-box
      class="checkbox__box grid h-check w-check flex-none place-items-center rounded-check border"
      :class="boxClass"
    >
      <!-- Redlines "Checkbox on" and "Indeterminate" — 10px/700 glyph, a dash
           for mixed. Decorative: the control itself carries the state.
           Visibility comes from CheckboxIndicator's own `hidden` prop
           (hidden = !indeterminate && !checked, independent of `disabled`),
           not from colour — a disabled-and-unchecked box previously showed
           a phantom checkmark because the old plain <span> always rendered
           text and relied on boxClass matching it to the background colour
           to hide it, which the disabled branch's opaque glyph colour broke.
           boxClass now only ever carries colour. -->
      <CheckboxIndicator
        :indeterminate="indeterminate"
        data-glyph
        aria-hidden="true"
        class="checkbox__glyph font-bold"
        >{{ indeterminate ? '–' : '✓' }}</CheckboxIndicator
      >
    </CheckboxControl>

    <span class="checkbox__text min-w-0">
      <!-- Redline "Label" — 13.5/400 ink-700, 10px from the box. -->
      <CheckboxLabel data-label class="checkbox__label block text-body text-ink-700">{{
        label
      }}</CheckboxLabel>
      <span v-if="hint" data-hint class="checkbox__hint block text-hint text-text-meta">{{
        hint
      }}</span>
    </span>

    <!-- `indeterminate` isn't one of CheckboxHiddenInput's declared props, so
         it falls through Vue's normal $attrs inheritance onto the native
         <input> this part renders. Vue's patchProp/shouldSetAsProp has no
         exclusion for `indeterminate` and it exists on HTMLInputElement, so
         Vue assigns it as a DOM property (el.indeterminate = ...) on every
         patch, including the very first one at mount — unlike Ark's own
         sync, which is driven by a change-only watcher (@zag-js/vue's
         track() wraps Vue's watch() without immediate: true) and never fires
         for a checkbox that mounts already indeterminate. Confirmed by
         running the "exposes the mixed state" test against this binding
         alone with no ref/onMounted/watch — see task-1-report.md. -->
    <CheckboxHiddenInput :indeterminate="indeterminate" />
  </CheckboxRoot>
</template>

<style scoped>
/* Redline "Checkbox" — 1.8px border. No border-width utility carries it. */
.checkbox__box {
  border-width: 1.8px;
  cursor: pointer;
}

/* Redline "Label" — gap 10px between box and text. */
.checkbox__text {
  margin-left: 10px;
}

/* Redlines "Checkbox on" / "Indeterminate" — glyph 10px. */
.checkbox__glyph {
  font-size: 10px;
  line-height: 1;
}

.checkbox[data-disabled] {
  cursor: not-allowed;
}

.checkbox:focus-within .checkbox__box {
  outline: none;
  box-shadow: var(--ring-focus);
}

.checkbox__hint {
  margin-top: 2px;
}
</style>
