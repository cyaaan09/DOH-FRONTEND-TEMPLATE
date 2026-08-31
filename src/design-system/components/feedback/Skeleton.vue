<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Number, default: 3 },
  /**
   * CSS grid track sizes, one per bar in a row — Appendix D.1's table
   * skeleton is `['1.6fr', '0.7fr', '1fr']`. Left empty (the default) the
   * component stays the plain stack of full-width bars Appendix C
   * redlines; a consumer loading a TABLE wants row-shaped placeholders,
   * and that is the artifact's only use of it.
   */
  columns: { type: Array, default: () => [] },
  /** What the region will hold once it loads — announced while it is busy. */
  busyLabel: { type: String, default: 'Loading' },
})

const tabular = computed(() => props.columns.length > 0)

// Appendix D.1 — the bars are not uniform: row 2 shortens its first cell and
// row 3 its last, so the block does not read as a grid of identical strips.
const WIDTHS = [
  ['88%', '64%', '76%'],
  ['72%', '64%', '76%'],
  ['88%', '64%', '50%'],
]

function barWidth(row, column) {
  return WIDTHS[(row - 1) % WIDTHS.length][column % WIDTHS[0].length]
}

// Redline "Skeleton bar · 3 rows max" — the source warns against a full page
// of shimmer, so the count is clamped rather than trusted.
const rowCount = computed(() => Math.max(1, Math.min(3, props.rows)))
</script>

<template>
  <div data-skeleton-region role="status" aria-busy="true" :aria-label="busyLabel">
    <!-- Redline "Skeletons · aria-hidden=true inside an aria-busy=true
         container". The bars were already hidden; nothing said the region was
         loading, so a screen reader met a silent empty box and had no reason
         to come back. aria-busy is only meaningful on an element that is
         still IN the tree, which is why it cannot share a node with the
         aria-hidden bars and needs this wrapper. -->
    <div
      v-if="tabular"
      data-skeleton-table
      class="skeleton__table overflow-hidden rounded-panel border border-divider"
      aria-hidden="true"
    >
      <!-- Appendix D.1's table form — a bordered card of ruled rows, each a
         grid of bars. The comment lives INSIDE the root: a leading sibling
         comment compiles this to a Fragment, and wrapper.attributes() would
         then read the comment node instead of the div — which is what broke
         the aria-hidden assertion the first time. aria-hidden either way: a
         skeleton pictures content that is not there yet, and announcing it
         says nothing useful. -->
      <div
        v-for="row in rowCount"
        :key="row"
        data-row
        class="skeleton__row items-center border-b border-divider-row"
        :style="{ gridTemplateColumns: columns.join(' ') }"
      >
        <div
          v-for="(track, column) in columns"
          :key="column"
          data-bar
          class="skeleton h-2.75 rounded-bar bg-neutral-100"
          :style="{ width: barWidth(row, column) }"
        />
      </div>
    </div>

    <div v-else class="flex flex-col gap-2.5" aria-hidden="true">
      <!-- Redline "Skeleton bar · 11px · radius 6px" -->
      <div
        v-for="row in rowCount"
        :key="row"
        data-row
        class="skeleton h-2.75 rounded-bar bg-neutral-100"
      />
    </div>
  </div>
</template>

<style scoped>
/* Appendix D.1 — table rows are a 3-track grid at gap 12, pad 14px 16px. */
.skeleton__row {
  display: grid;
  gap: 12px;
  padding: 14px 16px;
}

.skeleton__row:last-child {
  border-bottom: 0;
}

/* A slow pulse rather than a sweeping shimmer — the source document warns
 * against a full page of shimmer. */
.skeleton {
  animation: skeletonPulse 1.4s ease-in-out infinite;
}

@keyframes skeletonPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}
</style>
