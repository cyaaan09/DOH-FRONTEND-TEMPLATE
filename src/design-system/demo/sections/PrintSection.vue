<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Added by the second 2026-08-31 artifact update. Spec §17.2 — the slot is
// visible from the start, so the page stays a live checklist. Everything
// here is generated from Appendix D: the rule cards are CONTENT the artifact
// shows, so a skeleton renders them for real even while its component slot
// is still a gap.
const RULES = [
  {
    title: 'True aspect, always',
    body: 'The sheet is 210 by 297 at whatever scale fits \u2014 never a rounded card standing in for paper. Margins show as a 1px dashed guide so nothing lands in the dead zone.',
  },
  {
    title: 'Preview is the print path',
    body: 'Same markup, same stylesheet, one page box. If the preview and the printout can disagree, the preview is decoration.',
  },
  {
    title: 'Block invalid output',
    body: 'An unsigned or expired certificate cannot reach the tray \u2014 watermark the preview and disable Print, with the fix one button away.',
  },
  {
    title: 'Batch is one file per licence',
    body: "Twelve selected means twelve single-page PDFs named by LTO number, delivered zipped. A twelve-page merged document is nobody's filing system.",
  },
]
</script>

<template>
  <DemoCard
    title="Print &amp; PDF preview"
    description="Certificates get printed, so the preview shows the real page at real proportions — A4 portrait, 20mm margins, the signature block where it will actually land. What is on screen is what comes out of the tray."
  >
    <DemoBlocks>
      <DemoBlock label="PREVIEW — A4 AT TRUE ASPECT">
        <DemoGap component="PrintPreview" group="Print &amp; PDF preview" />
      </DemoBlock>

      <DemoBlock label="UNSIGNED — BLOCKED BEFORE THE TRAY">
        <DemoGap component="PrintPreview" group="Print &amp; PDF preview" />
      </DemoBlock>

      <DemoBlock label="BATCH — MANY CERTIFICATES">
        <DemoGap component="PrintPreview" group="Print &amp; PDF preview" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
