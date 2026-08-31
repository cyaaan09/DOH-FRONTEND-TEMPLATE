<script setup>
import { Button, HintedText, Popover, Tooltip } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Tooltip & popover". Both demos are LIVE — hovering the ⋯ and
// clicking the trigger really open them — because the section's whole subject
// is behaviour: delay, focus trapping, and where the arrow lands. A drawn
// tooltip would demonstrate none of it.
const RULES = [
  {
    title: 'Tooltip never holds the only copy',
    body: 'It is a label for something already visible. Anything a user must read to make a decision goes in the row, the field help, or a popover.',
  },
  {
    title: 'Popovers trap focus, tooltips never',
    body: 'A popover is a dialog without a scrim: Esc closes, Tab cycles inside, focus returns to the trigger. A tooltip is aria-describedby and nothing else.',
  },
  {
    title: 'Hover and focus, both',
    body: 'Every tooltip shows on keyboard focus too, or it does not exist for half your users. On touch it becomes a tap-to-toggle popover.',
  },
  {
    title: '12px offset, flip on collide',
    body: 'Popover sits 6px off its trigger with a 10px arrow; near a viewport edge it flips side rather than shifting off screen.',
  },
]
</script>

<template>
  <DemoCard
    title="Tooltip &amp; popover"
    description="Two layers with one rule between them: a tooltip names a thing, a popover holds content you can point at. If it has a button inside, it is a popover."
  >
    <DemoBlocks min="300px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="TOOLTIP — LABEL ONLY, 6PX OFFSET">
        <div class="tooltip-section__well flex flex-col">
          <div class="flex justify-center">
            <Tooltip label="Row actions">
              <button
                type="button"
                class="tooltip-section__icon grid place-items-center rounded-field border border-hairline bg-surface"
                aria-label="Row actions"
              >
                ⋯
              </button>
            </Tooltip>
          </div>

          <div class="flex justify-center">
            <Tooltip label="Expires 02 Jul 2026" placement="top">
              <HintedText tone="red">
                <span class="tooltip-section__mono font-mono text-red-700">36 days</span>
              </HintedText>
            </Tooltip>
          </div>

          <p class="tooltip-section__note text-text-meta">
            One line, under 48 characters, sentence case, no period. 120ms delay in, none out.
          </p>
        </div>
      </DemoBlock>

      <DemoBlock label="POPOVER — CONTENT PLUS ACTIONS">
        <div class="tooltip-section__well flex flex-col">
          <div class="flex justify-center">
            <Popover
              title="Legacy records"
              body="Migrated from the paper register in 2019. The scan is the source of truth — the service list was never captured, so it shows as empty rather than none."
              action="Open scan"
            >
              <Button size="compact" variant="secondary">Why is this legacy?</Button>
            </Popover>
          </div>
        </div>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
/* Appendix D.1 — both demos sit in a sunken well, 20px padded, so the layers
   have something to sit ON rather than floating over the card. */
.tooltip-section__well {
  gap: 22px;
  padding: 20px;
  border: 1px solid var(--divider);
  border-radius: var(--r-panel);
  background: var(--surface-card-muted);
}

.tooltip-section__icon {
  width: 34px;
  height: 34px;
  color: var(--nav-ink);
  font-size: 13px;
  cursor: pointer;
}

.tooltip-section__mono {
  font-size: 12.5px;
  font-weight: 700;
}

.tooltip-section__note {
  font-size: 11.5px;
  line-height: 1.45;
  text-align: center;
  text-wrap: pretty;
}
</style>
