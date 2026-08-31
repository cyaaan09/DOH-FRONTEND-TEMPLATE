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
    title: 'Headers summarise, not tease',
    body: 'Each closed header carries the answer most people came for. If a header needs opening to know whether it matters, rewrite the sub-line.',
  },
  {
    title: 'Accordion or tabs, never both',
    body: 'Accordion is one long record; tabs swap between views of different things. A tabbed accordion means the information architecture is unresolved.',
  },
  {
    title: 'Chevron is decorative',
    body: 'The whole 14px 18px header is the button with aria-expanded; the 22px chevron tile only reflects state.',
  },
  {
    title: 'Open state sinks',
    body: "An open section's header goes #FAFBFD and its body indents to 52px, aligning with the chevron \u2014 so nesting reads without a second border.",
  },
]
</script>

<template>
  <DemoCard
    title="Accordion"
    description="For a long record read top to bottom — not for switching views, which is what tabs are. One section open by default, the rest collapsed with enough summary in the header to decide whether to open them."
  >
    <DemoBlocks>
      <DemoBlock label="TYPE">
        <DemoGap component="Accordion" group="Accordion" />
      </DemoBlock>

      <DemoBlock label="ADDRESS">
        <DemoGap component="Accordion" group="Accordion" />
      </DemoBlock>

      <DemoBlock label="CONTACT">
        <DemoGap component="Accordion" group="Accordion" />
      </DemoBlock>

      <DemoBlock label="TELEPHONE">
        <DemoGap component="Accordion" group="Accordion" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
