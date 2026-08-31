<script setup>
/**
 * Redline "Header · pad 12px 32px · rgba(255,255,255,.75) · blur 6px ·
 * sticky z 6" and "Breadcrumb · 13px / 500 --text-meta · separator /
 * --separator · current --ink-900".
 *
 * The translucent surface is written against --surface, not white, so it
 * follows the theme — a literal would glare across the dark canvas the way
 * the page-shell schematic's header did before it was fixed.
 */
defineProps({
  /** Array<string> — the last entry is the current page. */
  breadcrumb: { type: Array, default: () => [] },
  account: { type: Object, default: null },
})
</script>

<template>
  <header data-app-header class="app-header flex flex-wrap items-center border-b border-hairline">
    <nav
      v-if="breadcrumb.length"
      data-breadcrumb
      class="app-header__crumbs flex items-center"
      aria-label="Breadcrumb"
    >
      <template v-for="(crumb, i) in breadcrumb" :key="crumb">
        <span v-if="i > 0" aria-hidden="true" class="app-header__sep">/</span>
        <span
          data-crumb
          :class="
            i === breadcrumb.length - 1 ? 'app-header__current text-ink-900' : 'text-text-meta'
          "
          :aria-current="i === breadcrumb.length - 1 ? 'page' : undefined"
          >{{ crumb }}</span
        >
      </template>
    </nav>

    <div class="app-header__end flex items-center">
      <slot />
      <span
        v-if="account"
        data-header-avatar
        aria-hidden="true"
        class="app-header__avatar grid flex-none place-items-center"
        >{{ account.initials }}</span
      >
    </div>
  </header>
</template>

<style scoped>
.app-header {
  gap: 16px;
  /* Redline "Header · pad 12px 32px" — the 32px gutter is a desktop value;
     below the rail's own breakpoint it costs 64px of a 390px viewport, which
     is what pushed the avatar past the card. */
  padding: 12px 32px;
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: color-mix(in srgb, var(--surface) 75%, transparent);
  backdrop-filter: blur(6px);
}

.app-header__crumbs {
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
}

.app-header__sep {
  color: var(--separator);
}

.app-header__end {
  gap: 12px;
  margin-left: auto;
}

@media (max-width: 767px) {
  .app-header {
    padding: 12px 16px;
  }
}

/* Redline "Avatar · 34px circle · --avatar-bg · ring 1px --border-card". */
.app-header__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--avatar-bg);
  color: var(--ink-700);
  font-size: 11.5px;
  font-weight: 700;
  box-shadow: 0 0 0 1px var(--border-card);
}
</style>
