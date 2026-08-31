<script setup>
import { ref } from 'vue'
import { Button, Checkbox, PrintPreview, SegmentedTabs } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Print & PDF preview". The sheet is a real A4 aspect box, not
// a picture of one — the section's first rule is that a preview at the wrong
// proportions teaches the wrong thing about where the signature lands.
const orientation = ref('Portrait')
const includeQr = ref(true)

// Redline "Batch · page thumbnails at 210/297 aspect, overflow tile +N".
const BATCH = [
  '16-015-2527',
  '16-19-26-I-2',
  '16-015-2419',
  '16-015-2288',
  '16-015-2501',
  '16-015-2288',
]

const RULES = [
  {
    title: 'True aspect, always',
    body: 'The sheet is 210 by 297 at whatever scale fits \u2014 never a rounded card standing in for paper. Margins show as a 1px dashed guide so nothing lands in the dead zone.',
  },
  {
    title: 'Preview is the print path',
    body: 'Same markup, same stylesheet, one page box. If the preview and the printout can disagree, the preview is decoration.',
  },
  {
    title: 'Block invalid output',
    body: 'An unsigned or expired certificate cannot reach the tray \u2014 watermark the preview and disable Print, with the fix one button away.',
  },
  {
    title: 'Batch is one file per licence',
    body: "Twelve selected means twelve single-page PDFs named by LTO number, delivered zipped. A twelve-page merged document is nobody's filing system.",
  },
]
</script>

<template>
  <DemoCard
    title="Print &amp; PDF preview"
    description="Certificates get printed, so the preview shows the real page at real proportions — A4 portrait, 20mm margins, the signature block where it will actually land. What is on screen is what comes out of the tray."
  >
    <DemoBlocks min="300px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="PREVIEW — A4 AT TRUE ASPECT">
        <PrintPreview page-label="Page 1 of 1" zoom="100%">
          <template #toolbar>
            <span
              class="print-section__select rounded-control border border-field bg-surface text-mono text-ink-700"
            >
              A4 ▾
            </span>
            <SegmentedTabs
              v-model="orientation"
              :options="['Portrait', 'Landscape']"
              label="Orientation"
            />
          </template>

          <div class="print-section__cert">
            <span class="print-section__logo grid place-items-center rounded-field">OL</span>
            <div class="print-section__org text-text-header">DOH CHD CARAGA</div>
            <div class="print-section__heading text-green-fill">LICENSE TO OPERATE</div>
            <div class="print-section__type text-text-meta">Primary Care Facility</div>
            <div class="print-section__name text-ink-900">Carmen Rural Health Unit</div>
            <div class="print-section__lto font-mono text-ink-700">16-015-2527-PCF-1</div>
            <div class="print-section__sig">
              <span class="print-section__qr grid place-items-center">QR</span>
              <span class="text-hint text-text-meta">R. Villaflor · RLO</span>
            </div>
          </div>

          <template #footer>
            <Checkbox v-model="includeQr" label="Include the QR verification block" />
            <span class="print-section__actions flex items-center">
              <Button size="compact" variant="secondary" @click="() => {}">Download PDF</Button>
              <Button size="compact" variant="primary">Print</Button>
            </span>
          </template>
        </PrintPreview>
      </DemoBlock>

      <DemoBlock label="UNSIGNED — BLOCKED BEFORE THE TRAY">
        <PrintPreview :signed="false" page-label="Page 1 of 1" zoom="100%">
          <template #toolbar>
            <span
              class="print-section__select rounded-control border border-field bg-surface text-mono text-ink-700"
            >
              A4 ▾
            </span>
          </template>
          <div class="print-section__cert">
            <div class="print-section__heading text-green-fill">LICENSE TO OPERATE</div>
            <div class="print-section__name text-ink-900">Hipol Family Hospital</div>
          </div>
          <template #footer>
            <!-- Redline "Blocking · unsigned certificates cannot reach the
                 tray" — the button stays visible and disabled, so the reason
                 is legible rather than the control simply missing. -->
            <Button size="compact" variant="secondary" disabled>Download PDF</Button>
            <Button size="compact" variant="primary" disabled>Print</Button>
          </template>
        </PrintPreview>
      </DemoBlock>

      <DemoBlock label="BATCH — MANY CERTIFICATES">
        <div class="print-section__batch">
          <div class="print-section__batch-head flex items-baseline">
            <span class="text-caption text-ink-700">12 certificates · 12 pages</span>
            <span class="font-mono text-hint text-text-meta">2.4 MB</span>
          </div>
          <div class="print-section__thumbs">
            <span
              v-for="(lto, i) in BATCH.slice(0, 5)"
              :key="lto + i"
              data-thumb
              class="print-section__thumb"
              :class="i === 0 ? 'print-section__thumb--active' : ''"
            />
            <span
              data-thumb-more
              class="print-section__thumb print-section__thumb--more grid place-items-center"
              >+6</span
            >
          </div>
        </div>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
.print-section__select {
  height: 30px;
  display: inline-grid;
  place-items: center;
  padding: 0 10px;
}

.print-section__actions {
  gap: 8px;
  margin-left: auto;
}

/* The certificate: everything centred, the heading tracked out, the LTO
   number in mono because it is copied and compared digit by digit. */
.print-section__cert {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 10px;
  text-align: center;
}

.print-section__logo {
  width: 22px;
  height: 22px;
  background: var(--green-900);
  color: var(--logo-ink);
  font-size: 8px;
  font-weight: 700;
}

.print-section__org {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

/* Redline "Certificate · LICENSE TO OPERATE 0.1em --green-fill centred". */
.print-section__heading {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin-top: 6px;
}

.print-section__type {
  font-size: 7px;
}

.print-section__name {
  font-size: 11px;
  font-weight: 700;
  margin-top: 4px;
}

.print-section__lto {
  font-size: 8px;
}

.print-section__sig {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-top: auto;
}

.print-section__qr {
  width: 26px;
  height: 26px;
  border: 1px solid var(--divider);
  font-size: 7px;
  color: var(--ink-300);
}

.print-section__batch {
  padding: 14px;
  border: 1px solid var(--divider);
  border-radius: var(--r-panel);
  background: var(--surface-card-muted);
}

.print-section__batch-head {
  gap: 10px;
  margin-bottom: 10px;
}

.print-section__batch-head span:last-child {
  margin-left: auto;
}

/* Redline "Batch · page thumbnails at 210/297 aspect, active 1px
   --green-fill + 2px ring, overflow tile +N dashed". */
.print-section__thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 8px;
}

.print-section__thumb {
  aspect-ratio: 210 / 297;
  background: var(--surface);
  border: 1px solid var(--border-card);
}

.print-section__thumb--active {
  border-color: var(--green-fill);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--green-fill) 18%, transparent);
}

.print-section__thumb--more {
  background: none;
  border: 1px dashed var(--separator);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-meta);
}
</style>
