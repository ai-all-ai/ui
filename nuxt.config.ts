import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: [path.join(rootDir, 'tokens', 'theme-base.css')],
  components: [
    {
      path: path.join(rootDir, 'components', 'ui'),
      pathPrefix: false,
    },
  ],
});
