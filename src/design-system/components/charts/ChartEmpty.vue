<script setup>
/**
 * Redline "Empty · 1px dashed --border-dashed on --surface, radius 12px, pad
 * 28px 18px · says why in 13px / 700 + a 12px reason + a 34px reset button.
 * Never an empty gridded frame, never a zero line."
 *
 * The two nevers are the point. An empty axis with a flat line at zero is a
 * chart claiming the answer is nought; this says there is no data and why.
 */
defineProps({
  title: { type: String, required: true },
  /** Why it is empty — a fact, not an apology. */
  reason: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})

defineEmits(['action'])
</script>

<template>
  <div data-chart-empty class="empty">
    <p data-empty-title class="empty__title">{{ title }}</p>
    <p v-if="reason" data-empty-reason class="empty__reason">{{ reason }}</p>
    <button
      v-if="actionLabel"
      data-empty-action
      type="button"
      class="empty__action rounded-control"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 18px;
  border: 1px dashed var(--border-dashed);
  border-radius: var(--r-panel);
  background: var(--surface);
  text-align: center;
}

.empty__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-900);
}

.empty__reason {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-meta);
}

.empty__action {
  height: var(--h-compact);
  margin-top: 13px;
  padding: 0 14px;
  border: 1px solid var(--border-field);
  background: var(--surface);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-700);
  cursor: pointer;
}

@media (hover: hover) {
  .empty__action:hover {
    background: var(--surface-muted);
  }
}
</style>
