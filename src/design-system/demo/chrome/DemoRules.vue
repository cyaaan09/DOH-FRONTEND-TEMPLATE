<script setup>
defineProps({
  rules: { type: Array, required: true },
})
</script>

<template>
  <div v-if="rules.length" class="demo-rules border-t border-divider">
    <!-- Spec §17.1 — border-top divider; auto-fit minmax(240px,1fr); each card
         pad 16/24 with a right rule that the negative margin hides on the last
         column of each row. The comment sits INSIDE the root: a comment before
         it makes Vue compile a Fragment root, and wrapper.classes() then reads
         the comment node instead of the element. -->
    <div v-for="rule in rules" :key="rule.title" data-rule class="demo-rules__card px-card-x py-4">
      <div data-rule-title class="text-notice font-bold text-ink-900">{{ rule.title }}</div>
      <p data-rule-body class="text-caption text-text-meta mt-1">{{ rule.body }}</p>
    </div>
  </div>
</template>

<style scoped>
.demo-rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.demo-rules__card {
  border-right: 1px solid var(--divider);
  margin-right: -1px;
}
</style>
