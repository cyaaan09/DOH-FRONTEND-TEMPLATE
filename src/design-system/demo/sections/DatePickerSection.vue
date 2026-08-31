<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Added by the second 2026-08-31 artifact update. Spec §17.2 — the slot is
// visible from the start, so the page stays a live checklist. Everything
// here is generated from Appendix D: the rule cards are CONTENT the artifact
// shows, so a skeleton renders them for real even while its component slot
// is still a gap.
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
    <DemoBlocks>
      <DemoBlock label="SINGLE DATE — OPEN">
        <DemoGap component="DatePicker" group="Date picker" />
      </DemoBlock>

      <DemoBlock label="RANGE — TWO MONTHS, PRESETS LEFT">
        <DemoGap component="DatePicker" group="Date picker" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
