<script setup>
import { ref } from 'vue'
import DemoCard from '../chrome/DemoCard.vue'
import DemoStrip from '../chrome/DemoStrip.vue'
import DemoRules from '../chrome/DemoRules.vue'
import { Tabs, SegmentedTabs, StageTabs } from '@/design-system'

// Rule cards - spec Appendix D, tabRules
const RULES = [
  {
    title: 'Underline for content, segmented for filters',
    body: "Underline tabs swap what the table shows. Segmented chips narrow what's already shown.",
  },
  {
    title: 'Counts belong on tabs, not beside them',
    body: 'A mono count inside the tab keeps the row scannable and stops the label from shifting when numbers change.',
  },
  {
    title: 'Never nest two tab rows',
    body: 'If a view needs a second axis, that axis is a filter — put it in the bar below.',
  },
]

// Demo data - plan docs/superpowers/plans/2026-08-30-tabs-section.md, Task 5
// (not Appendix D - these values don't appear in the spec itself)
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
  {
    key: 'inspection',
    step: '3',
    label: 'Inspection',
    count: 8,
    hint: '2 due within 7 days',
    urgent: true,
  },
  { key: 'issuance', step: '4', label: 'Issuance', count: 1, hint: 'ready to sign' },
  {
    key: 'closed',
    step: '·',
    label: 'Closed',
    count: 41,
    hint: 'rejected · forfeited',
    muted: true,
  },
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
    <!-- Appendix D.1 — three full-width blocks, NOT the DemoBlocks grid: at
         the page's real width a grid gives each ~293px, which collapses
         StageTabs' own two-column grid and clips the underline row against
         DemoCard's overflow-hidden. Unlike Chips' and Toasts' strips these
         are plain — no sunken tint — and the first opens the card body, so
         it carries no top rule. Each leads with a 12.5px note. -->
    <DemoStrip
      label="UNDERLINE — PRIMARY, SITS ON A CARD EDGE"
      note="Use at the top of a table card. Counts ride inside the label."
      :tinted="false"
      :divided="false"
      pt="20px"
      pb="4px"
    >
      <Tabs v-model="activeTab" :tabs="UNDERLINE_TABS">
        <p class="text-body text-text-meta">
          {{ UNDERLINE_TABS.find((tab) => tab.key === activeTab)?.body }}
        </p>
      </Tabs>
    </DemoStrip>

    <DemoStrip
      label="SEGMENTED — INLINE FILTER, 2–4 SHORT OPTIONS"
      note="Sits in a filter bar next to the search field. Never more than four."
      :tinted="false"
      pt="22px"
      pb="4px"
      mt="14px"
    >
      <SegmentedTabs v-model="activeSegment" :options="SEGMENT_OPTIONS" label="Application type" />
    </DemoStrip>

    <DemoStrip
      label="STAGE TABS — A WORKFLOW WITH VOLUME PER STEP"
      note="The pipeline pattern from LTO Applications: numbered, countable, one urgent tone allowed."
      :tinted="false"
      pt="22px"
      pb="24px"
      mt="18px"
    >
      <StageTabs v-model="activeStage" :stages="STAGES">
        <p class="text-body text-text-meta">
          Showing {{ STAGES.find((stage) => stage.key === activeStage)?.count }} application(s) in
          {{ STAGES.find((stage) => stage.key === activeStage)?.label }}.
        </p>
      </StageTabs>
    </DemoStrip>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
