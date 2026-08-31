<script setup>
import {
  RadioGroupRoot,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemText,
  RadioGroupItemHiddenInput,
} from '@ark-ui/vue/radio-group'

const props = defineProps({
  /** Array<{ value, label, hint?, disabled? }>, in display order. */
  options: { type: Array, required: true },
  /** The chosen option's value, or '' when nothing is chosen. */
  modelValue: { type: String, default: '' },
  /**
   * Names the group for assistive technology, via aria-label on the
   * [role="radiogroup"] root. NOT rendered (§8.1). Ark's own RadioGroupLabel
   * part is deliberately unused: it renders a visible element, and this
   * component's label never draws.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

// One branch per state, each setting every property it owns — never a base
// class plus an override, which is this project's recurring defect.
function controlClass(option) {
  if (option.disabled) return 'bg-surface-disabled border-soft'
  if (option.value === props.modelValue) return 'bg-surface border-green-fill'
  return 'bg-surface border-ink-100'
}

// Redline "Radio" — 8px inner dot in the fill green. "Chosen" is checked
// before "disabled", the reverse of controlClass above: this keeps
// invisibility tied only to chosen-ness, so it can never depend on which
// other branch happens to run, the same fix CheckboxIndicator embodies
// (hidden purely by checked state, independent of disabled) applied by hand
// here since radio-group has no per-item indicator part to delegate to --
// confirmed against the installed @ark-ui/vue/radio-group export list, whose
// only "indicator" (RadioGroupIndicator) is a single group-level positioned
// overlay, not a per-item part. bg-transparent does not repeat Checkbox's
// old phantom-glyph bug: that bug hid a glyph by matching its text colour to
// one specific branch's background, which broke the moment a different
// branch used a different background. bg-transparent has no background to
// match — it is invisible against any of them.
function dotClass(option) {
  if (option.value !== props.modelValue) return 'bg-transparent'
  return option.disabled ? 'bg-ink-200' : 'bg-green-fill'
}
</script>

<template>
  <RadioGroupRoot
    :model-value="modelValue"
    :aria-label="label"
    class="radio flex flex-col"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <RadioGroupItem
      v-for="option in options"
      :key="option.value"
      data-item
      :value="option.value"
      :disabled="option.disabled"
      class="radio__item flex items-start"
    >
      <!-- Redline "Radio" — 17x17 from the shared control token, rounded
           fully (pill) rather than the checkbox's 5px, 1.8px border set in
           the style block below. -->
      <RadioGroupItemControl
        data-control
        class="radio__control grid h-check w-check flex-none place-items-center rounded-pill border"
        :class="controlClass(option)"
      >
        <span
          data-dot
          aria-hidden="true"
          class="radio__dot rounded-pill"
          :class="dotClass(option)"
        />
      </RadioGroupItemControl>

      <span class="radio__text min-w-0">
        <!-- Redline "Label" — 13.5/400 ink-700, 10px from the control. -->
        <RadioGroupItemText data-label class="radio__label block text-body text-ink-700">{{
          option.label
        }}</RadioGroupItemText>
        <span v-if="option.hint" data-hint class="radio__hint block text-hint text-text-meta">{{
          option.hint
        }}</span>
      </span>

      <RadioGroupItemHiddenInput />
    </RadioGroupItem>
  </RadioGroupRoot>
</template>

<style scoped>
/* Redline "Row gap" — 11px between items. */
.radio {
  gap: 11px;
}

.radio__item {
  cursor: pointer;
}

.radio__item[data-disabled] {
  cursor: not-allowed;
}

/* Redline "Radio" — 1.8px border. No border-width utility carries it. */
.radio__control {
  border-width: 1.8px;
}

/* Redline "Radio" — inner dot 8px. */
.radio__dot {
  width: 8px;
  height: 8px;
}

/* Redline "Label" — gap 10px between control and text. */
.radio__text {
  margin-left: 10px;
}

/* Scoped to the item, not the group root: with several items per component
   instance, a group-level :focus-within (Checkbox's pattern, correct there
   because it only ever has one control) would ring every item's control at
   once whenever any one of their inputs had focus. */
.radio__item:focus-within .radio__control {
  outline: none;
  box-shadow: var(--ring-focus);
}

.radio__hint {
  margin-top: 2px;
}
</style>
