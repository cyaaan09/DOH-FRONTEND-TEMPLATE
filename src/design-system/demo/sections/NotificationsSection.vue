<script setup>
import { ActivityFeed, NotificationCentre } from '@/design-system'
import DemoCard from '../chrome/DemoCard.vue'
import DemoBlocks from '../chrome/DemoBlocks.vue'
import DemoBlock from '../chrome/DemoBlock.vue'
import DemoRules from '../chrome/DemoRules.vue'

// Appendix D.1, "Notification centre & activity feed". Two components side by
// side precisely because the section's first rule is that they are two jobs.
const NOTIFICATIONS = [
  {
    id: 'hipol',
    tone: 'error',
    glyph: '!',
    subject: 'Hipol Family Hospital',
    body: 'expires in 36 days and has no renewal on file.',
    time: '12 min ago',
    action: 'Open record',
    unread: true,
  },
  {
    id: 'trento',
    tone: 'portal',
    glyph: '↑',
    subject: 'Trento Birthing Home',
    body: 'resubmitted 4 documents after return.',
    time: '1 hour ago',
    action: 'Review',
    unread: true,
  },
  {
    id: 'sanluis',
    tone: 'done',
    glyph: '✓',
    body: 'Inspection result recorded for San Luis Diagnostic Center.',
    time: '3 hours ago',
    unread: true,
  },
  {
    id: 'cert',
    tone: 'system',
    glyph: '◔',
    body: 'Your signing certificate expires in 60 days.',
    time: 'Yesterday',
    action: 'Renew',
  },
]

const EVENTS = [
  {
    id: 'signed',
    initials: 'RV',
    actor: 'R. Villaflor',
    body: 'signed and issued the licence.',
    time: 'Today · 14:02',
    detail: 'LTO-16-015-2527.pdf',
    attachment: 'PDF',
  },
  {
    id: 'inspected',
    initials: 'MD',
    actor: 'M. Dela Cruz',
    body: 'recorded inspection result: passed.',
    time: '12 Jun 2026 · 10:41',
  },
  {
    id: 'returned',
    tone: 'error',
    glyph: '!',
    body: 'Application returned to facility — floor plan illegible.',
    time: '02 Jun 2026 · 16:18',
    detail:
      'Scan is below 150 dpi and the service area labels are unreadable. Resubmit as a vector export.',
  },
  {
    id: 'filed',
    tone: 'portal',
    glyph: '↑',
    body: 'Application filed through the online portal.',
    time: '19 Aug 2025 · 09:14',
  },
]

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
    <DemoBlocks min="340px" gap="22px 24px" pb="24px" align-start>
      <DemoBlock label="NOTIFICATION CENTRE — HEADER PANEL">
        <NotificationCentre :items="NOTIFICATIONS" see-all-label="See all notifications" />
      </DemoBlock>

      <DemoBlock label="ACTIVITY FEED — ONE RECORD&#39;S HISTORY">
        <ActivityFeed :events="EVENTS" label="Licence history">
          <template #detail="{ event }">
            <span v-if="event.attachment" class="notifications-section__file flex items-center">
              <span aria-hidden="true" class="notifications-section__ext rounded-bar">{{
                event.attachment
              }}</span>
              <span class="font-mono">{{ event.detail }}</span>
            </span>
            <template v-else>{{ event.detail }}</template>
          </template>
        </ActivityFeed>
      </DemoBlock>
    </DemoBlocks>

    <DemoRules :rules="RULES" />
  </DemoCard>
</template>

<style scoped>
.notifications-section__file {
  gap: 8px;
}

.notifications-section__ext {
  padding: 2px 6px;
  background: var(--surface-muted);
  color: var(--text-header);
  font-size: 10px;
  font-weight: 700;
}
</style>
