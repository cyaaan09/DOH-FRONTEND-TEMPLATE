<script setup>
/**
 * The signed-out shell: no navigation, nothing to click but the form.
 *
 * A separate layout rather than a flag on the app one, because the two share
 * nothing — this page has no rail, no header, and no account to show, and
 * threading "hide all of it" through the app layout is how a shell ends up
 * with a branch per screen.
 */
</script>

<template>
  <div class="auth-layout bg-canvas">
    <main id="main" class="auth-layout__panel">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
}

.auth-layout__panel {
  width: 100%;
  max-width: 380px;
}
</style>
