<script setup>
// Demo-only chrome: the dashed placeholder a primitive's well arranges, so
// the example shows the LAYOUT rather than borrowed real components.
// Appendix D.1 — min-height 38px, radius --r-control, --surface-muted under
// a 1px dashed --separator, label 11px/500 --text-header.
defineProps({
  label: { type: String, default: '' },
  /** Fixed width in px; omitted, the tile flexes. */
  width: { type: String, default: '' },
  grow: { type: Boolean, default: false },
})
</script>

<template>
  <div
    data-tile
    class="tile grid place-items-center"
    :style="{ width: width || undefined, flex: grow ? '1' : undefined }"
  >
    {{ label }}
  </div>
</template>

<style scoped>
.tile {
  min-height: 38px;
  border-radius: var(--r-control);
  background: var(--surface-muted);
  border: 1px dashed var(--separator);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-header);
}
</style>
