<script setup>
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
 * A modal over a scrim. Focus moves in on open, is trapped while open, and returns to
 * the trigger on close; Esc cancels and never confirms.
 */
defineProps({
  /** v-model — whether the dialog is open. */
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  /** The consequence, not the action. Appendix D's own rule for this pattern. */
  description: { type: String, default: '' },
  /** Label for the button that goes through with it. */
  confirmLabel: { type: String, default: 'Confirm' },
  /** Label for the button that backs out — the safe one, so it sits first. */
  cancelLabel: { type: String, default: 'Cancel' },
  /**
   * Renders the destructive dress: a red icon tile and a filled red confirm.
   * The only variant the artifact shows, and the only one Appendix C
   * redlines, but a non-destructive confirmation should not borrow it.
   */
  destructive: { type: Boolean, default: true },
})

defineEmits(['update:modelValue', 'confirm'])
</script>

<template>
  <!-- lazyMount + unmountOnExit: Ark otherwise keeps a closed dialog's
       content mounted and merely hidden, so its heading and buttons sit in
       the document the whole time. The artifact renders the dialog only
       while open, and a confirmation that is not on screen has no business
       being in the tree. -->
  <DialogRoot
    :open="modelValue"
    lazy-mount
    unmount-on-exit
    @open-change="(details) => $emit('update:modelValue', details.open)"
  >
    <!-- Redline "Scrim" — rgba(23,30,44,.42), pad 24px. --scrim is one of the
         three deliberately unbridged tokens (spec §4.2), so it is referenced
         through var() rather than a bg-* utility. -->
    <DialogBackdrop data-scrim class="dialog__scrim" />
    <DialogPositioner class="dialog__positioner grid place-items-center">
      <!-- Redline "Dialog" — max-w 428, radius --r-card, --sh-dialog. -->
      <DialogContent data-dialog class="dialog w-full overflow-hidden rounded-card bg-surface">
        <div class="dialog__body">
          <div class="dialog__head flex items-center">
            <!-- Redline "Icon tile" — 30px, radius 9 (--r-field), red-50 on a
                 1px --red-border. Decorative: the title says what this is. -->
            <span
              v-if="destructive"
              data-icon
              aria-hidden="true"
              class="dialog__icon grid flex-none place-items-center rounded-field border border-red-border bg-red-50 text-red-700"
              >!</span
            >
            <DialogTitle data-title class="dialog__title text-ink-900">{{ title }}</DialogTitle>
          </div>

          <DialogDescription
            v-if="description"
            data-body
            class="dialog__desc text-body text-text-meta"
            >{{ description }}</DialogDescription
          >
        </div>

        <!-- Redline "Footer" — sunken surface under a 1px --divider, pad
             14px 24px, gap 8, right aligned. Cancel comes FIRST in the DOM so
             it is the first thing reached, and is the trigger that closes. -->
        <div
          data-footer
          class="dialog__footer flex justify-end border-t border-divider bg-surface-sunken"
        >
          <DialogCloseTrigger as-child>
            <Button variant="secondary" data-cancel>{{ cancelLabel }}</Button>
          </DialogCloseTrigger>
          <Button
            :variant="destructive ? 'destructive-fill' : 'primary'"
            data-confirm
            @click="$emit('confirm')"
            >{{ confirmLabel }}</Button
          >
        </div>
      </DialogContent>
    </DialogPositioner>
  </DialogRoot>
</template>

<style scoped>
.dialog__scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  background: var(--scrim);
}

.dialog__positioner {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  padding: 24px;
}

.dialog {
  max-width: 428px;
  box-shadow: var(--sh-dialog);
}

.dialog__body {
  padding: 22px 24px 18px;
}

.dialog__head {
  gap: 10px;
}

.dialog__icon {
  width: 30px;
  height: 30px;
  font-size: 14px;
  font-weight: 700;
}

/* Redline "Title / body" — 16.5/700 over 13.5/400 at 1.55. 16.5px sits
   between --text-section-title (17) and --text-row-title (14) with no token
   of its own. */
.dialog__title {
  font-size: 16.5px;
  font-weight: 700;
}

.dialog__desc {
  margin-top: 12px;
  text-wrap: pretty;
}

.dialog__footer {
  gap: 8px;
  padding: 14px 24px;
}
</style>
