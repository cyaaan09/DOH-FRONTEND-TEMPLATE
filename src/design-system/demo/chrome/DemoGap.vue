<script setup>
import { computed } from 'vue'

const props = defineProps({
  component: { type: String, required: true },
  group: { type: String, default: '' },
  source: { type: String, default: 'Appendix C' },
})

// Spec Appendix D.1, "Gap citations where Appendix C has no group" — a
// component that would render an entire appendix (e.g. all 19 Appendix C
// groups) cites the source alone; naming any single group would be as wrong
// as omitting a real one. `group` is therefore optional.
const citation = computed(() => (props.group ? `${props.source} “${props.group}”` : props.source))
</script>

<template>
  <div data-gap class="demo-gap text-caption text-ink-400">
    <!-- Spec §17.2 — a slot whose component is not built yet. Visible on the
         page so the remaining work is a checklist rather than an absence.
         Comment inside the root, per the Fragment-root note above. `source`
         defaults to Appendix C; Foundations and Tokens for handoff override
         it to Appendix A, since they describe token scales, not components,
         and no Appendix C group governs them (spec Appendix D.1). -->
    <span class="font-mono text-mono">{{ component }}</span>
    not built — {{ citation }}
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
