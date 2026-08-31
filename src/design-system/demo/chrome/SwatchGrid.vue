<script setup>
// Demo-only chrome. `src/design-system/demo/` is deliberately exempt from
// the raw-hex guard (spec §13) precisely so a swatch table can print the
// values it documents — every hex here is CONTENT, not styling.
defineProps({
  label: { type: String, required: true },
  note: { type: String, default: '' },
  /** Array<{ name, hex, use }>, in scale order. */
  swatches: { type: Array, required: true },
})
</script>

<template>
  <div class="swatch-group">
    <!-- Appendix D.1 — label and note share a baseline row here, unlike the
         stacked label/note DemoBlock renders elsewhere. -->
    <div class="swatch-group__head flex items-baseline">
      <div data-label class="text-column-header text-text-header">{{ label }}</div>
      <div v-if="note" data-note class="text-hint text-text-meta">{{ note }}</div>
    </div>

    <div class="swatch-group__grid">
      <div v-for="swatch in swatches" :key="swatch.name" data-swatch class="swatch">
        <div data-chip class="swatch__chip" :style="{ background: swatch.hex }" />
        <div class="swatch__meta">
          <div data-name class="swatch__name">{{ swatch.name }}</div>
          <div data-hex class="swatch__hex font-mono text-text-meta">{{ swatch.hex }}</div>
          <div data-use class="swatch__use text-text-meta">{{ swatch.use }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.swatch-group {
  margin-bottom: 20px;
}

.swatch-group__head {
  gap: 10px;
  margin-bottom: 10px;
}

/* auto-FILL, not auto-fit: a short palette must keep its 146px swatches
   rather than stretching three of them across the whole card. */
.swatch-group__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(146px, 100%), 1fr));
  gap: 8px;
}

.swatch {
  border: 1px solid var(--border-card);
  border-radius: 10px;
  overflow: hidden;
}

.swatch__chip {
  height: 46px;
  border-bottom: 1px solid rgb(16 24 40 / 0.06);
}

.swatch__meta {
  padding: 7px 9px 8px;
}

.swatch__name {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-900);
}

.swatch__hex {
  font-size: 11px;
  margin-top: 2px;
}

.swatch__use {
  font-size: 11px;
  margin-top: 3px;
  line-height: 1.35;
}
</style>
