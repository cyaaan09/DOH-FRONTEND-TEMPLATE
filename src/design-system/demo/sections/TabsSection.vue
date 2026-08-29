<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'
import DemoGap from '../chrome/DemoGap.vue'

// Rule cards - spec Appendix D, tabRules
const RULES = [
  { title: 'Underline for content, segmented for filters', body: "Underline tabs swap what the table shows. Segmented chips narrow what's already shown." },
  { title: 'Counts belong on tabs, not beside them', body: 'A mono count inside the tab keeps the row scannable and stops the label from shifting when numbers change.' },
  { title: 'Never nest two tab rows', body: 'If a view needs a second axis, that axis is a filter — put it in the bar below.' },
]
</script>

<template>
  <DemoCard
    title="Tabs"
    description="Three variants, one rule: the active item is the only green thing in the row."
  >
    <DemoBlocks>
      <DemoBlock label="UNDERLINE — PRIMARY, SITS ON A CARD EDGE">
        <DemoGap component="Tabs" group="Tabs" />
      </DemoBlock>
      <DemoBlock label="SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS">
        <DemoGap component="SegmentedTabs" group="Tabs" />
      </DemoBlock>
      <DemoBlock label="STAGE TABS — A WORKFLOW WITH VOLUME PER STEP">
        <DemoGap component="StageTabs" group="Tabs" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
