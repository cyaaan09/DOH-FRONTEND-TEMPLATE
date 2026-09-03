<route lang="json">
{ "meta": { "layout": "app" } }
</route>

<script setup>
import { EmptyState, Page, Section } from '@/design-system'
</script>

<template>
  <Page>
    <Section title="Second page">
      <EmptyState
        title="Nothing here yet"
        description="This page exists to prove the navigation and its active state work. Replace it with the second screen your team actually needs."
      />
    </Section>
  </Page>
</template>
