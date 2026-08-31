<script setup>
import { ref } from 'vue'
import {
  Button,
  Checkbox,
  Chip,
  ChipGroup,
  EmptyState,
  FileList,
  Notice,
  SegmentedTabs,
  Select,
  Skeleton,
  StageTabs,
  Switch,
  Tabs,
  TextField,
} from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Six sub-blocks and four rule cards — spec Appendix D, "Dark mode" entry.
// Appendix D gives this section no Description line, so DemoCard gets none.
//
// The artifact hand-draws these previews with literal dark hexes because it
// has no theme system. We do: `[data-theme="dark"]` is an ATTRIBUTE selector,
// so putting it on this panel re-scopes every token for the subtree and the
// real components render themselves in the dark palette. That is both far
// less markup and a genuine check — spec §12 asks for the surface in both
// themes, and a hand-drawn picture would keep looking right after the dark
// palette broke.
const tab = ref('active')
const seg = ref('All')
const stage = ref('review')
const facility = ref('')
const legacy = ref(true)
const notify = ref(true)

const TABS = [
  { key: 'active', label: 'Active', count: 211 },
  { key: 'expiring', label: 'Expiring', count: 8 },
  { key: 'closed', label: 'Closed', count: 41 },
]
const STAGES = [
  { key: 'intake', label: 'Intake', count: 12 },
  { key: 'review', label: 'Review', count: 5 },
  { key: 'signing', label: 'Signing', count: 2 },
]
const FACILITY_TYPES = [
  { value: 'hospital-1', label: 'Hospital · Level 1' },
  { value: 'infirmary', label: 'Infirmary' },
  { value: 'pcf', label: 'Primary Care Facility' },
]
const FILES = [
  { id: 'd1', name: 'matangcas-pnpki.p12', size: '3.2 KB', ext: 'P12', state: 'done' },
  { id: 'd2', name: 'floorplan.pdf', size: '8.4 MB', ext: 'PDF', state: 'uploading', pct: 62 },
]
const RULES = [
  {
    title: 'Depth by surface, not shadow',
    body: '--sh-card and --sh-primary become none; a card reads as raised because #161C26 sits on #0F141C. Only toasts, panels, and dialogs keep a shadow, and it goes darker rather than softer.',
  },
  {
    title: 'The fill flips its text',
    body: 'White on a dark-mode green never clears 4.5:1 at a usable brightness, so the filled green lightens to #2FB25F and takes #0B1017 text (6.95:1). Read it from --green-on-fill so one button component serves both themes.',
  },
  {
    title: 'Tints become translucent',
    body: 'Every status tint is the tone at 14–24% over whatever surface it lands on — 7% for neutral chips and row hover — paired with the light tone as text — so a chip works on a card, a sunken strip, and a hovered row without a third value.',
  },
  {
    title: 'Geometry never changes',
    body: 'Same 38px fields, 9px radius, 22px chips, 32px notices, 24px gutters. Dark mode is a palette swap — if a size changes between themes, it is a bug.',
  },
]
</script>

<template>
  <DemoCard title="Dark mode">
    <!-- Appendix D.1 — the previews sit on a dark canvas panel inset from
         the card. data-theme="dark" here, not on <html>: the attribute
         selector re-scopes tokens for this subtree only, so the panel shows
         the dark palette while the page around it stays light. -->
    <div data-dark-preview data-theme="dark" class="darkmode__panel">
      <div class="darkmode__head flex flex-wrap items-center justify-between">
        <div>
          <div class="text-section-title text-ink-900">Issued LTO</div>
          <div class="text-caption text-text-meta mt-0.5">
            211 active licences · canvas #0F141C, card #161C26
          </div>
        </div>
        <div class="flex gap-2">
          <Button size="compact" variant="secondary">Export CSV</Button>
          <Button size="compact" variant="primary">Sign document</Button>
        </div>
      </div>

      <DemoBlocks min="288px" gap="14px" pt="0px" pb="0px" class="darkmode__grid">
        <DemoBlock label="CHIPS &amp; TONES">
          <ChipGroup>
            <Chip tone="green" dot>Approved</Chip>
            <Chip variant="filled">Active</Chip>
            <Chip tone="amber" dot>Pending</Chip>
            <Chip tone="red" dot>Returned</Chip>
            <Chip tone="neutral" dot>Closed</Chip>
          </ChipGroup>
        </DemoBlock>

        <DemoBlock label="TABS &amp; STAGE CARDS">
          <Tabs v-model="tab" :tabs="TABS" />
          <div class="mt-3">
            <StageTabs v-model="stage" :stages="STAGES" />
          </div>
        </DemoBlock>

        <DemoBlock label="FIELDS &amp; DROPDOWN">
          <TextField
            label="Facility name"
            model-value="Carmen RHU"
            hint="The green ring is the only focus signal."
          />
          <div class="mt-3">
            <SegmentedTabs v-model="seg" :options="['All', 'Mine']" label="Scope" />
          </div>
          <div class="mt-3">
            <Select
              v-model="facility"
              :options="FACILITY_TYPES"
              label="Facility type"
              placeholder="Select a facility type"
            />
          </div>
        </DemoBlock>

        <DemoBlock label="SELECTION &amp; FILES">
          <Checkbox v-model="legacy" label="Include legacy records" />
          <div class="mt-3">
            <Switch v-model="notify" label="Email me on returns" />
          </div>
          <div class="mt-3">
            <FileList :files="FILES" />
          </div>
        </DemoBlock>

        <DemoBlock label="DIALOG, EMPTY, SKELETON &amp; PAGINATION">
          <EmptyState
            title="Nothing matches those filters"
            description="Clear the search or switch back to all types."
          >
            <Button size="compact" variant="secondary">Reset filters</Button>
          </EmptyState>
          <div class="mt-3">
            <Skeleton :columns="['1.6fr', '0.7fr', '1fr']" />
          </div>
        </DemoBlock>

        <DemoBlock label="TOASTS, NOTICES &amp; TABLE">
          <Notice tone="green" label="Success">
            You have successfully updated user's
            <strong class="font-bold">role and permissions.</strong>
          </Notice>
          <div class="mt-2.5">
            <Notice tone="red" label="Error">
              Inspection is overdue by 4 days.
              <strong class="font-bold">Upload the report.</strong>
            </Notice>
          </div>
        </DemoBlock>
      </DemoBlocks>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — the preview panel is inset from the card (margin 16px 24px
   22px), padded 20px, on the dark canvas inside a hairline. The tokens below
   resolve against this element's own data-theme="dark". */
.darkmode__panel {
  margin: 16px var(--pad-card-x) 22px;
  padding: 20px;
  border-radius: var(--r-card);
  background: var(--canvas);
  border: 1px solid var(--border-card);
}

.darkmode__head {
  gap: 16px;
  margin-bottom: 18px;
}

/* Each preview is a dark CARD inside the panel; DemoBlocks supplies the
   288px track and the 14px gap, this supplies the card dress its cells need. */
.darkmode__grid :deep(> div) {
  padding: 15px 16px 17px;
  border-radius: var(--r-panel);
  background: var(--surface);
  border: 1px solid var(--border-card);
}

.darkmode__grid :deep([data-label]) {
  margin-bottom: 11px;
}
</style>
