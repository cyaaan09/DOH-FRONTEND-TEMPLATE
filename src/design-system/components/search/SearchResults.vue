<script setup>
import { computed } from 'vue'

/**
 * Redline "Scope · global find — distinct from the 34px toolbar filter, which
 * narrows the list already shown". The distinction is why this exists at all:
 * one crosses record types and navigates, the other stays put.
 *
 * Redline "ARIA · role=combobox aria-expanded + role=listbox/option ·
 * aria-activedescendant follows the arrows" — the arrows move a visual
 * selection while focus stays in the input, so the selection has to be
 * announced by id rather than by focus.
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  /** Array<{ label, count, rows: [{ id, tile, title, meta }] }> — max 3. */
  groups: { type: Array, required: true },
  /** The preselected row's id. Redline: "preselected but never auto-navigated". */
  active: { type: String, default: '' },
  totalLabel: { type: String, default: '' },
  label: { type: String, default: 'Search' },
  placeholder: { type: String, default: 'Search' },
  /** Redline "Row cap · 4 rows per group". */
  rowCap: { type: Number, default: 4 },
})

defineEmits(['update:modelValue', 'select'])

const open = computed(() => props.groups.length > 0)
const listId = 'search-results'
</script>

<template>
  <div data-search class="search" :class="open ? 'search--open' : ''">
    <div
      data-search-field
      class="search__field flex items-center border bg-surface"
      :class="open ? 'search__field--open border-green-500' : 'border-field'"
    >
      <span aria-hidden="true" class="search__glyph flex-none text-text-meta">⌕</span>
      <input
        data-search-input
        class="search__input min-w-0 flex-1"
        role="combobox"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="active ? `${listId}-${active}` : undefined"
        aria-autocomplete="list"
        :aria-label="label"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <!-- Redline "Esc hint · 11px mono in a --surface-muted pill, inside the
           field, right" — the way out is visible before it is needed. -->
      <span data-esc-hint aria-hidden="true" class="search__esc flex-none rounded-bar font-mono"
        >esc</span
      >
    </div>

    <div
      v-if="open"
      :id="listId"
      data-search-panel
      role="listbox"
      :aria-label="label"
      class="search__panel bg-surface"
    >
      <div v-for="group in groups" :key="group.label" data-search-group class="search__group">
        <div data-group-header class="search__group-head text-text-header">
          {{ group.label }} · {{ group.count }}
        </div>
        <button
          v-for="row in group.rows.slice(0, rowCap)"
          :id="`${listId}-${row.id}`"
          :key="row.id"
          data-search-row
          type="button"
          role="option"
          :aria-selected="row.id === active"
          class="search__row flex w-full items-center rounded-control"
          :class="row.id === active ? 'search__row--active' : ''"
          @click="$emit('select', row)"
        >
          <span
            data-row-tile
            aria-hidden="true"
            class="search__tile grid flex-none place-items-center rounded-control"
            >{{ row.tile }}</span
          >
          <span class="min-w-0 flex-1 text-left">
            <span data-row-title class="search__title block text-ink-900">{{ row.title }}</span>
            <!-- Redline "Missing meta · states the absence in words (no LTO on
                 file) — never an empty second line". -->
            <span data-row-meta class="search__meta block font-mono text-text-meta">{{
              row.meta
            }}</span>
          </span>
          <slot name="row-end" :row="row" />
        </button>
      </div>

      <div data-search-footer class="search__footer flex items-center border-t border-divider">
        <span class="search__keys flex items-center text-text-meta">
          <span aria-hidden="true" class="search__keycap font-mono">↑↓</span> navigate
          <span aria-hidden="true" class="search__keycap font-mono">↵</span> open
        </span>
        <button
          v-if="totalLabel"
          data-see-all
          type="button"
          class="search__see-all text-hint font-medium text-green-text"
        >
          {{ totalLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  position: relative;
}

/* Redline "Field · 42px · pad 0 14px · radius 11px 11px 0 0 when open ·
   1px --green-500 + 3px ring · 14px value". */
.search__field {
  height: 42px;
  gap: 10px;
  padding: 0 14px;
  border-radius: 11px;
}

.search__field--open {
  border-radius: 11px 11px 0 0;
  border-bottom-color: transparent;
  box-shadow: var(--ring-focus);
}

.search__glyph {
  font-size: 14px;
}

.search__input {
  border: 0;
  background: transparent;
  font-size: 14px;
  color: var(--ink-900);
  outline: none;
}

.search__esc {
  padding: 2px 6px;
  background: var(--surface-muted);
  border: 1px solid var(--divider);
  font-size: 11px;
  color: var(--text-meta);
}

/* Redline "Panel · continues the field: no top border, radius 0 0 11px 11px".
   The two read as one surface, which is the point of the rule card. */
.search__panel {
  position: absolute;
  left: 0;
  right: 0;
  z-index: var(--z-popover);
  border: 1px solid var(--green-500);
  border-top: 0;
  border-radius: 0 0 11px 11px;
  box-shadow: var(--sh-panel);
}

.search__group {
  padding: 8px 6px 4px;
}

/* Redline "Group header · 10.5px / 700 / 0.08em with its count · max 3". */
.search__group-head {
  padding: 4px 7px 6px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* Redline "Result row · pad 9px 11px · 28px type tile · title 13px / 700 ·
   meta 11.5px mono". */
.search__row {
  gap: 10px;
  padding: 9px 11px;
  cursor: pointer;
}

.search__row:hover:not(.search__row--active) {
  background: var(--surface-muted);
}

/* Redline "Active row · --green-100 with a --surface type tile ·
   preselected but never auto-navigated". */
.search__row--active {
  background: var(--green-100);
}

.search__tile {
  width: 28px;
  height: 28px;
  background: var(--surface-muted);
  color: var(--text-header);
  font-size: 10px;
  font-weight: 700;
}

.search__row--active .search__tile {
  background: var(--surface);
}

.search__title {
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search__meta {
  font-size: 11.5px;
  margin-top: 1px;
}

/* Redline "Footer · 1px top --divider · --surface-sunken · keycap hints left,
   See all right". */
.search__footer {
  gap: 10px;
  padding: 9px 12px;
  background: var(--surface-sunken);
  border-radius: 0 0 10px 10px;
}

.search__keys {
  gap: 5px;
  font-size: 11.5px;
}

.search__keycap {
  padding: 2px 5px;
  border-radius: var(--r-bar);
  background: var(--surface);
  border: 1px solid var(--border-card);
  font-size: 11px;
  color: var(--ink-700);
}

.search__see-all {
  margin-left: auto;
  cursor: pointer;
}
</style>
