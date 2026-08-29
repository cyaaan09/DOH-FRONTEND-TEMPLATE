<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Sub-block labels are the artifact's own headings (not captured verbatim in
// Appendix D's Dropdowns entry - see task-5-brief.md's note on this).
</script>

<template>
  <DemoCard
    title="Dropdowns"
    description="Same 38px shell as a text field. The caret is the only affordance; the panel is a 12px-radius card on a soft shadow."
  >
    <DemoBlocks>
      <DemoBlock label="SINGLE SELECT">
        <DemoGap component="Select" group="Dropdowns" />
      </DemoBlock>
      <DemoBlock label="MULTI SELECT">
        <DemoGap component="MultiSelect" group="Dropdowns" />
      </DemoBlock>
      <DemoBlock label="INLINE FILTER — TABLE BAR">
        <DemoGap component="InlineFilter" group="Dropdowns" />
      </DemoBlock>
      <DemoBlock label="ROW MENU — ACTIONS">
        <DemoGap component="RowMenu" group="Dropdowns" />
      </DemoBlock>
    </DemoBlocks>
  </DemoCard>
</template>
