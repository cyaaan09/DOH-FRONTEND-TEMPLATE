<script setup>
/**
 * The dashed panel shown where content would be. It states what is missing and what to
 * do about it — an empty region with no explanation reads as a broken one.
 */
defineProps({
  /** What is absent, in the user's terms. */
  title: { type: String, required: true },
  /** What to do about it. */
  description: { type: String, default: '' },
})
</script>

<template>
  <!-- Redline "Empty state" — pad 30px 20px, 1px dashed --border-dashed,
       radius --r-panel, centred. The action is a slot rather than a prop:
       the panel owns its own geometry, the caller owns which control gets
       the user out of the empty state. -->
  <div data-empty-state class="empty rounded-panel text-center">
    <div data-title class="empty__title text-ink-900">{{ title }}</div>
    <p v-if="description" data-body class="empty__body text-notice text-text-meta">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="empty__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  padding: 30px 20px;
  border: 1px dashed var(--border-dashed);
}

/* Redline "Empty title" — 14.5/700. Sits between --text-row-title (14) and
   --text-section-title (17) with no token of its own. */
.empty__title {
  font-size: 14.5px;
  font-weight: 700;
}

.empty__body {
  margin-top: 4px;
}

.empty__action {
  margin-top: 14px;
}
</style>
