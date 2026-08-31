<script setup>
import { computed } from 'vue'
import Checkbox from './Checkbox.vue'

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
</script>

<template>
  <div data-card class="card flex flex-col border" :class="cardClass">
    <Checkbox
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
.card {
  padding: 13px 14px;
  border-radius: 11px;
  gap: 11px;
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
