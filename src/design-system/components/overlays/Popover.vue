<script setup>
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverPositioner,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverCloseTrigger,
} from '@ark-ui/vue/popover'
import Button from '../forms/Button.vue'

/**
 * Redline "Popover a11y · focus trapped, Esc closes, focus returns to the
 * trigger · it is a dialog without a scrim" — Ark's machine provides all of
 * that, which is the whole reason a popover is not a styled tooltip.
 *
 * Redline "Popover actions · dismiss reads Got it, not Close": the dismiss
 * acknowledges the explanation rather than describing the widget, so it is
 * the default here and a caller has to work to make it worse.
 */
defineProps({
  title: { type: String, required: true },
  body: { type: String, default: '' },
  /** Optional confirming action, left of the dismiss. */
  action: { type: String, default: '' },
  dismissLabel: { type: String, default: 'Got it' },
  closeLabel: { type: String, default: 'Close' },
  placement: { type: String, default: 'bottom' },
})

defineEmits(['action'])
</script>

<template>
  <PopoverRoot :positioning="{ placement, gutter: 6 }">
    <PopoverTrigger as-child>
      <slot />
    </PopoverTrigger>
    <PopoverPositioner>
      <PopoverContent data-popover class="popover rounded-panel border border-hairline bg-surface">
        <div class="popover__head flex items-start">
          <PopoverTitle data-popover-title class="popover__title min-w-0 flex-1 text-ink-900">{{
            title
          }}</PopoverTitle>
          <PopoverCloseTrigger
            data-popover-close
            class="popover__close flex-none rounded-bar text-text-meta"
            :aria-label="closeLabel"
            :title="closeLabel"
            >×</PopoverCloseTrigger
          >
        </div>

        <PopoverDescription v-if="body" data-popover-body class="popover__body text-ink-700">{{
          body
        }}</PopoverDescription>
        <slot name="body" />

        <div class="popover__actions flex items-center justify-end">
          <Button v-if="action" size="compact" variant="primary" @click="$emit('action')">{{
            action
          }}</Button>
          <PopoverCloseTrigger as-child>
            <Button data-popover-dismiss size="compact" variant="secondary">{{
              dismissLabel
            }}</Button>
          </PopoverCloseTrigger>
        </div>
      </PopoverContent>
    </PopoverPositioner>
  </PopoverRoot>
</template>

<style scoped>
/* Redline "Popover · max-w 300px · pad 14px · radius --r-panel · 1px
   --border-card · shadow 0 12px 28px" — --sh-panel is exactly that shadow. */
.popover {
  max-width: 300px;
  padding: 14px;
  box-shadow: var(--sh-panel);
  z-index: var(--z-popover);
}

.popover__head {
  gap: 8px;
}

/* Redline "Popover head · 13.5px / 700 · body 12.5px / 1.5". */
.popover__title {
  font-size: 13.5px;
  font-weight: 700;
}

.popover__close {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  font-size: 13px;
  cursor: pointer;
}

.popover__close:hover {
  background: var(--surface-muted);
  color: var(--ink-900);
}

.popover__body {
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.5;
  text-wrap: pretty;
}

.popover__actions {
  gap: 8px;
  margin-top: 12px;
}
</style>
