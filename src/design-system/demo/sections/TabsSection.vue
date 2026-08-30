<script setup>
import { ref } from 'vue'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'
import { Tabs, SegmentedTabs, StageTabs } from '@/design-system'

// Rule cards - spec Appendix D, tabRules
const RULES = [
  { title: 'Underline for content, segmented for filters', body: "Underline tabs swap what the table shows. Segmented chips narrow what's already shown." },
  { title: 'Counts belong on tabs, not beside them', body: 'A mono count inside the tab keeps the row scannable and stops the label from shifting when numbers change.' },
  { title: 'Never nest two tab rows', body: 'If a view needs a second axis, that axis is a filter — put it in the bar below.' },
]

// Demo data - spec Appendix D
const UNDERLINE_TABS = [
  {
    key: 'active',
    label: 'Active LTOs',
    count: '211',
    body: '211 licences currently valid. Expiry tone tells you which need a renewal notice.',
  },
  {
    key: 'all',
    label: 'All applications',
    count: '215',
    body: 'Every application ever filed, including rejected and forfeited records.',
  },
  {
    key: 'moa',
    label: 'MOA services',
    count: '8',
    body: 'Services delivered under a memorandum of agreement with another facility.',
  },
]

const STAGES = [
  { key: 'review', step: '1', label: 'Review', count: 2, hint: '2 returned' },
  { key: 'payment', step: '2', label: 'Payment', count: 2, hint: '1 awaiting OP' },
  { key: 'inspection', step: '3', label: 'Inspection', count: 8, hint: '2 due within 7 days', urgent: true },
  { key: 'issuance', step: '4', label: 'Issuance', count: 1, hint: 'ready to sign' },
  { key: 'closed', step: '·', label: 'Closed', count: 41, hint: 'rejected · forfeited', muted: true },
]

const SEGMENT_OPTIONS = ['All', 'Initial', 'Renewal', 'Add / Modify']

const activeTab = ref('active')
const activeSegment = ref('All')
const activeStage = ref('review')
</script>

<template>
  <DemoCard
    title="Tabs"
    description="Three variants, one rule: the active item is the only green thing in the row."
  >
    <DemoBlocks>
      <DemoBlock label="UNDERLINE — PRIMARY, SITS ON A CARD EDGE">
        <Tabs v-model="activeTab" :tabs="UNDERLINE_TABS">
          <p class="text-body text-text-meta">
            {{ UNDERLINE_TABS.find((tab) => tab.key === activeTab)?.body }}
          </p>
        </Tabs>
      </DemoBlock>
      <DemoBlock label="SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS">
        <SegmentedTabs
          v-model="activeSegment"
          :options="SEGMENT_OPTIONS"
          label="Application type"
        />
      </DemoBlock>
      <DemoBlock label="STAGE TABS — A WORKFLOW WITH VOLUME PER STEP">
        <StageTabs v-model="activeStage" :stages="STAGES">
          <p class="text-body text-text-meta">
            Showing {{ STAGES.find((stage) => stage.key === activeStage)?.count }} application(s) in
            {{ STAGES.find((stage) => stage.key === activeStage)?.label }}.
          </p>
        </StageTabs>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
