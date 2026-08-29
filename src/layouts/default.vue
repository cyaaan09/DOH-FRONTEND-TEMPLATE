<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <nav class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span class="font-semibold">Frontend Template</span>
        <RouterLink
          to="/"
          class="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
        >
          About
        </RouterLink>

        <button
          type="button"
          class="ml-auto rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          @click="toggleDark()"
        >
          {{ isDark ? '☀️ Light' : '🌙 Dark' }}
        </button>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>
