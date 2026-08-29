<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip } from '@/design-system'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
])

function dismiss(value) {
  applied.value = applied.value.filter((chip) => chip.value !== value)
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
  </div>
</template>
