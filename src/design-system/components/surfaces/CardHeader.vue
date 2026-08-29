<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="flex items-start justify-between gap-3 px-card-x pt-5 pb-1">
    <div class="min-w-0">
      <h2 class="text-section-title text-ink-900">{{ title }}</h2>
      <p v-if="subtitle" class="text-body text-text-meta mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-btn-row shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
