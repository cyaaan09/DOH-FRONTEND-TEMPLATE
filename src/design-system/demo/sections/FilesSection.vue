<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Spec Appendix D.1, "Sections with NO uppercase sub-blocks": the dropzone
// and compact demos carry 12.5px/500 field labels ("PNPKI certificate",
// "Compact · inside a form row"), not uppercase DemoBlock headings - the
// same treatment TextField gives its own <label> (text-field-label
// text-ink-700). FILE LIST is the one true uppercase sub-block here.
</script>

<template>
  <DemoCard
    title="File inputs"
    description="Dashed 1.6px border at rest, green on hover. Every uploaded file becomes a row with a type mark, size, and a single destructive action."
  >
    <DemoBlocks>
      <div>
        <div class="text-field-label text-ink-700 mb-1.5">PNPKI certificate</div>
        <DemoGap component="FileInput" group="File inputs" />
      </div>

      <div>
        <div class="text-field-label text-ink-700 mb-1.5">Compact · inside a form row</div>
        <DemoGap component="FileInputCompact" group="File inputs" />
      </div>
    </DemoBlocks>

    <DemoStrip label="FILE LIST — UPLOADING, DONE, FAILED">
      <DemoGap component="FileList" group="File inputs" />
    </DemoStrip>
  </DemoCard>
</template>
