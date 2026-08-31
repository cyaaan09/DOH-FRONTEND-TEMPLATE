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
    title: 'Name the consequence, not the action',
    body: 'The body says what happens to the facility, how many things it touches, and whether it can be undone. Are you sure is not information.',
  },
  {
    title: 'The typed string is the identifier',
    body: 'Always the LTO number or facility name shown in mono right above the field \u2014 never the word DELETE, which teaches nothing about what is selected.',
  },
  {
    title: 'Disabled until exact',
    body: 'Trim whitespace, compare case-insensitively, and keep the button visibly disabled with a plain reason under the field. No shake, no toast.',
  },
  {
    title: 'Undo beats confirm',
    body: 'If the action is reversible for even 10 seconds, ship a toast with Undo instead of a dialog. Level 3 exists for the handful that truly are not.',
  },
]
</script>

<template>
  <DemoCard
    title="Destructive confirmation"
    description="Three levels, chosen by how bad the mistake is. A reversible action gets a toast with undo and no dialog at all; a serious one gets a normal dialog; an irreversible one makes you type the thing's name, because a second button is not friction, it is muscle memory."
  >
    <DemoBlocks>
      <DemoBlock label="LEVEL 3 — TYPE TO CONFIRM">
        <DemoGap component="ConfirmDialog" group="Destructive confirmation" />
      </DemoBlock>

      <DemoBlock label="LEVEL 2 — SERIOUS, NOT PERMANENT">
        <DemoGap component="ConfirmDialog" group="Destructive confirmation" />
      </DemoBlock>

      <DemoBlock label="LEVEL 1 — REVERSIBLE, NO DIALOG">
        <DemoGap component="ConfirmDialog" group="Destructive confirmation" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
