<route lang="json">
{ "meta": { "layout": "auth", "public": true } }
</route>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button, Card, CardBody, Notice, TextField } from '@/design-system'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function submit() {
  if (!(await auth.signIn({ email: email.value, password: password.value }))) return
  // Back to whatever sent them here, so a deep link survives signing in.
  await router.replace(typeof route.query.next === 'string' ? route.query.next : '/dashboard')
}
</script>

<template>
  <Card>
    <CardBody>
      <h1 class="login__title text-page-title text-ink-900">Sign in</h1>
      <p class="login__subtitle text-body text-text-meta">
        Online Licensing and Registration System
      </p>

      <!-- role=alert, so a failed attempt is announced rather than only drawn. -->
      <Notice v-if="auth.error" tone="red" label="Error" class="login__error">{{
        auth.error
      }}</Notice>

      <form class="login__form" novalidate @submit.prevent="submit">
        <TextField
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@doh.gov.ph"
          autocomplete="username"
          required
        />

        <!-- Redline "Trailing text action instead of an eye icon" — the same
             pattern the design system's own Text fields section uses for a
             password, which is why there is no separate PasswordField. -->
        <TextField
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          :action="showPassword ? 'HIDE' : 'SHOW'"
          autocomplete="current-password"
          required
          @action="showPassword = !showPassword"
        />

        <Button type="submit" :busy="auth.pending" class="login__submit">Sign in</Button>
      </form>
    </CardBody>
  </Card>
</template>

<style scoped>
.login__subtitle {
  margin-top: 2px;
}

.login__error {
  margin-top: 16px;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

.login__submit {
  width: 100%;
  margin-top: 2px;
}
</style>
