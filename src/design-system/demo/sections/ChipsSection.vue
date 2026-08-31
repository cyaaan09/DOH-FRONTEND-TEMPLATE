<script setup>
import { ref } from 'vue'
import { Chip, ChipGroup, DismissibleChip, FilterChip } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoRules from '../chrome/DemoRules.vue'

const applied = ref([
  { key: 'Status:', value: 'Active' },
  { key: 'Expiry:', value: 'Within 90 days' },
  { key: 'Source:', value: 'Online' },
  // Deliberately shares a value with "Source:" under a different key — proof
  // that dismiss must key off { chipKey, value } together (Finding 9), not
  // value alone. See ChipsSection in sections.spec.js.
  { key: 'Payment:', value: 'Online' },
  // Deliberately shares a key with "Source: Online" under a different value
  // — the other half of the same proof (review Finding 3): a handler that
  // filtered on chipKey alone would remove both "Source:" chips instead of
  // only the one dismissed. All four applied chips used to have distinct
  // keys, so that half of the { chipKey, value } contract went unproven.
  { key: 'Source:', value: 'Migrated' },
])

const FILTERS = [
  'Primary Care Facility',
  'Hospital',
  'Birthing Home',
  'Clinical Laboratory',
  'Pharmacy',
  'X-ray Facility',
]
const selected = ref(['Primary Care Facility', 'Hospital', 'Birthing Home'])

// Rule cards — spec Appendix D, chipRules
const RULES = [
  {
    title: 'One tone per meaning',
    body: 'Green = good or issued, amber = waiting or legacy, red = blocked or overdue, grey = neutral, purple = modification.',
  },
  {
    title: 'Never two chips of the same tone',
    body: 'If a row needs two amber chips, one of them is really a field, not a chip. Move it into the label line.',
  },
  {
    title: 'Chips never wrap mid-phrase',
    body: 'white-space: nowrap, and overflow collapses into a grey “+n more” that expands the row.',
  },
]

function dismiss({ chipKey, value }) {
  applied.value = applied.value.filter((chip) => !(chip.key === chipKey && chip.value === value))
}

function toggle(label) {
  selected.value = selected.value.includes(label)
    ? selected.value.filter((item) => item !== label)
    : [...selected.value, label]
}
</script>

<template>
  <DemoCard
    title="Chips"
    description="Height auto (20px at 11px type), radius 999, 11px / 700, padding 3px 9px. Tone comes from the meaning, never from decoration."
  >
    <DemoBlocks>
      <DemoBlock
        label="STATUS"
        note="A dot plus a word. Green for good, amber for waiting, red for blocked, grey for closed."
      >
        <ChipGroup>
          <Chip tone="green" dot>Approved</Chip>
          <Chip variant="filled">Active</Chip>
          <Chip tone="amber" dot>Pending</Chip>
          <Chip tone="red" dot>Returned</Chip>
          <Chip tone="neutral" dot>Closed</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="APPLICATION TYPE"
        note="Flat tint, no dot — a category, not a state. Purple is reserved for Add / Modify."
      >
        <ChipGroup>
          <Chip tone="neutral">Initial</Chip>
          <Chip tone="neutral">Renewal</Chip>
          <Chip tone="violet">Add / Modify</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="SERVICE"
        note="Outline only — a licence can carry six of these, so tint would drown the row. 12px / 400, white surface, hairline border."
      >
        <ChipGroup>
          <Chip variant="service">New · Birthing Home</Chip>
          <Chip variant="service">New · Clinical Laboratory — Limited</Chip>
          <Chip variant="service">New · Ambulance Service Provider — Type I</Chip>
          <Chip variant="service">Upgrade · Clinical Laboratory — Tertiary</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="SOURCE"
        note="Where the record came from. Blue for portal-filed, amber for migrated paper records."
      >
        <ChipGroup>
          <Chip tone="blue">Online</Chip>
          <Chip tone="amber">Legacy</Chip>
        </ChipGroup>
      </DemoBlock>

      <DemoBlock
        label="COUNT &amp; OVERFLOW"
        note="Numeric badges in nav and tables. Red only when the count is work waiting on you."
      >
        <ChipGroup>
          <!-- Appendix D.1 — red only when the count is work waiting on you;
               the quiet ones take the `count` variant, and the expiry pills
               carry the tone their remaining days deserve. -->
          <Chip tone="red">13</Chip>
          <Chip variant="count">8</Chip>
          <Chip variant="count">+4 more</Chip>
          <Chip tone="amber">128 days left</Chip>
          <Chip tone="red">36 days left</Chip>
        </ChipGroup>
      </DemoBlock>
    </DemoBlocks>

    <DemoStrip label="INTERACTIVE — FILTER CHIPS">
      <div class="flex flex-wrap items-center gap-2">
        <FilterChip
          v-for="label in FILTERS"
          :key="label"
          :selected="selected.includes(label)"
          @toggle="toggle(label)"
          >{{ label }}</FilterChip
        >
        <span v-if="selected.length" class="text-caption text-green-text ml-1">
          Clear {{ selected.length }}
        </span>
      </div>
      <p class="text-caption text-text-meta mt-2.5">
        Selected chips fill green; unselected keep a hairline border so the row reads as one control
        group.
      </p>
    </DemoStrip>

    <!-- Appendix D.1 — this strip is NOT tinted; only the INTERACTIVE one
         above it is. Both shipped tinted. -->
    <DemoStrip label="DISMISSIBLE — APPLIED FILTERS" :tinted="false">
      <ChipGroup>
        <DismissibleChip
          v-for="chip in applied"
          :key="`${chip.key}${chip.value}`"
          :chip-key="chip.key"
          :value="chip.value"
          @dismiss="dismiss"
        />
        <span v-if="applied.length === 0" class="text-caption text-text-meta">No filters applied.</span>
      </ChipGroup>
    </DemoStrip>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
