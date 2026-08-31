<script setup>
import Sidebar from '../layout/Sidebar.vue'

/**
 * The page frame: one rail, one sticky header, one scrolling main. Composed
 * on the `Sidebar` layout primitive rather than reimplementing its widths —
 * the primitive already owns 244/62/off-canvas, and the redline's "one per
 * page" rule is about this component, not that one.
 */
defineProps({
  collapsed: { type: Boolean, default: false },
  /** Off-canvas state below 768px; the shell owns it, the primitive applies it. */
  open: { type: Boolean, default: false },
})
</script>

<template>
  <Sidebar data-app-shell :collapsed="collapsed" :open="open" class="app-shell">
    <template #rail><slot name="rail" /></template>
    <slot name="header" />
    <main data-app-main class="app-shell__main"><slot /></main>
  </Sidebar>
</template>

<style scoped>
.app-shell {
  min-height: 100%;
}

.app-shell__main {
  background: var(--canvas);
}
</style>
