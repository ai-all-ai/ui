<script setup lang="ts">
// The /ds page of the gallery layer: the whole gallery is one component (UiGallery). Dev only, see the middleware.
import { useHead } from '#imports';
// Tokens for a site that loads none of the package's CSS (aiallUi.css false): layered, so the site's own rules win
import '../../dist/styles/foundation.css';
import UiGallery from '../components/UiGallery.vue';

useHead({ title: 'ds · source files', meta: [{ name: 'robots', content: 'noindex,nofollow' }] });
</script>

<style scoped>
/* the same width as the brandbook: the site's content width (--page-max) plus the side margins */
.gallery-page {
  width: min(100%, calc(var(--page-max) + var(--page-gutter) * 2));
  margin-inline: auto;
  padding: var(--ui-page-top, var(--space-8)) var(--page-gutter) var(--space-16);
}
</style>

<template>
  <main id="main" tabindex="-1" class="gallery-page">
    <UiGallery />
  </main>
</template>
