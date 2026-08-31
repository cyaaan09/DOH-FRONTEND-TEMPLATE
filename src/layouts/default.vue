<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useTheme } from '@/design-system'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink-900">
    <!-- Redline "Skip link · first tab stop jumps past the rail to <main>".
         AppShell carries its own; this layout is the one real page shell in
         the template and needs the same first tab stop. -->
    <a class="layout__skip rounded-field" href="#main">Skip to main content</a>
    <header class="border-b border-hairline bg-surface">
      <!-- Redline "Nav · <nav aria-label='Primary'>". Two <nav> landmarks on
           one page are indistinguishable without it. -->
      <nav aria-label="Primary" class="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span class="font-bold">Frontend Template</span>
        <RouterLink to="/" class="text-sm text-ink-600 hover:text-green-text">Home</RouterLink>
        <RouterLink to="/about" class="text-sm text-ink-600 hover:text-green-text"
          >About</RouterLink
        >

        <button
          type="button"
          class="ml-auto h-compact rounded-field border border-field px-3 text-sm hover:bg-surface-muted"
          @click="toggleTheme()"
        >
          {{ isDark ? 'Light' : 'Dark' }}
        </button>
      </nav>
    </header>

    <main id="main" tabindex="-1" class="mx-auto max-w-5xl px-6 py-10">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Off-screen until focused, never display:none — that would drop it from the
   tab order and defeat the point. Mirrors AppShell's own skip link. */
.layout__skip {
  position: absolute;
  left: 8px;
  top: -100px;
  z-index: var(--z-dialog);
  padding: 9px 14px;
  background: var(--surface);
  border: 1px solid var(--green-500);
  box-shadow: var(--ring-focus);
  font-size: 13px;
  font-weight: 500;
  color: var(--green-text);
}

.layout__skip:focus {
  top: 8px;
}
</style>
