<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoRules from '../chrome/DemoRules.vue'
import TokenBlock from '../chrome/TokenBlock.vue'

// Rule cards - spec Appendix D, handoffRules
const RULES = [
  {
    title: 'Tokens first, components second',
    body: 'Land olrs-tokens.css before any component work, then let every rule reference a variable. Raw hex in a component file is the bug.',
  },
  {
    title: 'Height is the contract',
    body: '38px fields and 34px compact controls line up across filter bars, forms, and table toolbars. If a control does not fit one of those two heights, it is the wrong control.',
  },
  {
    title: 'One green per region',
    body: 'A screen region gets exactly one filled green button. Everything else is outline, ghost, or destructive outline.',
  },
  {
    title: 'Tone means state, never decoration',
    body: 'Green issued, amber waiting or legacy, red blocked or overdue, blue portal-filed, violet modification, grey closed. No other pairings.',
  },
]
</script>

<template>
  <DemoCard
    title="Tokens for handoff"
    description="Paste this block into your stylesheet first, then build components against the variables — not raw hex. Every value above resolves to one of these."
  >
    <!-- Appendix D.1 — pad 16px 24px 24px, the block filling it. -->
    <div class="px-card-x pt-4 pb-6">
      <TokenBlock />
    </div>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
