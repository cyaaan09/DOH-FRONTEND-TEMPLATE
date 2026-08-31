<script setup>
import { ref } from 'vue'
import { Button, DatePicker } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Date picker". Both demos are LIVE — the calendars really
// open and select — because the section's subject is behaviour: parsing,
// range length, and which days are struck rather than hidden.
const PRESETS = ['Last 7 days', 'Last 30 days', 'This quarter', 'Year to date', 'Custom']
const preset = ref('Custom')

const RULES = [
  {
    title: 'Type or pick',
    body: 'The field accepts 04/09/2026, 4 Sep 26, and 2026-09-04, all normalised on blur. A calendar-only date field is a wall for anyone entering a hundred records.',
  },
  {
    title: 'Range shows its length',
    body: 'The Apply button carries the day count, so a mistyped year is obvious before it is committed.',
  },
  {
    title: 'Unavailable, not hidden',
    body: 'Out-of-range days stay visible in #DDE2EA with a strike, with the reason spelled out in the footer \u2014 a missing day looks like a bug.',
  },
  {
    title: '32px cells',
    body: 'Cells are 32px with a 2px gap, so a 7-column month fits 280px. On touch the popover scales to 44px cells and goes full-width below 420px.',
  },
]
</script>

<template>
  <DemoCard
    title="Date picker"
    description="A field plus one popover. Single date for issuance, a two-month range for reporting periods. Typing beats clicking for a date three years out, so the field stays editable and the calendar is the assist, never the only way in."
  >
    <DemoBlocks min="320px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="SINGLE DATE — OPEN">
        <DatePicker label="Date issued" constraint="Before 03 Sep unavailable" min="2026-09-03" />
      </DemoBlock>

      <DemoBlock label="RANGE — TWO MONTHS, PRESETS LEFT">
        <DatePicker label="Reporting period" selection-mode="range" :num-of-months="2">
          <template #presets>
            <button
              v-for="p in PRESETS"
              :key="p"
              data-preset
              type="button"
              class="datepicker-section__preset rounded-control"
              :class="p === preset ? 'datepicker-section__preset--on' : 'text-ink-700'"
              :aria-pressed="p === preset"
              @click="preset = p"
            >
              {{ p }}
            </button>
          </template>
          <template #actions>
            <Button size="compact" variant="secondary">Cancel</Button>
            <Button size="compact" variant="primary">Apply · 23 days</Button>
          </template>
        </DatePicker>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Redline "Presets · 12.5px rows radius --r-control · active --green-100 /
   --green-text 700". */
.datepicker-section__preset {
  display: block;
  width: 100%;
  padding: 6px 8px;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.datepicker-section__preset:hover {
  background: var(--surface-muted);
}

.datepicker-section__preset--on {
  background: var(--green-100);
  color: var(--green-text);
  font-weight: 700;
}
</style>
