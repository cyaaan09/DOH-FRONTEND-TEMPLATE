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

    <div class="grid gap-card sm:grid-cols-3">
      <StatCard label="Active LTOs" value="211" hint="2 due within 7 days" />
      <StatCard label="Inspection" value="8" hint="ready to sign" />
      <StatCard label="Closed" value="41" hint="rejected · forfeited" muted />
    </div>

    <div class="max-w-sm">
      <p class="text-hint text-text-meta mb-2">Meter at 62%</p>
      <Meter :value="62" :max="100" label="Upload progress" />
    </div>
  </div>
</template>
