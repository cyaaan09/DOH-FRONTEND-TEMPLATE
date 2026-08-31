<script setup>
// Demo-only chrome: one column of the Foundations footer, listing a scale's
// values against what each is for. Exempt from the raw-hex guard for the
// same reason SwatchGrid is — these values are content.
defineProps({
  label: { type: String, required: true },
  /** Array<{ value, use, radius? }> — `radius` draws a sample tile. */
  rows: { type: Array, required: true },
})
</script>

<template>
  <div data-scale class="scale">
    <div data-label class="text-column-header text-text-header mb-2.5">{{ label }}</div>
    <div class="scale__rows flex flex-col">
      <div v-for="row in rows" :key="row.value" data-scale-row class="scale__row flex items-center">
        <div data-value class="scale__value flex-none font-mono text-ink-600">{{ row.value }}</div>
        <div
          v-if="row.radius"
          data-sample
          class="scale__sample flex-none"
          :style="{ borderRadius: row.radius }"
        />
        <div data-use class="scale__use min-w-0 flex-1 text-text-meta">{{ row.use }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scale {
  padding: 18px 24px 20px;
  /* The -1px pull collapses adjacent columns' rules into one, so the last
     column in a row does not draw a rule against the card's own edge — the
     same trick DemoRules uses. */
  border-right: 1px solid var(--divider);
  margin-right: -1px;
}

.scale__rows {
  gap: 7px;
}

.scale__row {
  gap: 12px;
}

.scale__value {
  width: 92px;
  font-size: 12.5px;
}

.scale__sample {
  width: 30px;
  height: 22px;
  background: var(--divider);
  border: 1px solid var(--border-field);
}

.scale__use {
  font-size: 12px;
  line-height: 1.4;
}
</style>
