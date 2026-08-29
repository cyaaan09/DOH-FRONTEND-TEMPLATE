<template>
  <div class="demo-blocks px-card-x pt-4.5 pb-1.5">
    <slot />
  </div>
</template>

<style scoped>
/* Spec §17.1 — repeat(auto-fit, minmax(268px, 1fr)), gap 24px. Tailwind has
 * no utility for an auto-fit track list, so it is expressed here. */
.demo-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
  gap: 24px;
}
</style>
