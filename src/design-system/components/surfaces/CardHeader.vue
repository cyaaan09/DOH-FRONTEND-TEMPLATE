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
    <!-- Redline "Row gap" — 8px inside cards, not the default 10px button-row
         gap. No token exists for 8px, so this uses Tailwind's built-in
         gap-2, which is exactly 8px. -->
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
