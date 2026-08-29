<template>
  <div
    class="flex items-center justify-end gap-2 px-card-x py-3.5 bg-surface-sunken border-t border-divider"
  >
    <!-- Redline "Row gap" — 8px inside cards, not the default 10px
         button-row gap. No token exists for 8px, so this uses Tailwind's
         built-in gap-2, which is exactly 8px. -->
    <slot />
  </div>
</template>
