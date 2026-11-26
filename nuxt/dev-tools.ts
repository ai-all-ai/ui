import { defineNuxtPlugin, useRoute, useRuntimeConfig } from '#imports';
import { provideUiDevTools } from '@ai.all/ui/dev-tools';

export default defineNuxtPlugin((app) => {
  const route = useRoute();
  provideUiDevTools(
    app.vueApp,
    String(useRuntimeConfig().public.uiDevTools ?? 'dev'),
    () => route.fullPath,
  );
});
