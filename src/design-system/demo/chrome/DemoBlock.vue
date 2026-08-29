<script setup>
defineProps({
  label: { type: String, required: true },
  note: { type: String, default: '' },
})
</script>

<template>
  <div>
    <!-- Spec §17.1 — label 10.5/700/0.08em, margin-bottom 4px -->
    <div data-label class="text-column-header text-text-header mb-1">{{ label }}</div>
    <!-- note 12.5/1.5, margin-bottom 10px -->
    <p v-if="note" data-note class="text-caption text-text-meta mb-2.5">{{ note }}</p>
    <slot />
  </div>
</template>
