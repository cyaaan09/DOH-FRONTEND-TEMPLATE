<script setup>
import { ref } from 'vue'
import { FileInput, FileInputCompact, FileList } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'

// Appendix D.1, "File inputs -> the three demos". The dropzone and compact
// demos carry 12.5px/500 field labels ("PNPKI certificate", "Compact ·
// inside a form row"), not uppercase DemoBlock headings — the same treatment
// TextField gives its own <label>. FILE LIST is the one true uppercase
// sub-block here, and it spans the grid rather than sitting in a strip: the
// artifact gives this section no tinted strip at all.
const FILES = ref([
  { id: 'f1', name: 'matangcas-pnpki.p12', size: '3.2 KB', ext: 'P12', state: 'done' },
  {
    id: 'f2',
    name: 'floorplan-carmen-rhu.pdf',
    size: '8.4 MB',
    ext: 'PDF',
    state: 'uploading',
    pct: 62,
  },
  { id: 'f3', name: 'annex-b2-equipment.xlsx', size: '12.8 MB', ext: 'XLS', state: 'failed' },
])

let seq = 0
function addFile() {
  seq += 1
  FILES.value = [
    ...FILES.value,
    { id: `n${seq}`, name: `certificate-${seq}.p12`, size: '3.2 KB', ext: 'P12', state: 'done' },
  ]
}

function removeFile(file) {
  FILES.value = FILES.value.filter((item) => item.id !== file.id)
}
</script>

<template>
  <DemoCard
    title="File inputs"
    description="Dashed 1.6px border at rest, green on hover. Every uploaded file becomes a row with a type mark, size, and a single destructive action."
  >
    <!-- Appendix D.1 — 320px track, gap 22px 24px, align-items: start, and
         the grid closes the card at 24px. -->
    <DemoBlocks min="320px" gap="22px 24px" pb="24px" align-start>
      <FileInput
        label="PNPKI certificate"
        constraint=".p12 · up to 5 MB"
        hint="Click it — files land in the list beside this."
        accept=".p12"
        @file-accept="addFile"
      />

      <FileInputCompact
        label="Compact · inside a form row"
        hint="Use when the field sits in a dense two-column form."
        @file-accept="addFile"
      />

      <!-- Appendix D.1 — the list spans the whole grid (grid-column: 1 / -1)
           under its own uppercase label at a 10px gap. -->
      <div class="files-section__wide">
        <div class="text-column-header text-text-header mb-2.5">
          FILE LIST — UPLOADING, DONE, FAILED
        </div>
        <FileList :files="FILES" @remove="removeFile" />
      </div>
    </DemoBlocks>
  </DemoCard>
</template>

<style scoped>
.files-section__wide {
  grid-column: 1 / -1;
}
</style>
