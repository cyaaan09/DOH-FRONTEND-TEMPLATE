<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoGap from '../chrome/DemoGap.vue'
</script>

<template>
  <DemoCard
    title="Component specs"
    description="Redlines for everything above — geometry, type, and the exact colour per state. Values are literal CSS."
  >
    <DemoBlocks>
      <DemoGap component="SpecTables" />
    </DemoBlocks>
  </DemoCard>
</template>
