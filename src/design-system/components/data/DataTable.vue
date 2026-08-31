<script setup>
import { computed } from 'vue'
import Checkbox from '../selection/Checkbox.vue'

/**
 * Redline group "Tables" — 30 rows, rebuilt in the 2026-08-31 artifact update
 * around three ideas the section states outright: a 3px state stripe replaces
 * reading the status column, the count column carries its own meter, and the
 * toolbar holds saved views rather than a second row of filters.
 *
 * §7 plans this on TanStack. It is hand-built for now — see §17.3: every row
 * in the redline is presentation, and the props below are shaped so a row
 * model can drive them later without the markup changing.
 */
const props = defineProps({
  /** Array<{ key, label, width, align?, sortable? }> — data columns only. */
  columns: { type: Array, required: true },
  /**
   * Array<{ id, stripe?: 'green'|'amber'|'red'|'closed', cells, expand? }>.
   * `cells` is keyed by column key; the section renders them through slots.
   */
  rows: { type: Array, required: true },
  /** Selected row ids. */
  selected: { type: Array, default: () => [] },
  /** Expanded row id, or ''. One at a time — the panel is tall. */
  expanded: { type: String, default: '' },
  sort: { type: Object, default: () => ({ key: '', dir: 'desc' }) },
  selectAllLabel: { type: String, default: 'Select all rows' },
  actionsLabel: { type: String, default: 'Row actions' },
})

defineEmits(['update:selected', 'update:expanded', 'sort'])

// Redline "Select column · header is aria-checked=mixed when partial" —
// expressed through Checkbox's `indeterminate`, which reaches the native
// input as an IDL property (see the Selection controls §17.3 entry).
const allSelected = computed(
  () => props.rows.length > 0 && props.selected.length === props.rows.length,
)
const someSelected = computed(() => props.selected.length > 0 && !allSelected.value)

// Redline "Grid template · 44px · minmax(240px,2.4fr) · … · 44px · gap 14px".
// The leading 44px is the select column and the trailing one is actions; the
// data columns supply the middle, so a caller cannot desynchronise header and
// body by declaring the track list twice.
const template = computed(() => `44px ${props.columns.map((c) => c.width).join(' ')} 44px`)

const STRIPE = {
  green: 'bg-green-fill',
  amber: 'bg-amber-400',
  red: 'bg-red-500',
  closed: 'bg-divider',
}
</script>

<template>
  <div data-data-table class="dtable overflow-hidden rounded-card border border-hairline bg-surface">
    <slot name="toolbar" />

    <!-- Redline "Bulk bar · 8px 20px · --green-tint-2 · 1px bottom, 12.5px
         --green-text with a select-all link" — appears only with a selection. -->
    <div v-if="selected.length" data-bulk-bar class="table__bulk flex flex-wrap items-center">
      <span class="text-caption font-medium text-green-text">{{ selected.length }} selected</span>
      <slot name="bulk" />
    </div>

    <div class="table__scroll">
      <div class="table__inner">
        <div
          data-header-row
          class="table__row table__row--head"
          :style="{ gridTemplateColumns: template }"
        >
          <div class="flex justify-center">
            <Checkbox
              data-select-all
              :model-value="allSelected"
              :indeterminate="someSelected"
              :label="selectAllLabel"
              hide-label
              @update:model-value="
                (on) => $emit('update:selected', on ? rows.map((r) => r.id) : [])
              "
            />
          </div>
          <component
            :is="column.sortable ? 'button' : 'div'"
            v-for="column in columns"
            :key="column.key"
            data-column-header
            class="table__head-cell flex items-center"
            :class="column.align === 'right' ? 'justify-end' : ''"
            :type="column.sortable ? 'button' : undefined"
            :aria-sort="
              column.sortable
                ? sort.key === column.key
                  ? sort.dir === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined
            "
            @click="column.sortable && $emit('sort', column)"
          >
            {{ column.label }}
            <!-- Redline "Sort caret · 8px · active --green-fill · idle
                 --item-mark · header cell is the button". -->
            <span
              v-if="column.sortable"
              data-sort-caret
              aria-hidden="true"
              class="table__caret"
              :class="sort.key === column.key ? 'text-green-fill' : 'text-item-mark'"
              >▾</span
            >
          </component>
          <div />
        </div>

        <template v-for="row in rows" :key="row.id">
          <div
            data-row
            class="table__row table__row--body"
            :class="selected.includes(row.id) ? 'table__row--selected' : ''"
            :style="{ gridTemplateColumns: template }"
          >
            <!-- Redline "State stripe · 3px absolute left, full row height" —
                 the section's first idea: it replaces reading the status
                 column to find out how a row is doing. -->
            <span
              v-if="row.stripe"
              data-stripe
              aria-hidden="true"
              class="table__stripe"
              :class="STRIPE[row.stripe] ?? STRIPE.closed"
            />

            <div class="flex justify-center">
              <Checkbox
                :model-value="selected.includes(row.id)"
                :label="row.selectLabel ?? `Select ${row.id}`"
                hide-label
                @update:model-value="
                  (on) =>
                    $emit(
                      'update:selected',
                      on ? [...selected, row.id] : selected.filter((id) => id !== row.id),
                    )
                "
              />
            </div>

            <div
              v-for="column in columns"
              :key="column.key"
              data-cell
              class="min-w-0"
              :class="column.align === 'right' ? 'text-right' : ''"
            >
              <slot :name="`cell-${column.key}`" :row="row" :column="column">
                <!-- Redline "Empty cell · em-dash --ink-100 in the cell's own
                     alignment — never blank, never N/A". -->
                <span v-if="row.cells[column.key] == null" class="text-ink-100">—</span>
                <template v-else>{{ row.cells[column.key] }}</template>
              </slot>
            </div>

            <div class="flex justify-center">
              <button
                v-if="row.expand"
                data-expand
                type="button"
                class="table__icon-btn rounded-tile"
                :aria-expanded="expanded === row.id"
                :aria-label="`${expanded === row.id ? 'Collapse' : 'Expand'} ${row.id}`"
                :title="`${expanded === row.id ? 'Collapse' : 'Expand'} ${row.id}`"
                @click="$emit('update:expanded', expanded === row.id ? '' : row.id)"
              >
                {{ expanded === row.id ? '▴' : '▾' }}
              </button>
              <button
                v-else
                data-row-actions
                type="button"
                class="table__icon-btn rounded-tile"
                :aria-label="actionsLabel"
                :title="actionsLabel"
              >
                ⋯
              </button>
            </div>
          </div>

          <!-- Redline "Expanded panel · --surface-sunken · pad 16px 20px 20px ·
               auto-fit minmax(260px,1fr) gap 22px" and "Expand indent · panel
               content starts at 78px (select 44 + gap 14 + 20 pad)". -->
          <div v-if="row.expand && expanded === row.id" data-expand-panel class="table__panel">
            <div class="table__panel-grid">
              <slot name="expand" :row="row" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="$slots.footer" data-footer class="table__footer"><slot name="footer" /></div>
  </div>
</template>

<style scoped>
/* The root class is `dtable`, not `table`: `table` is a Tailwind display
   utility, so a bare BEM block of that name compiles to `display: table` —
   which shrink-to-fits, so the root grew past its card and the scroll
   container below never constrained anything. Nothing errored; the card just
   overflowed, and only the layout gate saw it.
   Redline "Min table width · 1040–1180px inside overflow-x:auto" — the table
   never reflows; it scrolls, so a column never becomes unreadably narrow. */
.table__scroll {
  overflow-x: auto;
}

.table__inner {
  min-width: 1040px;
}

.table__row {
  display: grid;
  gap: 14px;
  align-items: center;
}

/* Redline "Column header · pad 11px 20px · --surface-sunken · 10.5/700/0.08em"
   with a 1px bottom rule. */
.table__row--head {
  padding: 11px 20px;
  background: var(--surface-sunken);
  border-bottom: 1px solid var(--divider);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-header);
}

.table__head-cell {
  gap: 5px;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: left;
}

button.table__head-cell {
  cursor: pointer;
}

.table__caret {
  font-size: 8px;
}

/* Redline "Row padding · 12px 20px default" with a 1px --divider-row rule. */
.table__row--body {
  position: relative;
  padding: 12px 20px;
  border-top: 1px solid var(--divider-row);
  font-size: 12.5px;
  color: var(--ink-700);
}

.table__row--body:hover {
  background: var(--row-hover);
}

/* Redline "Selected row · --green-tint-2". */
.table__row--selected {
  background: var(--green-tint-2);
}

.table__stripe {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

/* Redline "Bulk bar · 8px 20px · --green-tint-2 · 1px bottom --green-100". */
.table__bulk {
  gap: 12px;
  padding: 8px 20px;
  background: var(--green-tint-2);
  border-bottom: 1px solid var(--green-100);
}

/* Redline "Actions cell · 26px hit area, aria-label + title required". */
.table__icon-btn {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  color: var(--text-meta);
  font-size: 13px;
  cursor: pointer;
}

.table__icon-btn:hover {
  background: var(--surface-muted);
  color: var(--ink-900);
}

.table__icon-btn:focus-visible,
.table__head-cell:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}

.table__panel {
  padding: 16px 20px 20px;
  padding-left: 78px;
  background: var(--surface-sunken);
  border-top: 1px solid var(--divider-row);
}

.table__panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 22px;
}

/* Redline "Footer bar · pad 13px 20px · --surface-sunken · 12.5px". */
.table__footer {
  padding: 13px 20px;
  background: var(--surface-sunken);
  border-top: 1px solid var(--divider);
}
</style>
