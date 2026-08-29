<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip, FilterChip } from '@/design-system'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
])

const FILTERS = ['Primary Care Facility', 'Hospital', 'Birthing Home', 'Clinical Laboratory']
const selected = ref(['Primary Care Facility'])

function dismiss({ chipKey, value }) {
  // Filter on key and value together — two chips can legitimately share a
  // value under different keys, and filtering on value alone would remove
  // both.
  applied.value = applied.value.filter(
    (chip) => !(chip.key === chipKey && chip.value === value),
  )
}

function toggle(label) {
  selected.value = selected.value.includes(label)
    ? selected.value.filter((item) => item !== label)
    : [...selected.value, label]
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ChipGroup>
      <Chip tone="green" dot>Approved</Chip>
      <Chip tone="amber" dot>Pending</Chip>
      <Chip tone="red" dot>Returned</Chip>
      <Chip tone="neutral" dot>Closed</Chip>
      <Chip tone="blue">Online</Chip>
      <Chip tone="violet">Legacy</Chip>
    </ChipGroup>

    <ChipGroup>
      <DismissibleChip
        v-for="chip in applied"
        :key="chip.value"
        :chip-key="chip.key"
        :value="chip.value"
        @dismiss="dismiss"
      />
      <span v-if="applied.length === 0" class="text-hint text-text-meta">No filters applied.</span>
    </ChipGroup>

    <ChipGroup>
      <Chip variant="filled">Active</Chip>
      <Chip variant="service">Pharmacy</Chip>
      <Chip variant="service">Birthing Home</Chip>
      <Chip variant="service">X-ray Facility</Chip>
    </ChipGroup>

    <ChipGroup>
      <FilterChip
        v-for="label in FILTERS"
        :key="label"
        :selected="selected.includes(label)"
        @toggle="toggle(label)"
        >{{ label }}</FilterChip
      >
    </ChipGroup>
  </div>
</template>
