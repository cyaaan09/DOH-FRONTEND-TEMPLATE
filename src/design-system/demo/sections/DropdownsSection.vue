<script setup>
import { ref } from 'vue'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import { Select, MultiSelect, InlineFilter, RowMenu } from '@/design-system'

// Spec Appendix D.1, "Sections with NO uppercase sub-blocks": Dropdowns has
// none - all four demos sit inline under the description, no DemoBlock
// headings. Each is named by a 12.5/500 field label with a muted qualifier
// after a middot instead - the same treatment FilesSection and SpecsSection
// give their own demos.

// Appendix D.1, "Dropdowns -> the four inline demos" - option lists verbatim,
// including the em dashes in the service names.
const FACILITY_TYPES = [
  'Hospital · Level 1',
  'Hospital · Level 2',
  'Infirmary',
  'Primary Care Facility',
  'Birthing Home',
  'Clinical Laboratory',
  'X-ray Facility',
]

const SERVICES = [
  'Ambulance Service — Type I',
  'Birthing Home',
  'Clinical Laboratory — Limited',
  'Clinical Laboratory — Secondary',
  'Dental Clinic',
  'Pharmacy',
  'X-ray Facility',
]

const STATUSES = [
  { label: 'Active', dot: 'bg-dot-green' },
  { label: 'Expiring soon', dot: 'bg-amber-400' },
  { label: 'Expired', dot: 'bg-red-500' },
  { label: 'All', dot: 'bg-ink-200' },
]

const ROW_ACTIONS = [
  { value: 'lto', label: 'View LTO document' },
  { value: 'facility', label: 'Facility details' },
  { value: 'logs', label: 'View logs' },
  { value: 'revoke', label: 'Revoke licence', destructive: true },
]

const facilityType = ref('')
const services = ref(['Pharmacy', 'Birthing Home'])
const status = ref('Active')
</script>

<template>
  <DemoCard
    title="Dropdowns"
    description="Same 38px shell as a text field. The caret is the only affordance; the panel is a 12px-radius card on a soft shadow."
  >
    <DemoBlocks>
      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Facility type <span class="text-ink-500">· single select</span>
        </div>
        <Select
          v-model="facilityType"
          :options="FACILITY_TYPES"
          placeholder="Select a facility type"
          label="Facility type"
        />
        <p class="text-hint text-text-meta mt-1.25">
          Placeholder greys out until a value is picked.
        </p>
      </div>

      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Services <span class="text-ink-500">· multi select</span>
        </div>
        <MultiSelect
          v-model="services"
          :options="SERVICES"
          placeholder="Select services"
          label="Services"
          filter-placeholder="Filter services"
          empty-text="No service matches that."
        />
        <p class="text-hint text-text-meta mt-1.25">
          Long lists get an inline filter and a sticky footer.
        </p>
      </div>

      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Inline filter <span class="text-ink-500">· table bar</span>
        </div>
        <InlineFilter v-model="status" :options="STATUSES" name="Status" />
        <p class="text-hint text-text-meta mt-1.25">
          34px variant for filter bars, with the field name inline.
        </p>
      </div>

      <div>
        <div class="text-field-label text-ink-700 mb-1.5">
          Row menu <span class="text-ink-500">· actions</span>
        </div>
        <RowMenu :items="ROW_ACTIONS" label="Row actions" />
        <p class="text-hint text-text-meta mt-1.25">
          Destructive item sits last, separated by a hairline.
        </p>
      </div>
    </DemoBlocks>
  </DemoCard>
</template>
