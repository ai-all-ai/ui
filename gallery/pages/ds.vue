<script setup lang="ts">
// The /ds page of the gallery layer: the whole gallery is one component (UiGallery). Dev only, see the middleware.
import UiGallery from '../components/UiGallery.vue';

useHead({ title: 'ds · source files', meta: [{ name: 'robots', content: 'noindex,nofollow' }] });
</script>

<style scoped>
/* the same width as the brandbook: the site's content width (--page-max) plus the side margins */
.gallery-page {
  width: min(100%, calc(var(--page-max) + var(--page-gutter) * 2));
  margin-inline: auto;
  padding-inline: var(--page-gutter);
}
</style>

<template>
  <main class="gallery-page">
    <UiGallery />
  </main>
</template>
