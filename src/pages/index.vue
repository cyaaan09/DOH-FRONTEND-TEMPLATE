<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

const features = [
  'File-based routing (unplugin-vue-router)',
  'Layouts (vite-plugin-vue-layouts-next)',
  'Pinia state management',
  'Tailwind CSS v4 + dark mode',
  'VueUse composables',
  'Vitest unit testing',
  'ESLint + Prettier + oxlint',
  'Fetch API client (src/lib/api.js)',
]
</script>

<template>
  <section>
    <h1 class="text-3xl font-bold tracking-tight">Home</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Fresh Vue 3 + Vite template. Edit
      <code class="rounded bg-gray-100 px-1 py-0.5 dark:bg-gray-800">src/pages/index.vue</code>
      to get started.
    </p>

    <div class="mt-8 flex items-center gap-4">
      <button
        type="button"
        class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="counter.increment"
      >
        Count is {{ counter.count }}
      </button>
      <span class="text-sm text-gray-500 dark:text-gray-400"
        >doubled: {{ counter.doubleCount }}</span
      >
    </div>

    <ul class="mt-10 grid gap-2 sm:grid-cols-2">
      <li
        v-for="feature in features"
        :key="feature"
        class="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-900"
      >
        ✓ {{ feature }}
      </li>
    </ul>
  </section>
</template>
