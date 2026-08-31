<script setup>
// A full-width block closing or dividing a card: an optional top rule, a
// label, an optional leading note, then content. Appendix D.1's audit found
// the page uses two dresses for this, not one — Chips, Toasts and Selection
// controls tint theirs on --surface-sunken (§17.1's default, kept), while
// Tabs runs three plain ones on the card surface with their own padding and
// margins. Every metric that varies arrives as a custom property, so exactly
// one declaration ever sets each CSS property.
defineProps({
  label: { type: String, required: true },
  /**
   * A leading note under the label — Appendix D.1's Tabs blocks. When set,
   * the label tightens to a 2px gap and the note carries the 8px, which is
   * how the artifact spaces the pair; without one the label keeps its 10px.
   */
  note: { type: String, default: '' },
  /** --surface-sunken behind the block. False for Tabs' plain blocks. */
  tinted: { type: Boolean, default: true },
  /** The 1px --divider top rule. False for a block that opens a card body. */
  divided: { type: Boolean, default: true },
  pt: { type: String, default: '18px' },
  pb: { type: String, default: '22px' },
  /** Space above the rule. Tabs separates its blocks by 14px and 18px. */
  mt: { type: String, default: '0px' },
})
</script>

<template>
  <div
    class="demo-strip px-card-x"
    :class="[tinted ? 'bg-surface-sunken' : '', divided ? 'border-t border-divider' : '']"
    :style="{ '--ds-pt': pt, '--ds-pb': pb, '--ds-mt': mt }"
  >
    <!-- Spec §17.1 — border-top 1px divider, sunken surface, pad 18/24/22.
         Comment lives inside the root: a leading sibling comment makes Vue
         compile this to a Fragment root, and wrapper.classes() would then
         read the comment node instead of the div. -->
    <div data-label class="text-column-header text-text-header" :class="note ? 'mb-0.5' : 'mb-2.5'">
      {{ label }}
    </div>
    <p v-if="note" data-note class="text-caption text-text-meta mb-2">{{ note }}</p>
    <slot />
  </div>
</template>

<style scoped>
.demo-strip {
  padding-top: var(--ds-pt, 18px);
  padding-bottom: var(--ds-pb, 22px);
  margin-top: var(--ds-mt, 0px);
}
</style>
