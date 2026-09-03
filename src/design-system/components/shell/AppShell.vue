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
  skipLabel: { type: String, default: 'Skip to main content' },
  mainId: { type: String, default: 'main-content' },
})
</script>

<template>
  <Sidebar data-app-shell :collapsed="collapsed" :open="open" class="app-shell">
    <!-- The link lives at the top of the RAIL slot, not the default one:
         Sidebar renders #rail before its default slot, so a link placed
         beside <main> came AFTER the whole navigation in the DOM — and DOM
         order is tab order, so the one thing this link exists to skip was
         the thing standing in front of it. It is absolutely positioned, so
         moving it changes nothing on screen. -->
    <template #rail>
      <!-- Redline "Skip link · first tab stop jumps past the rail to <main>".
           A rail is 15+ tab stops; without this every keyboard user walks the
           whole navigation before reaching the page they opened. Visible only
           on focus, which is why it must not be `display: none`. -->
      <a data-skip-link class="app-shell__skip rounded-field" :href="`#${mainId}`">{{
        skipLabel
      }}</a>
      <slot name="rail" />
    </template>

    <slot name="header" />
    <main :id="mainId" data-app-main class="app-shell__main" tabindex="-1"><slot /></main>
  </Sidebar>
</template>

<style scoped>
.app-shell {
  min-height: 100%;
}

.app-shell__main {
  background: var(--canvas);
}

/* Off-screen until focused, then pinned to the top-left over everything —
   NOT display:none, which would take it out of the tab order and defeat the
   whole point. */
.app-shell__skip {
  position: absolute;
  left: 8px;
  top: -100px;
  z-index: var(--z-dialog);
  padding: 9px 14px;
  background: var(--surface);
  border: 1px solid var(--green-500);
  box-shadow: var(--ring-focus);
  font-size: 13px;
  font-weight: 500;
  color: var(--green-text);
}

.app-shell__skip:focus {
  top: 8px;
}
</style>
