<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Appendix D gives Dark mode no Description line, so none is rendered here.
</script>

<template>
  <DemoCard title="Dark mode">
    <DemoBlocks>
      <DemoBlock label="DARK MODE">
        <DemoGap component="DarkModePreview" group="Dark mode" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
