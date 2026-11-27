export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  devServer: { port: 3333 },
  modules: ['@ai.all/ui/nuxt'],
  // source gallery at /ui/ds (dev server only); test folder ds/ is git-ignored by the module
  aiallUi: { gallery: { folder: 'ds' } },
});
