import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  // UiDevTools site setting: 'dev' (development only), 'always' (every environment) or 'off'.
  // Override without a rebuild: NUXT_PUBLIC_UI_DEV_TOOLS=always|dev|off.
  runtimeConfig: { public: { uiDevTools: 'dev' } },
  css: [path.join(rootDir, 'tokens', 'theme-base.css'), path.join(rootDir, 'tokens', 'base.css')],
  components: [
    {
      path: path.join(rootDir, 'components', 'ui'),
      pathPrefix: false,
    },
  ],
});
