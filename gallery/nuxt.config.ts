// Nuxt layer of the /ds source gallery (@ai.all/ui/gallery). A site adds it with: extends: ['@ai.all/ui/gallery'].
// The gallery reads one folder of the site (ds by default) and is served on the dev server only.
// Override per site in its own nuxt.config.ts, or with NUXT_GALLERY_FOLDER.
export default defineNuxtConfig({
  runtimeConfig: {
    gallery: {
      folder: 'ds',
    },
  },
});
