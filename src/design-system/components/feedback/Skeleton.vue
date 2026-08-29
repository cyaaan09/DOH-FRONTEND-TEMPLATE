<script setup>
defineProps({
  rows: { type: Number, default: 3 },
})
</script>

<template>
  <div class="flex flex-col gap-2.5" aria-hidden="true">
    <div
      v-for="row in rows"
      :key="row"
      data-row
      class="skeleton h-4 rounded-tile bg-surface-muted"
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
