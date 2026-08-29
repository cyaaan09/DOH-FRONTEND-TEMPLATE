<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <section class="mb-section">
    <h2 class="text-section-title text-ink-900">{{ title }}</h2>
    <p v-if="note" class="text-body text-text-meta mt-1 mb-4 max-w-2xl">{{ note }}</p>
    <div class="mt-4"><slot /></div>
  </section>
</template>
