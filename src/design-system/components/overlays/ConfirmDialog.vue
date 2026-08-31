<script setup>
import { computed, ref, watch } from 'vue'
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogCloseTrigger,
} from '@ark-ui/vue/dialog'
import Button from '../forms/Button.vue'

/**
 * Redline's three levels, chosen by how bad the mistake is:
 *   1 reversible      — no dialog at all, a toast with Undo (not this component)
 *   2 serious         — plain dialog, destructive OUTLINE button
 *   3 irreversible    — type-to-confirm, primary disabled until the string matches
 *
 * Redline "Focus · opens on Cancel (never the destructive button)". A dialog
 * that opens focused on Revoke turns a reflexive Enter into a revocation.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** Redline "Header · title ending in a question mark". */
  title: { type: String, required: true },
  /** Redline "Body · what happens, to whom, and whether it can be undone. Never "Are you sure"." */
  body: { type: String, default: '' },
  /** Redline "Impact strip · the count of affected things". */
  impact: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  /**
   * Level 3 only. Redline "Confirm label · the identifier inline in mono —
   * the LTO number, never the word DELETE": typing DELETE is muscle memory,
   * typing the licence number means reading the licence number.
   */
  confirmPhrase: { type: String, default: '' },
  mismatchLabel: { type: String, default: 'Does not match yet.' },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const typed = ref('')
watch(
  () => props.modelValue,
  (open) => {
    if (!open) typed.value = ''
  },
)

// Redline "Matching · trim whitespace, compare case-insensitively · no shake,
// no toast, no auto-submit". The check is forgiving about form and strict
// about content — and it never submits for you.
const matches = computed(
  () =>
    !props.confirmPhrase ||
    typed.value.trim().toLowerCase() === props.confirmPhrase.trim().toLowerCase(),
)
const partial = computed(
  () => Boolean(props.confirmPhrase) && typed.value.length > 0 && !matches.value,
)
</script>

<template>
  <DialogRoot
    :open="modelValue"
    lazy-mount
    unmount-on-exit
    :initial-focus-el="() => $refs.cancel?.$el ?? $refs.cancel"
    @open-change="(details) => emit('update:modelValue', details.open)"
  >
    <DialogBackdrop data-confirm-scrim class="confirm__scrim" />
    <DialogPositioner class="confirm__positioner grid place-items-center">
      <DialogContent
        data-confirm-dialog
        class="confirm w-full overflow-hidden rounded-card bg-surface"
      >
        <div class="confirm__body">
          <div class="confirm__head flex items-center">
            <span
              data-confirm-icon
              aria-hidden="true"
              class="confirm__icon grid flex-none place-items-center rounded-field bg-red-100 text-red-700"
              >!</span
            >
            <DialogTitle data-confirm-title class="confirm__title text-ink-900">{{
              title
            }}</DialogTitle>
          </div>

          <DialogDescription v-if="body" data-confirm-body class="confirm__text text-ink-700">{{
            body
          }}</DialogDescription>

          <div v-if="impact" data-confirm-impact class="confirm__impact">{{ impact }}</div>

          <div v-if="confirmPhrase" class="confirm__type">
            <label data-confirm-label class="confirm__label block text-ink-700">
              Type
              <span class="confirm__phrase font-mono text-ink-900">{{ confirmPhrase }}</span> to
              confirm
              <input
                v-model="typed"
                data-confirm-input
                class="confirm__input mt-1.5 block w-full rounded-field border bg-surface font-mono"
                :class="partial ? 'confirm__input--partial border-red-700' : 'border-field'"
                :aria-invalid="partial ? 'true' : undefined"
                :aria-describedby="partial ? 'confirm-mismatch' : undefined"
              />
            </label>
            <p
              v-if="partial"
              id="confirm-mismatch"
              data-confirm-mismatch
              class="confirm__mismatch text-red-700"
            >
              {{ mismatchLabel }}
            </p>
          </div>
        </div>

        <div
          data-confirm-footer
          class="confirm__footer flex justify-end border-t border-divider bg-surface-sunken"
        >
          <DialogCloseTrigger as-child>
            <Button ref="cancel" data-confirm-cancel variant="secondary">{{ cancelLabel }}</Button>
          </DialogCloseTrigger>
          <!-- Redline "Blocked button · visible, not hidden" — a control that
               disappears teaches nothing about why it is unavailable. -->
          <Button
            data-confirm-action
            :variant="confirmPhrase ? 'destructive-fill' : 'destructive'"
            :disabled="!matches"
            @click="emit('confirm')"
            >{{ confirmLabel }}</Button
          >
        </div>
      </DialogContent>
    </DialogPositioner>
  </DialogRoot>
</template>

<style scoped>
/* Redline "Dialog · scrim rgba(16,24,40,.45)" — heavier than the standard
   --scrim, because this one must not read as dismissible background. */
.confirm__scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  background: color-mix(in srgb, var(--ink-900) 45%, transparent);
}

.confirm__positioner {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  padding: 24px;
}

.confirm {
  max-width: 428px;
  box-shadow: var(--sh-dialog);
}

.confirm__body {
  padding: 20px 20px 18px;
}

.confirm__head {
  gap: 10px;
}

/* Redline "Header · 32px radius-9 tile + 15.5px / 700 title". */
.confirm__icon {
  width: 32px;
  height: 32px;
  font-size: 15px;
  font-weight: 700;
}

.confirm__title {
  font-size: 15.5px;
  font-weight: 700;
}

.confirm__text {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.5;
  text-wrap: pretty;
}

/* Redline "Impact strip · --red-50 · 1px --red-border · radius 10px · 12px
   --red-700 — the count of affected things". */
.confirm__impact {
  margin-top: 12px;
  padding: 9px 12px;
  border: 1px solid var(--red-border);
  border-radius: 10px;
  background: var(--red-50);
  font-size: 12px;
  color: var(--red-700);
}

.confirm__type {
  margin-top: 14px;
}

.confirm__label {
  font-size: 12.5px;
  font-weight: 500;
}

.confirm__phrase {
  font-weight: 700;
}

/* Redline "Confirm input · 38px mono · error ring while partial". */
.confirm__input {
  height: var(--h-field);
  padding: 0 12px;
  font-size: 13.5px;
  color: var(--ink-900);
}

.confirm__input:focus {
  outline: none;
  border-color: var(--green-500);
  box-shadow: var(--ring-focus);
}

.confirm__input--partial:focus {
  border-color: var(--red-700);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--red-500) 14%, transparent);
}

.confirm__mismatch {
  margin-top: 5px;
  font-size: 11.5px;
  font-weight: 500;
}

/* Redline "Footer · 13px 20px · Cancel then the destructive action". */
.confirm__footer {
  gap: 8px;
  padding: 13px 20px;
}
</style>
