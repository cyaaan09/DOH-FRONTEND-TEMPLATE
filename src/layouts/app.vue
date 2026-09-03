<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppHeader, AppShell, AppSidebar } from '@/design-system'
import { BRAND, NAV_GROUPS, navItemForPath } from '@/lib/navigation'
import { useAuthStore } from '@/stores/auth'

/**
 * The signed-in shell. AppShell owns the skip link and the <main> it points at,
 * so every page inside it gets a first tab stop that clears the rail.
 */
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const collapsed = ref(false)

const current = computed(() => navItemForPath(route.path))
const activeKey = computed(() => current.value?.key ?? '')

// AppSidebar's account and AppHeader's take the same shape — { initials, name,
// role } — and the store is the only source, so signing out cannot leave a
// stale name in one of them. The key is `initials`, not `mark`: `mark` is the
// BRAND's, and getting them the wrong way round leaves an empty grey circle
// with no error anywhere.
const account = computed(() =>
  auth.user
    ? { initials: initials(auth.user.name), name: auth.user.name, role: auth.user.role }
    : null,
)

function initials(name) {
  const parts = String(name).trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase() || 'U'
}

// Derived from the nav rather than hand-written per page: a breadcrumb that is
// maintained separately is a breadcrumb that goes stale.
const breadcrumb = computed(() =>
  current.value
    ? [
        current.value.group.charAt(0) + current.value.group.slice(1).toLowerCase(),
        current.value.label,
      ]
    : [],
)
</script>

<template>
  <AppShell :collapsed="collapsed" class="app-layout">
    <template #rail>
      <AppSidebar
        :groups="NAV_GROUPS"
        :active="activeKey"
        :collapsed="collapsed"
        :brand="BRAND"
        :account="account"
        @select="(item) => router.push(item.to)"
        @toggle="collapsed = !collapsed"
      />
    </template>

    <template #header>
      <AppHeader :breadcrumb="breadcrumb" :account="account" />
    </template>

    <RouterView />
  </AppShell>
</template>

<style scoped>
/* AppShell is `min-height: 100%`, which resolves to nothing without a height
   chain above it — the rail stopped under the account block and left canvas
   below it. The layout is the root of the page, so this is where the viewport
   height belongs; putting it inside AppShell would force full height on
   consumers embedding a shell in something smaller. */
.app-layout {
  min-height: 100vh;
}
</style>
