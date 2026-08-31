<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <div class="border-t border-divider bg-surface-sunken px-card-x pt-4.5 pb-5.5">
    <!-- Spec §17.1 — border-top 1px divider, sunken surface, pad 18/24/22.
         Comment lives inside the root: a leading sibling comment makes Vue
         compile this to a Fragment root, and wrapper.classes() would then
         read the comment node instead of the div. -->
    <div data-label class="text-column-header text-text-header mb-2.5">{{ label }}</div>
    <slot />
  </div>
</template>
