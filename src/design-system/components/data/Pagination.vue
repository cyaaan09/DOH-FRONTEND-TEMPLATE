<script setup>
/**
 * Redline "Pagination · 34x32px · radius --r-control · active --green-fill /
 * --green-on-fill · idle 1px --border-field", plus the footer's rows-per-page
 * control and result pill.
 *
 * Ark ships a `pagination` machine and §7 plans it there. This is hand-built
 * for the same reason DataTable is — see the §17.3 entry — and its props are
 * shaped so a machine can drive it later without the markup changing.
 */
defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  perPage: { type: Number, default: 25 },
  perPageOptions: { type: Array, default: () => [25, 50, 100] },
  /** Total rows, for the result pill. */
  total: { type: Number, default: 0 },
  prevLabel: { type: String, default: 'Previous page' },
  nextLabel: { type: String, default: 'Next page' },
})

defineEmits(['update:page', 'update:perPage'])
</script>

<template>
  <div data-pagination class="pagination flex flex-wrap items-center">
    <label class="pagination__rows flex items-center text-hint text-text-meta">
      Rows
      <select
        data-per-page
        class="pagination__select rounded-control border border-field bg-surface text-mono text-ink-700"
        :value="perPage"
        @change="$emit('update:perPage', Number($event.target.value))"
      >
        <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>

    <span data-total class="pagination__total text-hint text-text-meta">of {{ total }}</span>

    <nav class="pagination__pages flex items-center" :aria-label="'Pagination'">
      <button
        data-prev
        type="button"
        class="pagination__btn rounded-control border border-field bg-surface"
        :disabled="page <= 1"
        :aria-label="prevLabel"
        :title="prevLabel"
        @click="$emit('update:page', page - 1)"
      >
        ‹
      </button>
      <button
        v-for="n in pageCount"
        :key="n"
        data-page
        type="button"
        class="pagination__btn rounded-control"
        :class="n === page ? 'pagination__btn--active' : 'border border-field bg-surface'"
        :aria-current="n === page ? 'page' : undefined"
        :aria-label="`Page ${n}`"
        @click="$emit('update:page', n)"
      >
        {{ n }}
      </button>
      <button
        data-next
        type="button"
        class="pagination__btn rounded-control border border-field bg-surface"
        :disabled="page >= pageCount"
        :aria-label="nextLabel"
        :title="nextLabel"
        @click="$emit('update:page', page + 1)"
      >
        ›
      </button>
    </nav>
  </div>
</template>

<style scoped>
.pagination {
  gap: 10px;
}

.pagination__rows {
  gap: 6px;
}

/* Redline "Rows-per-page · 30px · 1px --border-field · radius --r-control ·
   sits left of pagination in the footer". */
.pagination__select {
  height: 30px;
  padding: 0 6px;
}

.pagination__pages {
  gap: 4px;
  margin-left: auto;
}

/* Redline "Pagination · 34x32px". */
.pagination__btn {
  min-width: 34px;
  height: 32px;
  padding: 0 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-700);
  cursor: pointer;
}

.pagination__btn--active {
  background: var(--green-fill);
  color: var(--green-on-fill);
  font-weight: 700;
}

.pagination__btn:disabled {
  color: var(--ink-200);
  cursor: not-allowed;
}

.pagination__btn:focus-visible,
.pagination__select:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
</style>
