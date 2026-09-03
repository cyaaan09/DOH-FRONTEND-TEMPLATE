<script setup>
/**
 * A page's title block: what this screen is, and the actions that belong to the
 * whole of it.
 *
 * An application component rather than a design-system one — the artifact
 * redlines a page TITLE (26px / 700 / -0.015em, "Type & layout") but has no
 * page-header component, and inventing one in the system would be putting
 * arrangement the artifact never specified behind its authority.
 */
defineProps({
  title: { type: String, required: true },
  /** One line under the title. Meta grey, so it never competes with it. */
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header data-page-header class="page-header">
    <div class="min-w-0">
      <h1 data-page-title class="text-page-title text-ink-900">{{ title }}</h1>
      <p v-if="subtitle" data-page-subtitle class="page-header__subtitle text-body text-text-meta">
        {{ subtitle }}
      </p>
    </div>
    <!-- Actions sit on the header, not on the first card: they act on the page,
         and a button inside a card reads as belonging to that card. -->
    <div v-if="$slots.actions" class="page-header__actions"><slot name="actions" /></div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  /* --gap-section is the 22px the redline puts between a card and what follows;
     the header is the thing before the first card, so it takes the same. */
  margin-bottom: var(--gap-section);
}

.page-header__subtitle {
  margin-top: 3px;
  max-width: 68ch;
}

.page-header__actions {
  display: flex;
  flex: none;
  gap: var(--gap-btn-row);
}
</style>
