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
    title="Data table"
    description="Rebuilt around three ideas: a 3px state stripe replaces reading the status column, the count column carries its own meter so urgency is visible without comparing digits, and the toolbar holds saved views instead of a second row of filters."
  >
    <DemoBlocks>
      <DemoBlock label="TOOLBAR — SAVED VIEWS">
        <DemoGap component="DataTable toolbar" group="Tables" />
      </DemoBlock>

      <DemoBlock label="TABLE">
        <DemoGap component="DataTable" group="Tables" />
      </DemoBlock>

      <DemoBlock label="FOOTER — ROWS PER PAGE">
        <DemoGap component="Pagination" group="Tables" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
