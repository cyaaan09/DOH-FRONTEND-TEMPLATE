<script setup>
import { ref } from 'vue'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import { Checkbox, Radio, Switch, CheckboxCard, RadioCard, BulkActionBar } from '@/design-system'

// Appendix D.1, "Selection controls -> the six sub-blocks' data" - every
// label and hint below is verbatim, including the em dashes in
// "Clinical Laboratory — Limited" and "Enforced by policy — cannot be
// turned off".

// CHECKBOX · STATES - four rows, one per state. The third (indeterminate)
// and fourth (disabled + checked) are the point of this sub-block, not
// decoration: both are fixed demonstrations rather than routed through a
// ref, since neither can actually change from the page (indeterminate
// ignores modelValue for display, and a disabled control accepts no click).
const includeLegacy = ref(false)
const onlySigned = ref(true)

// RADIO · LIST - no hints.
const RADIO_OPTIONS = [
  { value: 'as-plan', label: 'As-plan' },
  { value: 'as-built', label: 'As-built' },
  { value: 'n/a', label: 'Not applicable', disabled: true },
]
const drawingType = ref('as-plan')

// SWITCH · TAKES EFFECT AT ONCE - three rows, the last disabled. Same
// reasoning as the checkbox block above: the disabled row is fixed rather
// than backed by a ref.
const emailOnReturns = ref(true)
const maintenanceMode = ref(false)

// CHECKBOX CARDS · MULTI
const CARD_TYPES = [
  { value: 'pharmacy', label: 'Pharmacy', hint: 'Requires a licensed pharmacist on duty' },
  {
    value: 'lab',
    label: 'Clinical Laboratory — Limited',
    hint: 'Routine chemistry and hematology only',
  },
  { value: 'xray', label: 'X-ray Facility', hint: 'Needs a separate FDA radiation permit' },
]
const checkedCardTypes = ref(['pharmacy'])
function toggleCardType(value, checked) {
  checkedCardTypes.value = checked
    ? [...checkedCardTypes.value, value]
    : checkedCardTypes.value.filter((item) => item !== value)
}

// RADIO CARDS · SINGLE - the chosen card carries a "Selected" marker.
const APPLICATION_TYPES = [
  { value: 'initial', label: 'Initial', hint: 'First licence for a newly built facility' },
  { value: 'renewal', label: 'Renewal', hint: 'Same services, new validity period' },
  { value: 'modify', label: 'Add / Modify', hint: 'Changes the services on an active licence' },
]
const applicationType = ref('renewal')

// BULK SELECTION — TABLE HEADER + ACTION BAR - starts with nothing selected
// so the header reads "Select all" and the action buttons stay hidden,
// matching the group's own idle redline.
const FACILITY_ROWS = [
  { id: 'trento', name: 'Trento Primary Care Facility', number: '16-015-2527-PCF-1' },
  { id: 'hipol', name: 'Hipol Family Hospital', number: '16-19-26-I-2' },
  { id: 'socorro', name: 'Socorro Birthing Clinic', number: '16-72-26-BH-1' },
]
const BULK_ACTIONS = [
  { value: 'notice', label: 'Send renewal notice' },
  { value: 'export', label: 'Export' },
]
const selectedFacilities = ref([])
</script>

<template>
  <DemoCard
    title="Selection controls"
    description="Checkbox for many, radio for one, switch for something that takes effect the moment you touch it. 17px targets, 10px gap to the label, whole row clickable."
  >
    <!-- Appendix D.1 — this section is three stacked wrappers, not one
         grid. Built as a single DemoBlocks, auto-fit floated BULK SELECTION
         up as a third column beside the two card blocks. -->
    <DemoBlocks>
      <DemoBlock
        label="CHECKBOX · STATES"
        footnote="Parent rows show a dash when only some children are picked."
      >
        <div class="row-stack flex flex-col">
          <Checkbox
            v-model="includeLegacy"
            label="Include legacy records"
            hint="Migrated paper licences with no service list"
          />
          <Checkbox v-model="onlySigned" label="Only facilities I signed" />
          <Checkbox
            :model-value="false"
            label="All Caraga provinces"
            hint="3 of 5 provinces selected"
            indeterminate
          />
          <Checkbox
            :model-value="true"
            label="Archived facilities"
            hint="Unavailable to signatories"
            disabled
          />
        </div>
      </DemoBlock>

      <DemoBlock
        label="RADIO · LIST"
        footnote="Three or fewer short options; more than that becomes a dropdown."
      >
        <Radio v-model="drawingType" :options="RADIO_OPTIONS" label="Drawing type" />
      </DemoBlock>

      <DemoBlock
        label="SWITCH · TAKES EFFECT AT ONCE"
        footnote="Switch sits right of its label — nothing to submit, so nothing to scan back to."
      >
        <Switch
          v-model="emailOnReturns"
          label="Email me on returns"
          hint="Digest at 6 PM, weekdays only"
        />
        <Switch
          v-model="maintenanceMode"
          label="Maintenance mode"
          hint="Blocks new online filings immediately"
        />
        <Switch
          :model-value="true"
          label="Audit logging"
          hint="Enforced by policy — cannot be turned off"
          disabled
        />
      </DemoBlock>
    </DemoBlocks>

    <!-- Appendix D.1 — the card row is its own grid at a 300px track, so it
         holds two columns where the row above holds three. -->
    <DemoBlocks min="300px" pt="6px" pb="22px">
      <DemoBlock label="CHECKBOX CARDS · MULTI">
        <div class="card-stack flex flex-col">
          <CheckboxCard
            v-for="card in CARD_TYPES"
            :key="card.value"
            :model-value="checkedCardTypes.includes(card.value)"
            :label="card.label"
            :hint="card.hint"
            @update:model-value="(checked) => toggleCardType(card.value, checked)"
          />
        </div>
      </DemoBlock>

      <DemoBlock label="RADIO CARDS · SINGLE">
        <RadioCard
          v-model="applicationType"
          :options="APPLICATION_TYPES"
          label="Application type"
        />
      </DemoBlock>
    </DemoBlocks>

    <!-- Appendix D.1 — BULK SELECTION is a full-width tinted strip closing
         the card, not a grid cell. DemoStrip is §17.1's strip treatment; the
         artifact pads this one 16px 20px against §17.1's 18px 24px 22px, a
         deviation recorded in §17.3 rather than special-cased here. -->
    <DemoStrip label="BULK SELECTION — TABLE HEADER + ACTION BAR">
      <BulkActionBar v-model="selectedFacilities" :rows="FACILITY_ROWS" :actions="BULK_ACTIONS" />
    </DemoStrip>
  </DemoCard>
</template>

<style scoped>
/* Redline "Row gap" — 11px between rows in a list of otherwise independent
   controls. Checkbox and CheckboxCard, unlike Switch (its own
   adjacent-sibling rule) and the radio-group components (their own internal
   gap), are not self-managing groups — each mounted instance is its own
   root with no awareness of its siblings — so the 11px gap between multiple
   instances is supplied here instead. No Tailwind utility carries 11px
   exactly. */
.row-stack {
  gap: 11px;
}

/* Appendix D.1's row-gap table — cards sit 8px apart, not 11px. RadioCard
   carries its own 8px internally; CheckboxCard, like Checkbox, is one root
   per instance and takes its gap from the list around it. */
.card-stack {
  gap: 8px;
}
</style>
