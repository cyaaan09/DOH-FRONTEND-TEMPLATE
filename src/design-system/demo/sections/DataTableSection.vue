<script setup>
import { computed, ref } from 'vue'
import { Button, Chip, DataTable, Pagination, SearchField, SegmentedTabs } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Data table". Seven columns, hard cap — the redline's own
// track list drives DataTable's grid, so header and body cannot drift.
const COLUMNS = [
  { key: 'facility', label: 'FACILITY', width: 'minmax(240px, 2.4fr)', sortable: true },
  { key: 'lto', label: 'LTO NUMBER', width: '148px', sortable: true },
  { key: 'status', label: 'STATUS', width: '132px' },
  { key: 'issued', label: 'ISSUED', width: '116px', sortable: true },
  { key: 'expires', label: 'EXPIRES IN', width: '136px', align: 'right', sortable: true },
]

const ROWS = [
  {
    id: 'carmen',
    stripe: 'green',
    selectLabel: 'Select Carmen Rural Health Unit',
    cells: {
      facility: 'Carmen Rural Health Unit',
      sub: 'Primary Care Facility · Carmen',
      lto: '16-015-2527',
      status: { tone: 'green', label: 'Active' },
      issued: '14 Aug 2026',
      expires: { value: '1 082', pct: 88, tone: 'green' },
    },
  },
  {
    id: 'hipol',
    stripe: 'red',
    selectLabel: 'Select Hipol Family Hospital',
    cells: {
      facility: 'Hipol Family Hospital',
      sub: 'Infirmary · Nasipit',
      lto: '16-19-26-I-2',
      status: { tone: 'red', label: 'Expiring' },
      issued: '02 Jul 2026',
      expires: { value: '36', pct: 8, tone: 'red' },
    },
  },
  {
    id: 'trento',
    stripe: 'amber',
    selectLabel: 'Select Trento Birthing Home',
    cells: {
      facility: 'Trento Birthing Home',
      sub: 'Birthing Home · Trento',
      lto: '16-015-2419',
      status: { tone: 'amber', label: 'Expiring' },
      issued: '19 Sep 2025',
      expires: { value: '128', pct: 32, tone: 'amber' },
    },
  },
  {
    id: 'bayugan',
    stripe: 'closed',
    selectLabel: 'Select Bayugan Medical Clinic',
    cells: {
      facility: 'Bayugan Medical Clinic',
      sub: 'Primary Care Facility · Bayugan',
      lto: null,
      status: { tone: 'neutral', label: 'Closed' },
      issued: null,
      expires: null,
    },
  },
  {
    id: 'prosperidad',
    stripe: 'green',
    selectLabel: 'Select Prosperidad District Hospital',
    expand: true,
    cells: {
      facility: 'Prosperidad District Hospital',
      sub: 'Level 1 Hospital · Prosperidad',
      lto: '16-015-2501',
      status: { tone: 'green', label: 'Active' },
      issued: '30 Jan 2026',
      expires: { value: '883', pct: 74, tone: 'green' },
    },
  },
]

const selected = ref(['carmen', 'hipol'])
const expanded = ref('prosperidad')
const sort = ref({ key: 'facility', dir: 'desc' })
const view = ref('All · 211')
const search = ref('')
const page = ref(1)
const perPage = ref(25)

const VIEWS = ['All · 211', 'Expiring · 12', 'My region · 68']
const METER = { green: 'bg-green-fill', amber: 'bg-amber-400', red: 'bg-red-500' }
const FIGURE = { green: 'text-green-fill', amber: 'text-amber-text', red: 'text-red-700' }

const RULES = [
  {
    title: 'State stripe, 3px',
    body: 'Each row carries a 3px left stripe in its status tone — green active, amber expiring, red overdue, #EEF1F6 closed. You scan the stripe, then read only the rows that need you. Never the only cue: the status chip stays.',
  },
  {
    title: 'Counts carry a meter',
    body: 'The expiry column is a right-aligned mono figure plus a 3px track. 36 days next to a nearly empty red bar reads faster than 36 next to 1 082.',
  },
  {
    title: 'Saved views, not filter rows',
    body: 'Pill views replace a stacked filter bar — the current view is the one filled pill, and + saves whatever is on screen. Search and column settings sit right.',
  },
  {
    title: 'Seven columns, hard cap',
    body: '44px select · minmax(240px, 2.4fr) identity · 148 mono · 132 status · 116 date · 136 numeric · 44px actions. An eighth column means the detail page needs the field, not the table.',
  },
]

const pageCount = computed(() => 3)
</script>

<template>
  <DemoCard
    title="Data table"
    description="Rebuilt around three ideas: a 3px state stripe replaces reading the status column, the count column carries its own meter so urgency is visible without comparing digits, and the toolbar holds saved views instead of a second row of filters."
  >
    <div class="px-card-x pt-4.5 pb-6">
      <DataTable
        v-model:selected="selected"
        v-model:expanded="expanded"
        :columns="COLUMNS"
        :rows="ROWS"
        :sort="sort"
        select-all-label="Select all facilities"
        @sort="(c) => (sort = { key: c.key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })"
      >
        <template #toolbar>
          <div class="datatable-section__toolbar flex flex-wrap items-center">
            <!-- Redline "Saved views · pills 5px 11px · active --green-900 /
                 --logo-ink · idle 1px --border-soft · + is 26px dashed". -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="v in VIEWS"
                :key="v"
                data-view
                type="button"
                class="datatable-section__view rounded-pill"
                :class="v === view ? 'datatable-section__view--on' : 'datatable-section__view--off'"
                :aria-pressed="v === view"
                @click="view = v"
              >
                {{ v }}
              </button>
              <button
                data-save-view
                type="button"
                class="datatable-section__add rounded-pill"
                aria-label="Save the current view"
                title="Save the current view"
              >
                +
              </button>
            </div>
            <div class="datatable-section__toolbar-end flex items-center">
              <SearchField v-model="search" label="Search" placeholder="Facility or LTO number" />
              <SegmentedTabs v-model="view" :options="VIEWS" label="Saved view" class="sr-hidden" />
            </div>
          </div>
        </template>

        <template #bulk>
          <button
            type="button"
            class="datatable-section__link text-caption font-medium text-green-text"
          >
            Select all 211
          </button>
          <span aria-hidden="true" class="text-ink-100">|</span>
          <Button size="compact" variant="secondary">Export</Button>
          <Button size="compact" variant="destructive">Revoke</Button>
        </template>

        <!-- Redline "Identity cell · 13.5/700 + 12px sub · both clip". -->
        <template #cell-facility="{ row }">
          <div class="datatable-section__title text-ink-900">{{ row.cells.facility }}</div>
          <div class="datatable-section__sub text-text-meta">{{ row.cells.sub }}</div>
        </template>

        <!-- Redline "Mono cell · --green-text for live codes · --ink-100
             em-dash when absent". -->
        <template #cell-lto="{ row }">
          <span v-if="row.cells.lto" class="datatable-section__mono font-mono text-green-text">{{
            row.cells.lto
          }}</span>
          <span v-else class="text-ink-100">—</span>
        </template>

        <template #cell-status="{ row }">
          <Chip :tone="row.cells.status.tone" dot>{{ row.cells.status.label }}</Chip>
        </template>

        <template #cell-issued="{ row }">
          <span v-if="row.cells.issued">{{ row.cells.issued }}</span>
          <span v-else class="text-ink-100">—</span>
        </template>

        <!-- Redline "Numeric cell · 12.5px mono / 700 right-aligned + 10.5px
             unit + 3px meter (track --divider, fill = the tone)". -->
        <template #cell-expires="{ row }">
          <template v-if="row.cells.expires">
            <div class="datatable-section__figure flex items-baseline justify-end">
              <span class="font-mono" :class="FIGURE[row.cells.expires.tone]">{{
                row.cells.expires.value
              }}</span>
              <span class="datatable-section__unit text-ink-300">days</span>
            </div>
            <div class="datatable-section__track overflow-hidden rounded-pill bg-divider">
              <span
                class="block h-full rounded-pill"
                :class="METER[row.cells.expires.tone]"
                :style="{ width: `${row.cells.expires.pct}%` }"
              />
            </div>
          </template>
          <span v-else class="text-ink-100">—</span>
        </template>

        <template #expand>
          <div>
            <div class="text-column-header text-text-header mb-2">SERVICES</div>
            <div class="flex flex-wrap gap-1.5">
              <Chip variant="service">Pharmacy</Chip>
              <Chip variant="service">X-ray Facility</Chip>
            </div>
          </div>
          <div>
            <div class="text-column-header text-text-header mb-2">LAST INSPECTION</div>
            <div class="text-body text-ink-700">12 Jun 2026 · passed</div>
            <div class="text-hint text-text-meta">Insp. M. Dela Cruz</div>
          </div>
          <div>
            <div class="text-column-header text-text-header mb-2">ACTIONS</div>
            <div class="flex flex-wrap gap-2">
              <Button size="compact" variant="secondary">View</Button>
              <Button size="compact" variant="secondary">Print LTO</Button>
            </div>
          </div>
        </template>

        <template #footer>
          <Pagination
            v-model:page="page"
            v-model:per-page="perPage"
            :page-count="pageCount"
            :total="211"
          />
        </template>
      </DataTable>
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Redline "Toolbar · pad 12px 20px · 34px search and segmented". */
.datatable-section__toolbar {
  gap: 12px;
  padding: 12px 20px;
}

.datatable-section__toolbar-end {
  gap: 8px;
  margin-left: auto;
}

.datatable-section__view {
  padding: 5px 11px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
}

.datatable-section__view--on {
  background: var(--green-900);
  color: var(--logo-ink);
  font-weight: 700;
}

.datatable-section__view--off {
  border: 1px solid var(--border-soft);
  color: var(--ink-700);
}

.datatable-section__add {
  width: 26px;
  height: 26px;
  border: 1px dashed var(--separator);
  color: var(--text-meta);
  cursor: pointer;
}

.datatable-section__link {
  cursor: pointer;
  text-decoration: underline;
}

.datatable-section__title {
  font-size: 13.5px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datatable-section__sub {
  font-size: 12px;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.datatable-section__mono {
  font-size: 12px;
}

.datatable-section__figure {
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
}

.datatable-section__unit {
  font-size: 10.5px;
  font-weight: 400;
}

.datatable-section__track {
  height: 3px;
  margin-top: 5px;
}

/* The segmented control duplicates the saved-view pills for keyboard users
   who expect a radio group; it is not drawn. */
.sr-hidden {
  display: none;
}
</style>
