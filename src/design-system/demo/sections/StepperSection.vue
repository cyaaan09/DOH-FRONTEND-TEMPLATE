<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Added by the 2026-08-31 artifact update. Spec §17.2 — every sub-block the
// artifact shows exists on our page from the start; where the component
// behind it is not built the slot renders a DemoGap naming what is missing,
// so the page stays a live checklist rather than quietly omitting the work.
</script>

<template>
  <DemoCard
    title="Stepper"
    description="Three forms, one rule: a step is only clickable once it has been reached. Horizontal for a form the user is filling, vertical for a record whose history matters, compact where the header has no room."
  >
    <DemoBlocks>
      <DemoBlock label="HORIZONTAL — A FORM IN PROGRESS">
        <DemoGap component="Stepper" group="Stepper" />
      </DemoBlock>

      <DemoBlock label="VERTICAL — A RECORD WITH HISTORY">
        <DemoGap component="Stepper · vertical" group="Stepper" />
      </DemoBlock>

      <DemoBlock label="COMPACT — INSIDE A CARD HEADER">
        <DemoGap component="Stepper · compact" group="Stepper" />
      </DemoBlock>

      <DemoBlock label="ERROR STATE">
        <DemoGap component="Stepper — error step" group="Stepper" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
