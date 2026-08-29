<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoGap from '../chrome/DemoGap.vue'
</script>

<template>
  <DemoCard
    title="File inputs"
    description="Dashed 1.6px border at rest, green on hover. Every uploaded file becomes a row with a type mark, size, and a single destructive action."
  >
    <DemoBlocks>
      <DemoBlock label="PNPKI CERTIFICATE">
        <DemoGap component="FileInput" group="File inputs" />
      </DemoBlock>

      <DemoBlock label="COMPACT · INSIDE A FORM ROW">
        <DemoGap component="FileInputCompact" group="File inputs" />
      </DemoBlock>
    </DemoBlocks>

    <DemoStrip label="FILE LIST — UPLOADING, DONE, FAILED">
      <DemoGap component="FileList" group="File inputs" />
    </DemoStrip>
  </DemoCard>
</template>
