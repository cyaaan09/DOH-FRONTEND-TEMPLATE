# App components

Components for **this app only**. The design system in `src/design-system/`
holds components that could ship in **any** project built from this template.

## Which goes where

The test is whether the component knows anything about a business domain.

| Here (`src/components/`)                        | `src/design-system/components/`      |
| ----------------------------------------------- | ------------------------------------ |
| `LicenceStatusChip` — maps `expiring` → amber   | `Chip` — takes a `tone` prop         |
| `FacilitySearchBar` — wired to facility filters | `SearchField`, `InlineFilter`        |
| `FacilityTable` — your columns and API shape    | `DataTable` — takes columns and rows |

A component here is usually a thin wrapper that encodes a policy decision
("expiring licences are amber"), which has no place in a reusable template:

```vue
<script setup>
import { Chip } from '@/design-system'
const TONES = { active: 'green', expiring: 'amber', expired: 'red' }
defineProps({ status: String })
</script>

<template>
  <Chip :tone="TONES[status] ?? 'neutral'">{{ status }}</Chip>
</template>
```

## The one hard rule

Components here may import from `@/design-system` freely.
**Nothing in `src/design-system/` may import from here** — that would make the
design system impossible to extract into a package without dragging one app's
domain concepts along. Enforced by `src/design-system/testing/__tests__/guards.spec.js`.
