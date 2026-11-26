import {
  addComponent,
  addComponentsDir,
  addPlugin,
  createResolver,
  defineNuxtModule,
  extendPages,
} from 'nuxt/kit';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineNuxtModule({
  meta: { name: '@ai.all/ui', configKey: 'aiallUi', compatibility: { nuxt: '^4.0.0' } },
  defaults: { brandbook: true, css: true },
  setup(options, nuxt) {
    const { resolve: fromPackage } = createResolver(import.meta.url);
    const localUi = resolve(nuxt.options.srcDir, 'components/ui');

    if (existsSync(localUi))
      addComponentsDir({ path: localUi, pathPrefix: false, priority: 2 }, { prepend: true });
    const catalog = fromPackage('../components/ui');
    for (const file of readdirSync(catalog).filter((file) => /^Ui\w+\.vue$/.test(file))) {
      addComponent({ name: file.slice(0, -4), filePath: resolve(catalog, file), priority: -1 });
    }
    nuxt.options.build.transpile.push('@ai.all/ui');
    nuxt.options.runtimeConfig.public.uiDevTools ??= 'dev';
    addPlugin(fromPackage('./dev-tools'));

    if (options.css) {
      const defaults = ['theme-base.css', 'base.css'].map((file) => fromPackage('../tokens', file));
      const main = resolve(nuxt.options.srcDir, 'assets/css/main.css');
      nuxt.options.css = [
        ...defaults,
        ...nuxt.options.css.filter((file) => !defaults.includes(file)),
      ];
      if (
        existsSync(main) &&
        !nuxt.options.css.some((file) => {
          const alias = Object.keys(nuxt.options.alias)
            .sort((a, b) => b.length - a.length)
            .find((key) => file.startsWith(key + '/'));
          return (
            (alias ? resolve(nuxt.options.alias[alias], file.slice(alias.length + 1)) : file) ===
            main
          );
        })
      ) {
        nuxt.options.css.push(main);
      }
    }

    if (
      options.brandbook &&
      nuxt.options.pages !== false &&
      nuxt.options.pages?.enabled !== false
    ) {
      nuxt.options.pages ??= true;
      extendPages((pages) => {
        if (!pages.some((page) => page.path === '/ui')) {
          pages.push({
            name: 'aiall-ui-brandbook',
            path: '/ui',
            file: fromPackage('../templates/ui.vue'),
          });
        }
      });
    }
  },
});
