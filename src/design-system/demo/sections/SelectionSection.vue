<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
</script>

<template>
  <DemoCard
    title="Selection controls"
    description="Checkbox for many, radio for one, switch for something that takes effect the moment you touch it. 17px targets, 10px gap to the label, whole row clickable."
  >
    <DemoBlocks>
      <DemoBlock label="CHECKBOX · STATES">
        <DemoGap component="Checkbox" group="Selection controls" />
      </DemoBlock>
      <DemoBlock label="RADIO · LIST">
        <DemoGap component="Radio" group="Selection controls" />
      </DemoBlock>
      <DemoBlock label="SWITCH · TAKES EFFECT AT ONCE">
        <DemoGap component="Switch" group="Selection controls" />
      </DemoBlock>
      <DemoBlock label="CHECKBOX CARDS · MULTI">
        <DemoGap component="CheckboxCard" group="Selection controls" />
      </DemoBlock>
      <DemoBlock label="RADIO CARDS · SINGLE">
        <DemoGap component="RadioCard" group="Selection controls" />
      </DemoBlock>
      <DemoBlock label="BULK SELECTION — TABLE HEADER + ACTION BAR">
        <DemoGap component="BulkActionBar" group="Selection controls" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
