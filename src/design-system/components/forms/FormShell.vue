<script setup>
/**
 * Redline "Shell · one card per form" — header, body, footer, and one
 * progress meter. The footer "owns every action", so a form has exactly one
 * place a user looks for Back and Continue.
 */
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  /** 0–100. Omitted, the header draws no meter. */
  progress: { type: Number, default: -1 },
  /** Redline "Autosave note · 12px --text-meta + 6px --amber-400 dot". */
  autosave: { type: String, default: '' },
})
</script>

<template>
  <form
    data-form-shell
    class="form-shell overflow-hidden rounded-card border border-hairline bg-surface"
    @submit.prevent
  >
    <div data-form-header class="form-shell__header">
      <div data-form-title class="form-shell__title text-ink-900">{{ title }}</div>
      <div v-if="subtitle" data-form-subtitle class="text-caption text-text-meta">
        {{ subtitle }}
      </div>
      <div
        v-if="progress >= 0"
        data-form-progress
        class="form-shell__meter overflow-hidden rounded-pill bg-neutral-100"
      >
        <span
          class="form-shell__meter-fill block h-full rounded-pill"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <div data-form-body class="form-shell__body"><slot /></div>

    <div
      data-form-footer
      class="form-shell__footer flex items-center border-t border-divider bg-surface-sunken"
    >
      <div
        v-if="autosave"
        data-autosave
        class="form-shell__autosave flex items-center text-hint text-text-meta"
      >
        <span aria-hidden="true" class="form-shell__dot rounded-pill" />{{ autosave }}
      </div>
      <div class="form-shell__actions flex items-center"><slot name="actions" /></div>
    </div>
  </form>
</template>

<style scoped>
/* Redline "Header · pad 18px 24px 14px · title 16px/700 · sub 12.5px". */
.form-shell__header {
  padding: 18px 24px 14px;
}

.form-shell__title {
  font-size: 16px;
  font-weight: 700;
}

/* Redline "progress 5px --divider fill --grad-meter". */
.form-shell__meter {
  height: 5px;
  margin-top: 12px;
}

.form-shell__meter-fill {
  background: var(--grad-meter);
}

/* Redline "Body · pad 20px 24px". */
.form-shell__body {
  padding: 20px 24px;
}

/* Redline "Footer · pad 14px 24px · autosave note left, actions right". */
.form-shell__footer {
  gap: 12px;
  padding: 14px 24px;
}

.form-shell__autosave {
  gap: 6px;
}

.form-shell__dot {
  width: 6px;
  height: 6px;
  flex: none;
  background: var(--amber-400);
}

/* The actions sit right whether or not an autosave note is present, so the
   footer does not jump when autosave has nothing to say yet. */
.form-shell__actions {
  gap: 8px;
  margin-left: auto;
}

/* Redline "Mobile · footer becomes sticky, buttons full-width stacked". */
@media (max-width: 640px) {
  .form-shell__footer {
    position: sticky;
    bottom: 0;
    flex-wrap: wrap;
  }

  .form-shell__actions {
    width: 100%;
    margin-left: 0;
  }

  .form-shell__actions > * {
    flex: 1;
  }
}
</style>
