<script setup>
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoGap from '../chrome/DemoGap.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Added by the second 2026-08-31 artifact update. Spec §17.2 — the slot is
// visible from the start, so the page stays a live checklist. Everything
// here is generated from Appendix D: the rule cards are CONTENT the artifact
// shows, so a skeleton renders them for real even while its component slot
// is still a gap.
const RULES = [
  {
    title: 'Addressed to you, or it does not belong',
    body: "The centre carries only items with an action or a consequence for this user. System chatter belongs in the record's feed, where nobody has to dismiss it.",
  },
  {
    title: 'Unread is a tint plus a dot',
    body: '#F7FCF9 row with a 7px green dot, never bold text \u2014 bolding half a list makes both halves harder to read.',
  },
  {
    title: 'The feed is append-only',
    body: 'No dismiss, no mark-read, no edit. Corrections are new entries; the wrong one stays visible, which is the point of an audit trail.',
  },
  {
    title: 'Detail attaches to its event',
    body: 'Files, quoted reasons, and result payloads render inside the event that produced them \u2014 never as a separate row you have to correlate by timestamp.',
  },
]
</script>

<template>
  <DemoCard
    title="Notification centre &amp; activity feed"
    description="Two different jobs. The centre is unread work addressed to you, dismissible and countable. The feed is an immutable record of what happened to one object — nothing to dismiss, nothing to mark read."
  >
    <DemoBlocks>
      <DemoBlock label="NOTIFICATION CENTRE — HEADER PANEL">
        <DemoGap component="NotificationCentre" group="Notifications &amp; activity" />
      </DemoBlock>

      <DemoBlock label="ACTIVITY FEED — ONE RECORD'S HISTORY">
        <DemoGap component="NotificationCentre" group="Notifications &amp; activity" />
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>
