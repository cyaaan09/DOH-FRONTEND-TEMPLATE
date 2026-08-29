<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Number, default: 3 },
})

// Redline "Skeleton bar · 3 rows max" — the source warns against a full page
// of shimmer, so the count is clamped rather than trusted.
const rowCount = computed(() => Math.max(1, Math.min(3, props.rows)))
</script>

<template>
  <div class="flex flex-col gap-2.5" aria-hidden="true">
    <!-- Redline "Skeleton bar · 11px · radius 6px" -->
    <div
      v-for="row in rowCount"
      :key="row"
      data-row
      class="skeleton h-2.75 rounded-bar bg-neutral-100"
    />
  </div>
</template>

<style scoped>
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
