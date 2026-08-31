<script setup>
import { useId } from 'vue'
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
   * component's label never draws. getRootProps() also always sets
   * aria-labelledby to that unrendered label's id, which would otherwise
   * dangle; the template neutralises it (see the comment there).
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

// Redline "Fields" (ARIA & semantics) — hint via aria-describedby. One id
// per option, keyed by array position rather than option.value: values are
// consumer data with no guarantee of being DOM-id-safe (this file's own
// fixture already has one containing "/"), while the index is always a
// valid id token.
const groupId = useId()
function hintId(index) {
  return `${groupId}-hint-${index}`
}

// Appendix D.1 — a disabled label drops to --ink-200. Previously every
// label rendered at --ink-700 regardless, so only the control dimmed.
function labelClass(option) {
  return option.disabled ? 'text-ink-200' : 'text-ink-700'
}

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
    :aria-labelledby="undefined"
    class="radio flex flex-col"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <!-- aria-labelledby above overrides Ark's own getRootProps() value (the
         id of the RadioGroupLabel this component never renders) through the
         same attrs-fallthrough mechanism that delivers aria-label itself:
         Vue's cloneVNode(root, fallthroughAttrs) merges consumer attrs after
         the part's own props, so they win on shared keys, and patchAttr
         treats an undefined value as "remove the attribute" rather than the
         literal string "undefined". Left alone, aria-labelledby would
         dangle — pointing at an id with no matching element anywhere in the
         DOM. Verified in Radio.spec.js "names the group without drawing the
         name"; do not remove this without re-checking that assertion. -->
    <RadioGroupItem
      v-for="(option, index) in options"
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
        <RadioGroupItemText
          data-label
          class="radio__label block text-body"
          :class="labelClass(option)"
          >{{ option.label }}</RadioGroupItemText
        >
        <span
          v-if="option.hint"
          :id="hintId(index)"
          data-hint
          class="radio__hint block text-hint text-text-meta"
          >{{ option.hint }}</span
        >
      </span>

      <RadioGroupItemHiddenInput :aria-describedby="option.hint ? hintId(index) : undefined" />
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

/* Redline "Focus ring" — :focus-visible -> border var(--green-500) + ring.
   Targets the control directly via [data-focus-visible] rather than a
   :focus-within ancestor: Zag's getItemControlProps() already scopes
   focusVisible PER ITEM (itemState.focusVisible checks this item's own
   value against context.focusVisibleValue), so there is no need to re-scope
   it through an item-level selector the way :focus-within needed — a
   group-level [data-focus-visible] would have been the Checkbox mistake
   repeated (ringing every item at once), but this attribute never appears
   on more than one item's control simultaneously. Also replaces
   :focus-within because it matched a mouse click landing on the hidden
   input, not just a keyboard focus — see Checkbox.vue's identical rule.
   border-color is new here too, to match TextField.vue's :focus rule — the
   control already carries a permanent 1.8px border (above), so this only
   ever changes its colour, never its width. */
.radio__control[data-focus-visible] {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.radio__hint {
  margin-top: 2px;
}
</style>
