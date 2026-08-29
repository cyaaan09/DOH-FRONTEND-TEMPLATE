<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/design-system'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink-900">
    <header class="border-b border-hairline bg-surface">
      <nav class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span class="font-bold">Frontend Template</span>
        <RouterLink to="/" class="text-sm text-ink-600 hover:text-green-text">Home</RouterLink>
        <RouterLink to="/about" class="text-sm text-ink-600 hover:text-green-text">About</RouterLink>

        <button
          type="button"
          class="ml-auto h-compact rounded-field border border-field px-3 text-sm hover:bg-surface-muted"
          @click="toggleTheme()"
        >
          {{ isDark ? 'Light' : 'Dark' }}
        </button>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>
