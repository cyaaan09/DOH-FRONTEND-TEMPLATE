<script setup>
import { computed } from 'vue'
import Checkbox from './Checkbox.vue'

/**
 * A checkbox presented as a selectable card, for choices that need a description rather
 * than a single line.
 */
const props = defineProps({
  /** Whether the card is chosen. Same prop shape as Checkbox. */
  modelValue: { type: Boolean, default: false },
  /** The visible row label, relayed to the nested Checkbox. */
  label: { type: String, required: true },
  /** Optional second line under the label. */
  hint: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

// Redline "Card" / "Card selected" — a two-branch conditional; each branch
// sets border AND background, never left to emit order (this project's
// recurring defect, per Checkbox.vue's own boxClass and StatCard.vue's
// selected-state precedent). No "disabled" branch here: Appendix C gives
// this group exactly two card states, and Checkbox itself already carries
// its own disabled dress independent of the surface around it.
const cardClass = computed(() =>
  props.modelValue
    ? 'border-green-500 bg-green-tint-2 card--selected'
    : 'border-hairline bg-surface',
)

// Appendix D's Selection controls description — "whole row clickable".
// RadioCard's card IS the <label> (its root is Ark's own RadioGroupItem,
// whose getRootProps() -> normalize.label), so its entire padded surface is
// native label-click territory. This card instead wraps Checkbox (above),
// whose own root is ALSO a <label> but only as wide as its box + text
// content — the padding this wrapping <div> adds around it sits outside
// that label and is native-click-dead. A click landing there is forwarded
// to the same event Checkbox itself emits. A click landing inside the
// nested <label> is left alone — it already toggles natively there, and
// forwarding it too would double-toggle: the browser re-dispatches a
// synthetic click at the label's control that also bubbles back up through
// this div.
function onCardClick(event) {
  if (props.disabled) return
  const label = event.target.closest('label')
  if (label && event.currentTarget.contains(label)) return
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div
    data-card
    class="card flex flex-col border"
    :class="cardClass"
    :data-disabled="disabled ? '' : undefined"
    @click="onCardClick"
  >
    <Checkbox
      emphasis
      :model-value="modelValue"
      :label="label"
      :hint="hint"
      :disabled="disabled"
      @update:model-value="(value) => emit('update:modelValue', value)"
    />
  </div>
</template>

<style scoped>
/* Redline "Card" — pad 13px 14px, radius 11px. No token carries the radius:
   --r-panel is 12px and --r-card is 14px, so this is scoped rather than a
   rounded-* utility. */
/* Appendix D.1 — the card's own flex gap is 11px, and that governs the
   distance from the box to the label too. CheckboxCard composes Checkbox
   rather than re-rendering Ark's parts, so it hands the value down through
   --checkbox-gap; declaring margin-left again here would be a second rule
   for one property, which is this codebase's recurring defect. */
.card {
  --checkbox-gap: 11px;
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

/* Redline "Card selected" — ring shadow has no utility namespace (spec
   §4.2: --ring-select is deliberately unbridged), so it is applied here
   rather than through a class that would compete with a bg/border utility
   for the same property. This group's own "Card selected" row and the
   Stat-cards group's row of the same name state the ring at two different
   alphas for the same colour — --ring-select carries the Stat-cards value,
   which sits inside the range the two rows together imply, so the frozen
   token layer does not grow for the 0.02 difference. */
.card--selected {
  box-shadow: var(--ring-select);
}
</style>
