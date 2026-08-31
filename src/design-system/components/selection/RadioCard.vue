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
  /** Array<{ value, label, hint?, disabled? }>, in display order. Same option
   *  shape as Radio. */
  options: { type: Array, required: true },
  /** The chosen option's value, or '' when nothing is chosen. */
  modelValue: { type: String, default: '' },
  /**
   * Names the group for assistive technology, via aria-label on the
   * [role="radiogroup"] root. NOT rendered (§8.1) — same treatment as
   * Radio.vue, including the dangling aria-labelledby neutralised below.
   */
  label: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

// Redline "Fields" (ARIA & semantics) — hint via aria-describedby. Same
// index-keyed id scheme as Radio.vue's identical binding — see the comment
// there for why the index, not option.value, anchors the id.
const groupId = useId()
function hintId(index) {
  return `${groupId}-hint-${index}`
}

function isChosen(option) {
  return option.value === props.modelValue
}

// Redline "Radio" — 17x17 rounded-pill, 1.8px border, 8px dot. Values reused
// verbatim from Radio.vue's controlClass/dotClass rather than re-derived;
// the branch ORDER is reused too — "chosen" checked before "disabled" here,
// the reverse of cardClass below, which keeps dot invisibility tied only to
// chosen-ness regardless of which other branch runs (Radio.vue's own
// comment on this same ordering).
// Appendix D.1's per-control type table — a card label is 13.5/500
// --ink-900, unlike the plain radio list's 13.5/400 --ink-700, and drops to
// --ink-200 disabled.
function labelClass(option) {
  return option.disabled ? 'text-ink-200' : 'text-ink-900'
}

function controlClass(option) {
  if (option.disabled) return 'bg-surface-disabled border-soft'
  if (isChosen(option)) return 'bg-surface border-green-fill'
  return 'bg-surface border-ink-100'
}

function dotClass(option) {
  if (!isChosen(option)) return 'bg-transparent'
  return option.disabled ? 'bg-ink-200' : 'bg-green-fill'
}

// Redline "Card" / "Card selected" — a two-branch conditional; each branch
// sets border AND background, never left to emit order (this project's
// recurring defect). Only two branches: Appendix C gives this group no
// third "card disabled" row, so a disabled option's card surface reads the
// same as any other unchosen card — the disabled dress lives entirely on
// the control above.
function cardClass(option) {
  return isChosen(option)
    ? 'border-green-500 bg-green-tint-2 card--selected'
    : 'border-hairline bg-surface'
}
</script>

<template>
  <RadioGroupRoot
    :model-value="modelValue"
    :aria-label="label"
    :aria-labelledby="undefined"
    class="radiocard flex flex-col"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <!-- aria-labelledby neutralises Ark's own getRootProps() value, which
         points at the id of a RadioGroupLabel this component never renders
         and would otherwise dangle — same mechanism and same fix as
         Radio.vue; see the comment there for how the override reaches the
         DOM through attrs fallthrough. -->
    <RadioGroupItem
      v-for="(option, index) in options"
      :key="option.value"
      data-card
      :value="option.value"
      :disabled="option.disabled"
      class="card flex items-start border"
      :class="cardClass(option)"
    >
      <!-- Appendix D.1 — the card is ONE flex row of three children
           (control, text, marker) with an 11px gap, not a column wrapping a
           row. Built as a column, the "Selected" marker stacked under the
           hint instead of sitting at the card's right edge. -->
      <!-- Redline "Radio" — same control token as Radio.vue: 17x17,
           rounded fully, 1.8px border set in the style block below. -->
      <RadioGroupItemControl
        data-control
        class="radiocard__control grid h-check w-check flex-none place-items-center rounded-pill border"
        :class="controlClass(option)"
      >
        <span
          data-dot
          aria-hidden="true"
          class="radiocard__dot rounded-pill"
          :class="dotClass(option)"
        />
      </RadioGroupItemControl>

      <span class="radiocard__text min-w-0 flex-1">
        <RadioGroupItemText
          data-label
          class="radiocard__label block text-body font-medium"
          :class="labelClass(option)"
          >{{ option.label }}</RadioGroupItemText
        >
        <span
          v-if="option.hint"
          :id="hintId(index)"
          data-hint
          class="radiocard__hint block text-hint text-text-meta"
          >{{ option.hint }}</span
        >
      </span>

      <!-- Appendix D.1 — the chosen card's "Selected" marker is an inline
           pill at the row's right edge (--green-100 on --green-text at the
           11/700 chip step), the row's third flex child at flex:none.
           Not aria-hidden: Ark's getItemHiddenInputProps() points the
           input's aria-labelledby at RadioGroupItemText's id specifically
           (confirmed in @zag-js/radio-group's connect module), not at this
           whole label, so this text never bleeds into the input's
           accessible name — it is exposed as ordinary readable content, the
           same way option.hint already is above. -->
      <span
        v-if="isChosen(option)"
        data-selected-marker
        class="radiocard__marker flex-none rounded-pill bg-green-100 text-chip text-green-text"
        >Selected</span
      >

      <RadioGroupItemHiddenInput :aria-describedby="option.hint ? hintId(index) : undefined" />
    </RadioGroupItem>
  </RadioGroupRoot>
</template>

<style scoped>
/* Appendix D.1's row-gap table — cards sit 8px apart, not the 11px the
   plain checkbox and radio lists use. Applies between cards, not within
   one; the 11px inside a card is `.card`'s own flex gap below. */
.radiocard {
  gap: 8px;
}

/* Redline "Card" — pad 13px 14px, radius 11px (no token: --r-panel is 12px,
   --r-card is 14px). The 11px gap now separates the row's three children —
   control, text, marker — since the card is a single flex row. */
.card {
  padding: 13px 14px;
  border-radius: 11px;
  gap: 11px;
  cursor: pointer;
  /* Appendix D.1 — selectCardStyle sets user-select:none and transitions
     only border-color, at the 120ms control duration. */
  user-select: none;
  transition: border-color var(--t-control) ease;
}

.card[data-disabled] {
  cursor: not-allowed;
}

/* Redline "Card selected" — see CheckboxCard.vue's identical rule for why
   this uses --ring-select rather than a new token. */
.card--selected {
  box-shadow: var(--ring-select);
}

/* Redline "Radio" — 1.8px border. No border-width utility carries it. */
.radiocard__control {
  border-width: 1.8px;
}

/* Redline "Radio" — inner dot 8px. */
.radiocard__dot {
  width: 8px;
  height: 8px;
}

/* Appendix D.1 — the control-to-text gap is the card's own 11px flex gap
   (above), not a margin on the text: with the marker as a third child, a
   margin here would apply to the wrong edge. */

/* Redline "Focus ring" — :focus-visible -> border var(--green-500) + ring.
   Targets the control directly via [data-focus-visible], scoped per item by
   Zag itself (getItemControlProps()) rather than through a :focus-within
   ancestor — same mechanism and same reasoning as Radio.vue's identical
   rule, which also explains why a group-level selector was never needed
   here even before this change. Also replaces :focus-within because it
   matched a mouse click landing on the hidden input, not just a keyboard
   focus. border-color is new here too, to match TextField.vue's :focus
   rule — the control already carries a permanent 1.8px border (above), so
   this only ever changes its colour, never its width. */
.radiocard__control[data-focus-visible] {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.radiocard__hint {
  margin-top: 2px;
}
</style>

/* Appendix D.1 — the marker pill: pad 3px 9px on --green-100. Its radius and type come from the
shared rounded-pill / text-chip utilities. */ .radiocard__marker { padding: 3px 9px; }
