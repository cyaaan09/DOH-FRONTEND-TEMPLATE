<script setup>
import { computed, ref } from 'vue'
import { SPEC_GROUPS } from '../data/specs.js'

// Demo-only chrome: Appendix C rendered as an accordion. Exempt from the
// raw-hex guard (spec §13) — every value here is the redline's own text.
const FILTERS = ['All', 'Geometry', 'Colour']

// Appendix D.1 — a row counts as COLOUR when it carries a swatch or its
// value names one: /#|rgba|gradient/. Geometry is the exact complement, so
// the two filters partition every row and neither can silently drop one.
const COLOUR = /#|rgba|gradient/

const filter = ref('All')
// Chips opens by default, as the artifact does.
const open = ref({ Chips: true })

const groups = computed(() =>
  SPEC_GROUPS.map((group) => ({
    ...group,
    rows: group.rows.filter((row) => {
      if (filter.value === 'Colour') return Boolean(row.c) || COLOUR.test(row.v)
      if (filter.value === 'Geometry') return !row.c && !COLOUR.test(row.v)
      return true
    }),
  })),
)

function toggle(name) {
  open.value = { ...open.value, [name]: !open.value[name] }
}
</script>

<template>
  <div>
    <!-- Redline "Segmented" — the same 3px-inset control shell SegmentedTabs
         uses, here filtering the redlines rather than switching a view. -->
    <div
      data-spec-filter
      class="spectables__filter flex rounded-field bg-surface-muted"
      role="group"
      aria-label="Filter redlines"
    >
      <button
        v-for="option in FILTERS"
        :key="option"
        type="button"
        data-filter-option
        class="spectables__option rounded-tile"
        :class="filter === option ? 'spectables__option--on text-ink-900' : 'text-text-meta'"
        :aria-pressed="filter === option"
        @click="filter = option"
      >
        {{ option }}
      </button>
    </div>

    <div v-for="group in groups" :key="group.name" data-spec-group class="border-t border-divider">
      <button
        type="button"
        data-spec-toggle
        class="spectables__head flex w-full items-center bg-surface-sunken text-left"
        :aria-expanded="Boolean(open[group.name])"
        @click="toggle(group.name)"
      >
        <span data-spec-name class="text-row-title text-ink-900">{{ group.name }}</span>
        <span data-spec-summary class="min-w-0 flex-1 truncate text-caption text-text-meta">{{
          group.summary
        }}</span>
        <span aria-hidden="true" class="spectables__caret flex-none text-ink-200">{{
          open[group.name] ? '▴' : '▾'
        }}</span>
      </button>

      <div v-if="open[group.name]" data-spec-body class="spectables__body">
        <div class="spectables__rows">
          <div
            v-for="row in group.rows"
            :key="row.k"
            data-spec-row
            class="spectables__row flex items-baseline"
          >
            <div data-k class="spectables__k flex-none text-text-header">{{ row.k }}</div>
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span
                v-if="row.c"
                data-swatch
                aria-hidden="true"
                class="spectables__swatch flex-none"
                :style="{ background: row.c }"
              />
              <span data-v class="spectables__v font-mono text-ink-700">{{ row.v }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spectables__filter {
  gap: 6px;
  padding: 3px;
}

.spectables__option {
  padding: 7px 12px;
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.spectables__option--on {
  font-weight: 700;
  background: var(--surface);
  box-shadow: 0 1px 2px rgb(16 24 40 / 0.08);
}

.spectables__head {
  gap: 12px;
  padding: 14px var(--pad-card-x);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--t-control) ease;
}

@media (hover: hover) {
  .spectables__head:hover {
    background: var(--surface-muted);
  }
}

.spectables__caret {
  font-size: 11px;
  font-weight: 700;
}

.spectables__body {
  padding: 4px var(--pad-card-x) 18px;
}

/* Two columns of redlines where the card is wide enough, one where it is
   not. The 28px is a COLUMN gap only — rows keep their own 8px rhythm. */
.spectables__rows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: 0 28px;
}

.spectables__row {
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--divider-row);
}

.spectables__k {
  width: 128px;
  font-size: 12px;
  font-weight: 500;
}

.spectables__v {
  font-size: 12.5px;
  overflow-wrap: anywhere;
}

.spectables__swatch {
  width: 13px;
  height: 13px;
  border-radius: 4px;
  border: 1px solid rgb(16 24 40 / 0.12);
}
</style>
