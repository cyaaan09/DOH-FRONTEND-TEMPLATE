<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Spec Appendix D.1, "Sections with NO uppercase sub-blocks": Dropdowns has
// none - all four demos sit inline under the description, no DemoBlock
// headings. An earlier pass invented four uppercase labels here; D.1 records
// that none exists in the source, so the gaps are unlabelled.
</script>

<template>
  <DemoCard
    title="Dropdowns"
    description="Same 38px shell as a text field. The caret is the only affordance; the panel is a 12px-radius card on a soft shadow."
  >
    <DemoBlocks>
      <DemoGap component="Select" group="Dropdowns" />
      <DemoGap component="MultiSelect" group="Dropdowns" />
      <DemoGap component="InlineFilter" group="Dropdowns" />
      <DemoGap component="RowMenu" group="Dropdowns" />
    </DemoBlocks>
  </DemoCard>
</template>
