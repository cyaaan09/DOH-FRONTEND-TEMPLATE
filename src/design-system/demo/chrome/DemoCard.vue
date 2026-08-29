<script setup>
// Comments live inside the template root, not before it: a leading sibling
// comment makes Vue compile the template to a Fragment root, and
// wrapper.classes() would then read the comment node instead of the section.
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="mb-section overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
    <!-- Spec §17.1 — section card: radius 14, hairline, card shadow.
         Header pad 20/24/4, title at section-title scale, description at body. -->
    <div class="px-card-x pt-5 pb-1">
      <h2 class="text-section-title text-ink-900">{{ title }}</h2>
      <p v-if="description" class="text-body text-text-meta mt-0.5 max-w-4xl">{{ description }}</p>
    </div>
    <slot />
  </section>
</template>
