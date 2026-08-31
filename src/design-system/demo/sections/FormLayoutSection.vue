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
    title="Form layout"
    description="A 12-column grid on a 24px gutter, fieldsets separated by a rule rather than a card, and one sticky footer that owns every action. Errors replace help text in place — the row never grows."
  >
    <DemoBlocks>
      <DemoBlock label="IDENTIFICATION">
        <DemoGap component="FormShell + Fieldset" group="Forms &amp; validation" />
      </DemoBlock>

      <DemoBlock label="LOCATION &amp; SERVICES">
        <DemoGap component="FormShell + Fieldset" group="Forms &amp; validation" />
      </DemoBlock>

      <DemoBlock label="DARK">
        <DemoGap component="FormShell — dark preview" group="Forms &amp; validation" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
