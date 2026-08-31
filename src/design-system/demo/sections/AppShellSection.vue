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
    title="App shell — side navigation"
    description="One rail, two widths. Group headers carry the section, the active item is the only gradient on screen, and a count badge only appears where a number changes what you do next."
  >
    <DemoBlocks>
      <DemoBlock label="LICENSING">
        <DemoGap component="AppSidebar — nav group" group="App shell — sidebar &amp; header" />
      </DemoBlock>

      <DemoBlock label="CONFIGURATION">
        <DemoGap component="AppSidebar — nav group" group="App shell — sidebar &amp; header" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
