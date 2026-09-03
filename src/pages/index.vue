<route lang="json">
{ "redirect": "/dashboard" }
</route>

<template>
  <!-- Never rendered: the route above redirects before this component mounts.
       Kept as a file rather than deleted so "/" still resolves, and so the
       redirect lives next to the route it belongs to rather than in the
       router, where file-based routing would not expect to find it. -->
  <div />
</template>
