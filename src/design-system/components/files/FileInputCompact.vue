<script setup>
import {
  FileUploadRoot,
  FileUploadHiddenInput,
  FileUploadLabel,
  FileUploadTrigger,
} from '@ark-ui/vue/file-upload'

/**
 * The same upload in a 38px field row, for forms too dense for a dropzone.
 */
defineProps({
  /** Field name above the row — Appendix D.1's `Compact · inside a form row`. */
  label: { type: String, required: true },
  /** Shown while nothing is chosen. */
  placeholder: { type: String, default: 'No file selected' },
  /** The chosen file's name, when there is one. */
  fileName: { type: String, default: '' },
  /** Note below the row. */
  hint: { type: String, default: '' },
  triggerLabel: { type: String, default: 'Browse' },
  accept: { type: String, default: '' },
  maxFiles: { type: Number, default: 1 },
})

defineEmits(['fileAccept'])
</script>

<template>
  <FileUploadRoot
    class="filecompact flex flex-col"
    :accept="accept || undefined"
    :max-files="maxFiles"
    @file-accept="(details) => $emit('fileAccept', details)"
  >
    <FileUploadLabel data-label class="text-field-label text-ink-700 mb-1.5">{{
      label
    }}</FileUploadLabel>

    <!-- Redline "Compact row" — the 38px field shell, but padded 0 6px 0 12px
         so the 28px trigger sits 6px from the edge while the name keeps the
         field's normal 12px inset. -->
    <div
      data-row
      class="filecompact__row flex h-field items-center rounded-field border border-field bg-surface"
    >
      <!-- 13px, not the field's 13.5px body: this line is a filename, and the
           artifact drops it a half-step. --text-notice is the 13px step. -->
      <span
        data-name
        class="filecompact__name min-w-0 flex-1 truncate text-notice"
        :class="fileName ? 'text-ink-900' : 'text-text-meta'"
        >{{ fileName || placeholder }}</span
      >

      <FileUploadTrigger
        data-trigger
        class="filecompact__trigger flex-none rounded-tile border border-field bg-surface text-mono text-ink-700"
        >{{ triggerLabel }}</FileUploadTrigger
      >
    </div>

    <FileUploadHiddenInput />

    <p v-if="hint" data-hint class="filecompact__hint text-hint text-text-meta">{{ hint }}</p>
  </FileUploadRoot>
</template>

<style scoped>
.filecompact__row {
  gap: 10px;
  padding: 0 6px 0 12px;
}

/* Redline "Compact trigger" — 28px tall, pad 0 12px, radius --r-tile (7px),
   12.5/500 on the surface; hover takes the muted surface. --text-mono names
   the 12.5/500 STEP, not a face: in Tailwind v4 a --text-* utility sets size
   and weight only, and the mono family would come from `font-mono`, which
   this trigger does not carry. */
.filecompact__trigger {
  height: 28px;
  padding: 0 12px;
  cursor: pointer;
  transition: background-color var(--t-control) ease;
}

@media (hover: hover) {
  .filecompact__trigger:hover {
    background: var(--surface-muted);
  }
}

.filecompact__hint {
  margin-top: 6px;
}
</style>
