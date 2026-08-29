<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Six scale groups - spec Appendix D.1 "Foundations -> the six scale groups".
// Data-driven in the artifact via {{ group.label }}: BRAND GREEN, NEUTRALS
// and STATUS TONES carry a note; RADIUS, SIZE & SPACING and ELEVATION &
// BORDERS do not. None of the six is built yet, so every block is a gap.
</script>

<template>
  <DemoCard
    title="Foundations"
    description="Every value used anywhere below comes from these four scales. Nothing in the licensing screens introduces a colour, radius, or size that isn't here."
  >
    <DemoBlocks>
      <DemoBlock label="BRAND GREEN" note="actions, active state, anything issued">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
      <DemoBlock label="NEUTRALS" note="text, borders, surfaces">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
      <DemoBlock label="STATUS TONES" note="one meaning each — never decorative">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
      <DemoBlock label="RADIUS">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
      <DemoBlock label="SIZE &amp; SPACING">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
      <DemoBlock label="ELEVATION &amp; BORDERS">
        <DemoGap component="SwatchGrid" group="Foundations" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
