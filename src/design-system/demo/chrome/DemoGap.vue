<script setup>
defineProps({
  component: { type: String, required: true },
  group: { type: String, required: true },
})
</script>

<template>
  <div data-gap class="demo-gap text-caption text-ink-400">
    <!-- Spec §17.2 — a slot whose component is not built yet. Visible on the
         page so the remaining work is a checklist rather than an absence.
         Comment inside the root, per the Fragment-root note above. -->
    <span class="font-mono text-mono">{{ component }}</span>
    not built — Appendix C "{{ group }}"
  </div>
</template>

<style scoped>
/* Spec §17.1 — dashed panel treatment, the source's dropzone/empty-state
 * border. --border-dashed has no utility namespace. */
.demo-gap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 13px;
  border: 1.6px dashed var(--border-dashed);
  border-radius: var(--r-panel);
}
</style>
