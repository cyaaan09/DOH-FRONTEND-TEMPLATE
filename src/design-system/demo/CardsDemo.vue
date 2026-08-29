<script setup>
import { Button, Card, CardBody, CardFooter, CardHeader, Meter, StatCard } from '@/design-system'
</script>

<template>
  <div class="flex flex-col gap-card">
    <Card>
      <CardHeader title="Certificate" subtitle="Body sits on white, 24px gutter.">
        <template #actions>
          <Button size="compact" variant="secondary">Action</Button>
        </template>
      </CardHeader>
      <CardBody>
        Radius 14px, 1px hairline, and the card shadow. Cards never nest — a card divides instead.
      </CardBody>
      <CardFooter>
        <Button size="compact" variant="ghost">Cancel</Button>
        <Button size="compact">Save</Button>
      </CardFooter>
    </Card>

    <div class="cards-demo__stat-grid">
      <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" dot="green" />
      <StatCard label="Inspection" value="8" hint="2 overdue" dot="amber" urgent />
      <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
    </div>

    <div class="max-w-sm">
      <Meter :value="62" :max="100" label="Upload progress" caption="Uploaded" />
    </div>
  </div>
</template>

<style scoped>
/* Redline "Stat cards & meters" Grid row — auto-fit minmax(190px,1fr), gap
 * 12px. No Tailwind utility expresses an auto-fit track list, so this is the
 * same var()-backed escape hatch the components use for values with no
 * utility namespace. */
.cards-demo__stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: var(--gap-card);
}
</style>
