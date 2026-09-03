<route lang="json">
{ "meta": { "layout": "app" } }
</route>

<script setup>
import { EmptyState, Page, Section } from '@/design-system'
import PageHeader from '@/components/PageHeader.vue'
</script>

<template>
  <Page>
    <PageHeader
      title="Second page"
      subtitle="A placeholder, so the navigation has somewhere to go."
    />

    <!-- A Section here IS right: the empty state is not a card, so this is the
         page's one card rather than a card inside one. -->
    <Section class="second-page__card">
      <EmptyState
        title="Nothing here yet"
        description="This page exists to prove the navigation and its active state work. Replace it with the second screen your team actually needs."
      />
    </Section>
  </Page>
</template>

<style scoped>
/* Section owns colour and radius but not padding — its content decides. */
.second-page__card {
  padding: var(--pad-card-x);
}
</style>
