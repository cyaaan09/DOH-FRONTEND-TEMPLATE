<script setup>
/**
 * Rows for files that are uploading, done, or failed.
 *
 * Hand-built rather than Ark's `FileUploadItem` family: those parts render
 * the machine's OWN accepted-file list, and Ark's file-upload has no upload
 * state or progress model at all (verified against @zag-js/file-upload —
 * it tracks accepted/rejected, nothing about transfer). The artifact's list
 * carries a percentage, a success note and a failure note, all of which are
 * the consumer's data, so the rows arrive as a prop. Recorded in spec §17.3.
 */
const props = defineProps({
  /**
   * Array<{ id, name, size, ext, state: 'uploading' | 'done' | 'failed',
   * pct?: number }>, in display order.
   */
  files: { type: Array, required: true },
  /** Shown in place of the rows when `files` is empty. */
  emptyText: { type: String, default: 'No files attached yet.' },
  doneNote: { type: String, default: 'Uploaded · virus scan passed' },
  failedNote: {
    type: String,
    default: 'Over the 10 MB limit — compress or split the file.',
  },
  removeLabel: { type: String, default: 'Remove' },
})

defineEmits(['remove'])

// One branch per state, each naming every property it owns — never a base
// class plus an override, which is this project's recurring defect.
function rowClass(file) {
  return file.state === 'failed' ? 'bg-red-50 border-red-border' : 'bg-surface border-hairline'
}

function markClass(file) {
  return file.state === 'failed' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-text-header'
}

function noteClass(file) {
  // Redline "File note" — a failure is 500 in the error red, a success 400 in
  // the green text tone.
  return file.state === 'failed' ? 'font-medium text-red-700' : 'text-green-text'
}

function noteText(file) {
  return file.state === 'failed' ? props.failedNote : props.doneNote
}
</script>

<template>
  <div class="filelist flex flex-col">
    <div
      v-for="file in files"
      :key="file.id"
      data-file-row
      class="filelist__row flex items-center border"
      :class="rowClass(file)"
    >
      <!-- Redline "Type mark" — 34px tile, 10px/700 at 0.04em tracking. -->
      <span
        data-mark
        aria-hidden="true"
        class="filelist__mark grid flex-none place-items-center rounded-control"
        :class="markClass(file)"
        >{{ file.ext }}</span
      >

      <div class="min-w-0 flex-1">
        <div class="filelist__head flex items-baseline">
          <span data-name class="truncate text-body font-medium text-ink-900">{{ file.name }}</span>
          <span data-size class="flex-none text-hint text-text-meta">{{ file.size }}</span>
        </div>

        <!-- Redline "Progress" — 5px track on --neutral-100 under the name,
             filled with --grad-meter, the same gradient Meter.vue uses. -->
        <div
          v-if="file.state === 'uploading'"
          data-bar
          role="progressbar"
          :aria-valuenow="file.pct ?? 0"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Uploading ${file.name}`"
          class="filelist__track overflow-hidden rounded-pill bg-neutral-100"
        >
          <div
            data-bar-fill
            class="filelist__fill h-full rounded-pill"
            :style="{ width: `${file.pct ?? 0}%` }"
          />
        </div>

        <div v-else data-note class="filelist__note text-hint" :class="noteClass(file)">
          {{ noteText(file) }}
        </div>
      </div>

      <!-- Redline "Remove" — 26px ghost tile; hover turns it destructive. -->
      <button
        data-remove
        type="button"
        class="filelist__remove flex-none rounded-tile text-text-meta"
        :aria-label="`${removeLabel} ${file.name}`"
        @click="$emit('remove', file)"
      >
        ×
      </button>
    </div>

    <p v-if="!files.length" data-empty class="filelist__empty text-caption text-text-meta">
      {{ emptyText }}
    </p>
  </div>
</template>

<style scoped>
.filelist {
  gap: 8px;
}

/* Redline "File row" — pad 12px 14px, radius 10 (no token: --r-field is 9,
   --r-panel 12), gap 12px to the mark and the remove button. */
.filelist__row {
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
}

.filelist__mark {
  width: 34px;
  height: 34px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.filelist__head {
  gap: 8px;
}

.filelist__track {
  height: 5px;
  margin-top: 7px;
}

.filelist__fill {
  background: var(--grad-meter);
  transition: width var(--t-control) ease;
}

.filelist__note {
  margin-top: 4px;
}

.filelist__remove {
  width: 26px;
  height: 26px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--t-control) ease,
    color var(--t-control) ease;
}

@media (hover: hover) {
  .filelist__remove:hover {
    background: var(--surface-muted);
    color: var(--red-700);
  }
}

/* Redline "Empty" — dashed hairline panel at the row radius. */
.filelist__empty {
  padding: 14px 16px;
  border: 1px dashed var(--border-card);
  border-radius: 10px;
}
</style>
