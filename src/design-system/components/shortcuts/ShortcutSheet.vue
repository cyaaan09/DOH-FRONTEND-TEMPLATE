<script setup>
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogTitle,
  DialogCloseTrigger,
} from '@ark-ui/vue/dialog'

/**
 * Redline "Contract · listed here means bound everywhere; not listed means
 * not bound". The sheet is not documentation of the bindings — it IS the
 * binding list, which is why it renders from data rather than prose.
 *
 * Redline "Separator · encodes the relationship" — `+` for a true chord,
 * italic `then` for a sequence, italic `or` for alternatives. A single
 * separator would flatten three different instructions into one shape.
 */
defineProps({
  modelValue: { type: Boolean, default: false },
  /** Array<{ label, rows: [{ keys: [...], joiner?: 'chord'|'then'|'or', label }] }>. */
  groups: { type: Array, required: true },
  title: { type: String, default: 'Keyboard shortcuts' },
  /** Redline "Platform · stated in the footer". */
  platformNote: {
    type: String,
    default: '⌘ is Ctrl and ⌥ is Alt on Windows.',
  },
  printLabel: { type: String, default: 'Print this sheet' },
  closeLabel: { type: String, default: 'Close' },
})

defineEmits(['update:modelValue', 'print'])

// A function, not a lookup object: an object with a `then` KEY is treated as
// thenable and can hang an await that touches it. The three joiners happen to
// include the word `then`, which is exactly the collision oxlint warns about.
function joinerText(joiner) {
  if (joiner === 'then') return 'then'
  if (joiner === 'or') return 'or'
  return '+'
}
</script>

<template>
  <DialogRoot
    :open="modelValue"
    lazy-mount
    unmount-on-exit
    @open-change="(details) => $emit('update:modelValue', details.open)"
  >
    <DialogBackdrop class="sheet__scrim" />
    <DialogPositioner class="sheet__positioner grid place-items-center">
      <DialogContent
        data-shortcut-sheet
        class="sheet w-full overflow-hidden rounded-card bg-surface"
      >
        <div class="sheet__head flex items-center border-b border-divider">
          <DialogTitle data-sheet-title class="sheet__title min-w-0 flex-1 text-ink-900">{{
            title
          }}</DialogTitle>
          <DialogCloseTrigger
            data-sheet-close
            class="sheet__close flex-none rounded-bar text-text-meta"
            :aria-label="closeLabel"
            :title="closeLabel"
            >×</DialogCloseTrigger
          >
        </div>

        <div class="sheet__body">
          <div v-for="group in groups" :key="group.label" data-shortcut-group>
            <div data-group-label class="sheet__group text-text-header">{{ group.label }}</div>
            <div
              v-for="row in group.rows"
              :key="row.label"
              data-shortcut-row
              class="sheet__row flex items-center"
            >
              <span class="min-w-0 flex-1 text-ink-700">{{ row.label }}</span>
              <span class="sheet__keys flex flex-none items-center">
                <template v-for="(key, i) in row.keys" :key="i">
                  <span
                    v-if="i > 0"
                    data-joiner
                    class="sheet__joiner"
                    :class="row.joiner === 'chord' ? '' : 'sheet__joiner--word'"
                    >{{ joinerText(row.joiner) }}</span
                  >
                  <kbd data-keycap class="sheet__cap rounded-bar font-mono">{{ key }}</kbd>
                </template>
              </span>
            </div>
          </div>
        </div>

        <div
          class="sheet__footer flex flex-wrap items-center border-t border-divider bg-surface-sunken"
        >
          <span data-platform-note class="text-hint text-text-meta">{{ platformNote }}</span>
          <button
            data-print-sheet
            type="button"
            class="sheet__print text-hint font-medium text-green-text"
            @click="$emit('print')"
          >
            {{ printLabel }}
          </button>
        </div>
      </DialogContent>
    </DialogPositioner>
  </DialogRoot>
</template>

<style scoped>
.sheet__scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  background: var(--scrim);
}

.sheet__positioner {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  padding: 24px;
}

/* Redline "Sheet · max-w 620px · radius --r-card · --sh-dialog". */
.sheet {
  max-width: 620px;
  box-shadow: var(--sh-dialog);
}

.sheet__head {
  gap: 8px;
  padding: 14px 18px;
}

.sheet__title {
  font-size: 15px;
  font-weight: 700;
}

.sheet__close {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  font-size: 14px;
  cursor: pointer;
}

/* Redline "Sheet · groups auto-fit minmax(250px,1fr)". */
.sheet__body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr));
  gap: 4px 28px;
  padding: 16px 18px 18px;
}

.sheet__group {
  padding: 10px 0 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* Redline "Row · label 13px left, caps right · pad 8px 0 · 1px bottom". */
.sheet__row {
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--divider-row);
  font-size: 13px;
}

.sheet__keys {
  gap: 5px;
}

/* Redline "Keycap · 11px mono · pad 3px 7px · radius --r-bar · --surface ·
   1px --border-card · shadow 0 1px 0 --border-card". */
.sheet__cap {
  padding: 3px 7px;
  background: var(--surface);
  border: 1px solid var(--border-card);
  box-shadow: 0 1px 0 var(--border-card);
  font-size: 11px;
  color: var(--ink-700);
}

.sheet__joiner {
  font-size: 10px;
  color: var(--ink-300);
}

/* A sequence and an alternative are words, not symbols — "g then l" is an
   instruction, "g + l" would be a lie about how it is pressed. */
.sheet__joiner--word {
  font-style: italic;
  font-size: 11px;
}

.sheet__footer {
  gap: 12px;
  padding: 12px 18px;
}

.sheet__print {
  margin-left: auto;
  cursor: pointer;
}
</style>
