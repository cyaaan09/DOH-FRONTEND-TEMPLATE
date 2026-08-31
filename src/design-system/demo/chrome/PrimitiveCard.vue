<script setup>
// Demo-only chrome: a primitive's signature and description over a sunken
// well holding a live example of it. Appendix D.1 — card 1px --divider,
// radius --r-panel; head pad 12px 14px 10px; well pad 12px 14px 14px on
// --surface-card-muted under a 1px --divider-row rule.
defineProps({
  /** The primitive's call signature, e.g. `<Row gap align justify wrap>`. */
  signature: { type: String, required: true },
  description: { type: String, required: true },
})
</script>

<template>
  <div data-primitive class="primitive overflow-hidden rounded-panel">
    <div class="primitive__head">
      <div data-signature class="primitive__signature font-mono text-ink-900">{{ signature }}</div>
      <p data-description class="primitive__description text-text-meta">{{ description }}</p>
    </div>
    <div data-well class="primitive__well"><slot /></div>
  </div>
</template>

<style scoped>
.primitive {
  border: 1px solid var(--divider);
  background: var(--surface);
}

.primitive__head {
  padding: 12px 14px 10px;
}

.primitive__signature {
  font-size: 12px;
  font-weight: 500;
}

.primitive__description {
  font-size: 12px;
  line-height: 1.45;
  margin-top: 3px;
  text-wrap: pretty;
}

.primitive__well {
  padding: 12px 14px 14px;
  background: var(--surface-card-muted);
  border-top: 1px solid var(--divider-row);
}
</style>
