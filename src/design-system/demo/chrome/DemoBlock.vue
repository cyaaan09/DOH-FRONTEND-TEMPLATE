<script setup>
defineProps({
  label: { type: String, required: true },
  note: { type: String, default: '' },
  /**
   * A trailing note, rendered AFTER the slot. Distinct from `note`, which
   * leads: Appendix D.1 records both placements on the source page —
   * Foundations and Chips lead with theirs, Selection controls closes each
   * of its first-row sub-blocks with one. 12px/1.5 --text-meta, 12px above.
   */
  footnote: { type: String, default: '' },
})
</script>

<template>
  <div>
    <!-- Spec §17.1 — label 10.5/700/0.08em. Its gap depends on what follows:
         4px when a note does (Chips, Foundations), 10px when the content
         does (Dialog, Containers, File inputs). §17.1 recorded only the
         noted case and the page shipped 4px everywhere, so every block
         WITHOUT a note sat 6px too tight. Same rule DemoStrip already uses. -->
    <div data-label class="text-column-header text-text-header" :class="note ? 'mb-1' : 'mb-2.5'">
      {{ label }}
    </div>
    <!-- note 12.5/1.5, margin-bottom 10px -->
    <p v-if="note" data-note class="text-caption text-text-meta mb-2.5">{{ note }}</p>
    <slot />
    <p v-if="footnote" data-footnote class="text-hint mt-3 leading-normal text-text-meta">
      {{ footnote }}
    </p>
  </div>
</template>
