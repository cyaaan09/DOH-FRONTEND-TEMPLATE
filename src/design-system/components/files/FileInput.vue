<script setup>
import {
  FileUploadRoot,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadLabel,
} from '@ark-ui/vue/file-upload'

const props = defineProps({
  /** Field name above the dropzone — Appendix D.1's `PNPKI certificate`. */
  label: { type: String, required: true },
  /** First line inside the zone. */
  title: { type: String, default: 'Drop a file or click to browse' },
  /** Second line inside the zone — the artifact's `.p12 · up to 5 MB`. */
  constraint: { type: String, default: '' },
  /** Note below the zone, same slot a TextField hint occupies. */
  hint: { type: String, default: '' },
  /** Passed to the native input, e.g. `.p12`. */
  accept: { type: String, default: '' },
  maxFiles: { type: Number, default: 1 },
})

defineEmits(['fileAccept'])

// Ark renders the dropzone as role="button" with tabIndex 0 (verified in
// @zag-js/file-upload's getDropzoneProps), so click-to-browse and keyboard
// activation come from the machine. The artifact uses a bare <label> for the
// same job; the ARIA button is the stronger of the two and is what ships.
void props
</script>

<template>
  <FileUploadRoot
    class="fileinput flex flex-col"
    :accept="accept || undefined"
    :max-files="maxFiles"
    @file-accept="(details) => $emit('fileAccept', details)"
  >
    <FileUploadLabel data-label class="text-field-label text-ink-700 mb-1.5">{{
      label
    }}</FileUploadLabel>

    <!-- Redline "Dropzone" — 1.6px dashed --border-dashed, radius 10, pad 16,
         gap 12; hover swaps the border to --green-500 over --dropzone-hover.
         Border width and radius have no token (--r-field is 9, --r-panel 12),
         so the whole border is declared once in the style block rather than
         split between a utility and an override. -->
    <FileUploadDropzone data-dropzone class="fileinput__zone flex items-center">
      <span data-mark aria-hidden="true" class="fileinput__mark grid flex-none place-items-center"
        >↑</span
      >
      <span>
        <span data-title class="block text-body font-bold text-ink-900">{{ title }}</span>
        <span
          v-if="constraint"
          data-constraint
          class="fileinput__constraint block text-hint text-text-meta"
          >{{ constraint }}</span
        >
      </span>
    </FileUploadDropzone>

    <FileUploadHiddenInput />

    <p v-if="hint" data-hint class="fileinput__hint text-hint text-text-meta">{{ hint }}</p>
  </FileUploadRoot>
</template>

<style scoped>
.fileinput__zone {
  gap: 12px;
  padding: 16px;
  /* radius 10px sits between --r-field (9) and --r-panel (12) and has no token */
  border: 1.6px dashed var(--border-dashed);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color var(--t-control) ease,
    background-color var(--t-control) ease;
}

/* Split, not wrapped whole: dragging a file onto the zone happens on a touch
   device too, so only the :hover half is conditional. Wrapping both would have
   silently removed the drag feedback on tablets. */
.fileinput__zone[data-dragging] {
  border-color: var(--green-500);
  background: var(--dropzone-hover);
}

@media (hover: hover) {
  .fileinput__zone:hover {
    border-color: var(--green-500);
    background: var(--dropzone-hover);
  }
}

.fileinput__zone[data-disabled] {
  cursor: not-allowed;
}

/* Redline "Dropzone mark" — 36px tile on --neutral-100, 15px/700 glyph. */
.fileinput__mark {
  width: 36px;
  height: 36px;
  border-radius: var(--r-control);
  background: var(--neutral-100);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-header);
}

.fileinput__constraint {
  margin-top: 1px;
}

.fileinput__hint {
  margin-top: 6px;
}
</style>
