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
    title: 'Tooltip never holds the only copy',
    body: 'It is a label for something already visible. Anything a user must read to make a decision goes in the row, the field help, or a popover.',
  },
  {
    title: 'Popovers trap focus, tooltips never',
    body: 'A popover is a dialog without a scrim: Esc closes, Tab cycles inside, focus returns to the trigger. A tooltip is aria-describedby and nothing else.',
  },
  {
    title: 'Hover and focus, both',
    body: 'Every tooltip shows on keyboard focus too, or it does not exist for half your users. On touch it becomes a tap-to-toggle popover.',
  },
  {
    title: '12px offset, flip on collide',
    body: 'Popover sits 6px off its trigger with a 10px arrow; near a viewport edge it flips side rather than shifting off screen.',
  },
]
</script>

<template>
  <DemoCard
    title="Tooltip &amp; popover"
    description="Two layers with one rule between them: a tooltip names a thing, a popover holds content you can point at. If it has a button inside, it is a popover."
  >
    <DemoBlocks>
      <DemoBlock label="TOOLTIP — LABEL ONLY, 6PX OFFSET">
        <DemoGap component="Tooltip" group="Tooltip &amp; popover" />
      </DemoBlock>

      <DemoBlock label="POPOVER — CONTENT PLUS ACTIONS">
        <DemoGap component="Tooltip" group="Tooltip &amp; popover" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
