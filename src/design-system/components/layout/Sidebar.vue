<script setup>
/**
 * Redline "Sidebar · 244px rail + flex:1 main · 62px under 1024px ·
 * off-canvas under 768px · one per page" — the app shell's own frame.
 *
 * The two widths are tokens already: --rail-w (244px) and --rail-w-collapsed
 * (62px), defined in Phase 1 and unused until now.
 */
defineProps({
  side: { type: String, default: 'left', validator: (v) => ['left', 'right'].includes(v) },
  /** Force the collapsed rail regardless of width — the demo shows both. */
  collapsed: { type: Boolean, default: false },
  /** Off-canvas rails are hidden until opened; the shell owns that state. */
  open: { type: Boolean, default: false },
})
</script>

<template>
  <div
    data-sidebar
    class="ds-sidebar"
    :class="[side === 'right' ? 'ds-sidebar--right' : '', collapsed ? 'ds-sidebar--collapsed' : '']"
    :data-open="open ? '' : undefined"
  >
    <div data-sidebar-rail class="ds-sidebar__rail"><slot name="rail" /></div>
    <div data-sidebar-main class="ds-sidebar__main"><slot /></div>
  </div>
</template>

<style scoped>
.ds-sidebar {
  display: flex;
  align-items: stretch;
}

.ds-sidebar--right {
  flex-direction: row-reverse;
}

.ds-sidebar__rail {
  flex: none;
  width: var(--rail-w);
  transition: width var(--t-rail);
}

.ds-sidebar__main {
  flex: 1;
  /* Redline "Flex children · min-width: 0 on any child whose text must clip"
     — the main column always holds clipping content, so it is built in. */
  min-width: 0;
}

.ds-sidebar--collapsed .ds-sidebar__rail {
  width: var(--rail-w-collapsed);
}

@media (max-width: 1023px) {
  .ds-sidebar__rail {
    width: var(--rail-w-collapsed);
  }
}

/* Redline "off-canvas under 768px" — the rail leaves the flow entirely and
   slides over the main column, which keeps its full width behind it. */
@media (max-width: 767px) {
  .ds-sidebar__rail {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: var(--z-dialog);
    width: var(--rail-w);
    transform: translateX(-100%);
  }

  .ds-sidebar[data-open] .ds-sidebar__rail {
    transform: translateX(0);
  }

  .ds-sidebar--right .ds-sidebar__rail {
    inset: 0 0 0 auto;
    transform: translateX(100%);
  }

  .ds-sidebar--right[data-open] .ds-sidebar__rail {
    transform: translateX(0);
  }
}
</style>
