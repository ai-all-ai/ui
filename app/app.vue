<!-- Demo app: the developer tools cover every page, as in a real site layout.
     The asterisk favicon belongs to this demo only; the brandbook page sets none, so in a project /ui keeps the
     project's own favicon. -->
<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
});
</script>

<template>
  <NuxtPage />
  <UiDevTools />
</template>
