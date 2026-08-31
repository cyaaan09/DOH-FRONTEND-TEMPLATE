<script setup>
import { computed } from 'vue'
import Checkbox from './Checkbox.vue'
import Button from '../forms/Button.vue'

const props = defineProps({
  /** Selectable rows, in display order: { id, name, number }. */
  rows: { type: Array, required: true },
  /** Selected row ids. */
  modelValue: { type: Array, default: () => [] },
  /**
   * Bulk actions offered once something is selected: { value, label }.
   * Appendix C has no dedicated redline for these, so they render as
   * ordinary Secondary/Compact Buttons rather than inventing new chrome.
   */
  actions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'action'])

const selectedCount = computed(() => props.modelValue.length)
const hasSelection = computed(() => selectedCount.value > 0)
const allSelected = computed(
  () => props.rows.length > 0 && selectedCount.value === props.rows.length,
)
// Mixed exactly when some but not all rows are chosen — Checkbox's own
// `indeterminate` prop, not an aria-checked attribute (see its "exposes the
// mixed state" comment and this component's spec, "shows the header box
// mixed...").
const isIndeterminate = computed(() => hasSelection.value && !allSelected.value)

// Appendix D.1 — the header label is a live count, not a static string:
// "Select all" at zero, "<n> selected" otherwise.
const headerLabel = computed(() =>
  hasSelection.value ? `${selectedCount.value} selected` : 'Select all',
)

// Redline "Bulk bar" — one binding, both branches: sunken idle, green tint
// once anything is selected. Never a base class plus a conditional
// override — this project's recurring defect (Checkbox.vue's boxClass,
// CheckboxCard.vue's cardClass do the same).
const barClass = computed(() => (hasSelection.value ? 'bg-green-tint' : 'bg-surface-sunken'))

function isSelected(id) {
  return props.modelValue.includes(id)
}

// Redline "Selected row" — bg-green-tint-2 with a 1px top rule in
// border-divider-row, both scoped to the selected state alone; Appendix C
// gives this group no separate "Row idle" line, so an unselected row
// carries neither class rather than a guessed one — nothing is ever left to
// compete with the selected branch for the same property.
function rowClass(id) {
  return isSelected(id) ? 'bg-green-tint-2 border-t border-divider-row' : ''
}

function toggleAll(checked) {
  emit('update:modelValue', checked ? props.rows.map((row) => row.id) : [])
}

function toggleRow(id, checked) {
  const next = checked
    ? [...props.modelValue, id]
    : props.modelValue.filter((rowId) => rowId !== id)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="bulk-action-bar flex flex-col">
    <!-- Redline "Bulk bar" — pad 11px 16px, sunken idle / green tint active. -->
    <div data-bulk-bar class="bulk-bar flex items-center justify-between" :class="barClass">
      <!-- The header box composes Checkbox exactly like every row below,
           passing the live count straight through as its label: Checkbox
           renders it via its own data-label hook (Task 1), so Ark's
           aria-labelledby resolves to real, non-empty text and the native
           input has a genuine accessible name (WCAG 4.1.2, spec §18
           baseline 2.1 AA). An earlier version kept this box unlabelled and
           read the visible text from a separate sibling span to avoid
           rendering it twice — unneeded, since Checkbox has exactly one
           label slot and one call site here, so nothing competes with it.
           See this component's spec, "gives the header checkbox a real
           accessible name". -->
      <Checkbox
        data-bulk-box
        :model-value="allSelected"
        :indeterminate="isIndeterminate"
        :label="headerLabel"
        @update:model-value="toggleAll"
      />

      <div v-if="hasSelection" class="bulk-bar__actions flex items-center gap-2">
        <Button
          v-for="action in actions"
          :key="action.value"
          data-action
          variant="secondary"
          size="compact"
          @click="emit('action', action.value)"
        >
          {{ action.label }}
        </Button>
      </div>
    </div>

    <!-- Redline "Selected row" — own background + top rule; each row
         composes Checkbox for its box and name (reusing the "Label" redline
         Checkbox already carries), with the licence number rendered
         separately in the mono style (Appendix D.1: "a mono licence
         number"; --text-mono/font-mono, same pairing as the Type scale
         section's own "16-015-2527-PCF-1" sample). -->
    <div
      v-for="row in rows"
      :key="row.id"
      data-row
      class="row flex items-center justify-between"
      :class="rowClass(row.id)"
    >
      <Checkbox
        :model-value="isSelected(row.id)"
        :label="row.name"
        @update:model-value="(checked) => toggleRow(row.id, checked)"
      />
      <span data-number class="font-mono text-mono text-text-meta">{{ row.number }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Redline "Bulk bar" — pad 11px 16px. No utility carries this exact pair. */
.bulk-bar {
  padding: 11px 16px;
}

/* Not independently redlined (Appendix C has no "Row" line for this group,
   only "Selected row") — mirrors the Bulk bar's own padding immediately
   above for visual consistency within one component. */
.row {
  padding: 11px 16px;
}
</style>
