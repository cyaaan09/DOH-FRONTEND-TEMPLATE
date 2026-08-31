<script setup>
/**
 * Redline "Page · A4 portrait at TRUE 210:297 aspect, any scale". The aspect
 * is enforced by aspect-ratio rather than fixed pixels, so the sheet stays
 * honest at every width — a certificate that previews at the wrong
 * proportions teaches the wrong thing about where the signature lands.
 *
 * Redline "Fidelity · preview and print share markup and stylesheet with one
 * page box — if they can disagree, the preview is decoration".
 */
defineProps({
  /** Redline "Unsigned · preview watermarked · Print disabled". */
  signed: { type: Boolean, default: true },
  /** The blocking notice's copy when unsigned. */
  blockedTitle: { type: String, default: 'Not signed yet' },
  blockedAction: { type: String, default: 'Sign now' },
  pageLabel: { type: String, default: 'Page 1 of 1' },
  zoom: { type: String, default: '100%' },
  watermark: { type: String, default: 'UNSIGNED' },
})

defineEmits(['sign', 'download', 'print'])
</script>

<template>
  <div
    data-print-preview
    class="print overflow-hidden rounded-panel border border-hairline bg-surface"
  >
    <div
      data-print-toolbar
      class="print__toolbar flex flex-wrap items-center border-b border-divider"
    >
      <slot name="toolbar" />
      <span class="print__meta flex items-center text-hint text-text-meta">
        <span data-page-label>{{ pageLabel }}</span>
        <span data-zoom class="font-mono">{{ zoom }}</span>
      </span>
    </div>

    <!-- Redline "Unsigned · --toast-bg-amber · 1px notice · Sign now" — the
         fix is one button away, which is the Blocking row's whole point. -->
    <div v-if="!signed" data-blocked-notice class="print__blocked flex flex-wrap items-center">
      <span
        aria-hidden="true"
        class="print__blocked-icon grid flex-none place-items-center rounded-pill"
        >!</span
      >
      <span class="min-w-0 flex-1 text-caption text-amber-text">{{ blockedTitle }}</span>
      <button
        data-sign-now
        type="button"
        class="print__sign text-hint font-medium text-amber-text"
        @click="$emit('sign')"
      >
        {{ blockedAction }}
      </button>
    </div>

    <!-- Redline "Desk · --canvas around the sheet · sheet --surface with
         shadow, SQUARE corners" — paper has no radius. -->
    <div data-print-desk class="print__desk">
      <div data-print-sheet class="print__sheet" :class="signed ? '' : 'print__sheet--unsigned'">
        <div class="print__margin"><slot /></div>
        <span v-if="!signed" data-watermark aria-hidden="true" class="print__watermark">{{
          watermark
        }}</span>
      </div>
    </div>

    <div
      data-print-footer
      class="print__footer flex flex-wrap items-center border-t border-divider"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* Redline "Toolbar · 10px 14px · --surface-sunken". */
.print__toolbar {
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface-sunken);
}

.print__meta {
  gap: 12px;
  margin-left: auto;
}

.print__blocked {
  gap: 10px;
  padding: 10px 14px;
  background: var(--toast-bg-amber);
  border-bottom: 1px solid var(--notice-border-amber);
}

.print__blocked-icon {
  width: 20px;
  height: 20px;
  background: var(--amber-100);
  color: var(--amber-text);
  font-size: 11px;
  font-weight: 700;
}

.print__sign {
  cursor: pointer;
}

.print__desk {
  padding: 18px;
  background: var(--canvas);
}

/* Redline "Page · A4 portrait at true 210:297 aspect, any scale". */
.print__sheet {
  position: relative;
  margin-inline: auto;
  max-width: 340px;
  aspect-ratio: 210 / 297;
  background: var(--surface);
  box-shadow: 0 8px 24px rgb(16 24 40 / 0.16);
  overflow: hidden;
}

/* Redline "20mm margins shown as a 1px dashed --divider guide" — 20mm of
   210mm is 9.52%, so the guide scales with the sheet instead of drifting
   away from true at other zooms. */
.print__margin {
  position: absolute;
  inset: 9.52%;
  border: 1px dashed var(--divider);
}

.print__sheet--unsigned {
  background: var(--toast-bg-amber);
}

.print__watermark {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  /* overflow: hidden here, and the rotation on the CHILD. Rotating this box
     directly makes its own bounding rect wider than the sheet, which reads as
     the card overflowing even though the sheet clips it — the layout gate
     measures rects, not what you can see. */
  overflow: hidden;
  pointer-events: none;
}

.print__watermark-text {
  transform: rotate(-24deg);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: color-mix(in srgb, var(--amber-text) 18%, transparent);
}

/* Redline "Footer · 12px 14px · 1px top --divider · toggles left, actions
   right". */
.print__footer {
  gap: 10px;
  padding: 12px 14px;
}
</style>
