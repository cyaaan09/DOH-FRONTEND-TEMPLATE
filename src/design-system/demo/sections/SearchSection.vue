<script setup>
import { ref } from 'vue'
import { Chip, SearchResults } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Search with results". The panel is shown OPEN because the
// section's whole subject is what the open state looks like — grouping, the
// row cap, the preselected row, and the keycap footer.
const query = ref('carmen')
const active = ref('carmen-rhu')

const GROUPS = [
  {
    label: 'FACILITIES',
    count: 3,
    rows: [
      {
        id: 'carmen-rhu',
        tile: 'PCF',
        title: 'Carmen Rural Health Unit',
        meta: '16-015-2527-PCF-1',
        status: 'green',
      },
      {
        id: 'carmen-bh',
        tile: 'BH',
        title: 'Carmen Birthing Home',
        meta: '16-015-2419-BH-2',
        status: 'amber',
      },
      // Redline "Missing meta · states the absence in words — never an empty
      // second line".
      {
        id: 'carmen-lab',
        tile: 'CL',
        title: 'Carmen Diagnostic Laboratory',
        meta: 'no LTO on file',
      },
    ],
  },
  {
    label: 'APPLICATIONS',
    count: 1,
    rows: [
      {
        id: 'renewal',
        tile: 'APP',
        title: 'Renewal — Carmen RHU',
        meta: 'filed 19 Aug 2026 · inspection stage',
      },
    ],
  },
]

const LABELS = { green: 'Active', amber: 'Expiring' }

const RULES = [
  {
    title: 'Grouped, capped, counted',
    body: 'Max three groups and four rows each, every group counted in its header. Everything beyond that lives behind See all \u2014 a scrolling result list is a results page in disguise.',
  },
  {
    title: 'Mono for the identifier',
    body: "Every row's second line is the thing you would paste into a search: the LTO number, the filing date. Absent, it says so plainly.",
  },
  {
    title: 'Keyboard is the point',
    body: 'Slash or cmd-K opens, arrows move, Enter opens, Esc closes and restores the previous query. The first result is preselected but never auto-navigated.',
  },
  {
    title: 'Field merges with the panel',
    body: 'The open field squares its bottom corners and the panel continues it \u2014 one object, not a field with a floating list.',
  },
]
</script>

<template>
  <DemoCard
    title="Search with results"
    description="One field, results grouped by what they are, and a keyboard path from first keystroke to open record. Distinct from the plain filter field in the table toolbar, which narrows a list already on screen."
  >
    <div class="search-section__well px-card-x pt-4.5 pb-6">
      <SearchResults
        v-model="query"
        :groups="GROUPS"
        :active="active"
        label="Search facilities and applications"
        placeholder="Search"
        total-label="See all 12 matches"
        @select="(row) => (active = row.id)"
      >
        <template #row-end="{ row }">
          <Chip v-if="row.status" :tone="row.status" dot>{{ LABELS[row.status] }}</Chip>
        </template>
      </SearchResults>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* The panel is absolutely positioned, so the demo reserves room for it rather
   than letting it overlap the rule cards below. */
.search-section__well {
  min-height: 380px;
}
</style>
