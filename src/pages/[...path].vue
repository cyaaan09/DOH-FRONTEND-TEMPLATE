<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="text-center">
    <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">404</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">The page you’re looking for doesn’t exist.</p>
    <RouterLink
      to="/"
      class="mt-6 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      Go home
    </RouterLink>
  </section>
</template>
