// Nuxt module: registers the brandbook, dev tools, the gallery and their routes.
import {
  addComponent,
  addComponentsDir,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  resolveAlias,
} from 'nuxt/kit';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseRoots } from '../gallery/lib/ds.js';

const managedPage =
  /^\s*<script setup lang=["']ts["']>\s*import Brandbook from ['"]@ai\.all\/ui\/templates\/ui\.vue['"];?\s*<\/script>\s*<template>\s*<Brandbook\s*\/>\s*<\/template>\s*$/;

export default defineNuxtModule({
  meta: { name: '@ai.all/ui', configKey: 'aiallUi', compatibility: { nuxt: '^4.0.0' } },
  defaults: { brandbook: 'dev', devTools: 'dev', css: true, gallery: true },
  setup(options, nuxt) {
    const { resolve: fromPackage } = createResolver(import.meta.url);
    const localUi = resolve(nuxt.options.srcDir, 'components/ui');
    const source = fromPackage('../components/ui');
    const catalog = fromPackage('../dist/components');
    const toolsMode = nuxt.options.runtimeConfig.public.uiDevTools;
    const includeTools =
      options.devTools === true ||
      (options.devTools !== false &&
        (nuxt.options.dev || ['always', 'true'].includes(String(toolsMode))));
    const includeBrandbook =
      options.brandbook === true || (options.brandbook === 'dev' && nuxt.options.dev);

    if (existsSync(localUi)) {
      addComponentsDir({ path: localUi, pathPrefix: false, priority: 2 }, { prepend: true });
    }
    // Project overrides still win over the package components.
    nuxt.hook('components:dirs', (dirs) => {
      for (let i = dirs.length - 1; i >= 0; i--) {
        const dir = dirs[i];
        if (resolve(resolveAlias(typeof dir === 'string' ? dir : dir.path)) === source)
          dirs.splice(i, 1);
      }
    });
    for (const file of readdirSync(catalog).filter((file) => /^Ui\w+\.mjs$/.test(file))) {
      const name = file.slice(0, -4);
      const filePath =
        name === 'UiDevTools' && !includeTools
          ? fromPackage('./dev-tools-off.mjs')
          : fromPackage(
              options.css === 'bundle' && name !== 'UiDevTools'
                ? '../dist/components'
                : '../dist/styled',
              file,
            );
      addComponent({ name, filePath, priority: -1 });
    }
    // Source gallery (gallery: { folder: 'ds' } in aiallUi): dev only, see gallery/ in the package.
    // A production build gets no route, no API and no .gitignore line, so `nuxt build` and `nuxt generate` never see it.
    const includeGallery = Boolean(options.gallery && nuxt.options.dev);
    nuxt.options.runtimeConfig.public.aiallUiGallery = includeGallery;
    if (includeGallery) {
      const config = {
        folder: 'ds',
        git: 'ignore',
        ...(typeof options.gallery === 'object' ? options.gallery : {}),
      };
      config.folder = parseRoots(config.folder); // one folder or a comma-separated list, checked at build time
      nuxt.options.runtimeConfig.gallery ??= config;
      // git: 'ignore' (default) adds the source folder to the site's .gitignore once; 'track' leaves git alone.
      if (config.git !== 'track') {
        const gitignore = resolve(nuxt.options.rootDir, '.gitignore');
        const text = existsSync(gitignore) ? readFileSync(gitignore, 'utf8') : '';
        const lines = config.folder
          .map((folder) => `/${folder}/`)
          .filter((line) => !text.split(/\r?\n/).includes(line));
        if (lines.length) {
          const gap = text && !text.endsWith('\n') ? '\n' : '';
          writeFileSync(
            gitignore,
            `${text}${gap}# Source files of the ui gallery (large originals; set gallery.git to 'track' to keep them in git)\n${lines.join('\n')}\n`,
          );
        }
      }
      // compiled by scripts/build.mjs: Nitro does not compile TypeScript inside node_modules
      const server = (file) => fromPackage('../dist/gallery/server', file.replace(/\.ts$/, '.mjs'));
      addServerHandler({ middleware: true, handler: server('middleware/gallery-dev-only.ts') });
      addServerHandler({ route: '/api/ds', method: 'get', handler: server('api/ds/index.get.ts') });
      addServerHandler({
        route: '/api/ds',
        method: 'delete',
        handler: server('api/ds/index.delete.ts'),
      });
      addServerHandler({
        route: '/api/ds/move',
        method: 'post',
        handler: server('api/ds/move.post.ts'),
      });
      addServerHandler({
        route: '/api/ds/process',
        method: 'post',
        handler: server('api/ds/process.post.ts'),
      });
      addServerHandler({
        route: '/api/ds/apply',
        method: 'post',
        handler: server('api/ds/apply.post.ts'),
      });
      addServerHandler({
        route: '/api/ds/results',
        method: 'get',
        handler: server('api/ds/results.get.ts'),
      });
      addServerHandler({
        route: '/ds-files/**',
        method: 'get',
        handler: server('routes/ds-files.get.ts'),
      });
      extendPages((pages) => {
        // the gallery lives inside the brandbook: /ui/ds, the same route in every site
        if (!pages.some((page) => page.path === '/ui/ds')) {
          pages.push({
            name: 'aiall-ui-gallery',
            path: '/ui/ds',
            file: fromPackage('../gallery/pages/ds.vue'),
          });
        }
      });
    }
    nuxt.options.build.transpile.push('@ai.all/ui');
    nuxt.options.runtimeConfig.public.uiDevTools ??= 'dev';
    nuxt.options.runtimeConfig.public.aiallUiBrandbook = includeBrandbook;
    if (includeTools || includeBrandbook) addPlugin(fromPackage('./dev-tools'));

    if (options.css) {
      const main = resolve(nuxt.options.srcDir, 'assets/css/main.css');
      const stylesheet = options.css === 'bundle' ? 'all.css' : 'foundation.css';
      const defaults = fromPackage('../dist/styles', stylesheet);
      const builtin = new Set([
        '@ai.all/ui/tokens/theme-base.css',
        '@ai.all/ui/tokens/base.css',
        '@ai.all/ui/styles.css',
        '@ai.all/ui/styles/all.css',
        '@ai.all/ui/styles/foundation.css',
        ...['theme-base.css', 'base.css'].map((file) => fromPackage('../tokens', file)),
        fromPackage('../dist/styles/all.css'),
        fromPackage('../dist/styles/foundation.css'),
      ]);
      nuxt.options.css = [
        defaults,
        ...nuxt.options.css.filter((file) => !builtin.has(resolveAlias(file))),
      ];
      if (existsSync(main) && !nuxt.options.css.some((file) => resolveAlias(file) === main)) {
        nuxt.options.css.push(main);
      }
    }

    if (nuxt.options.pages === false || nuxt.options.pages?.enabled === false) return;
    if (includeBrandbook) nuxt.options.pages ??= true;
    extendPages((pages) => {
      if (!includeBrandbook) {
        for (let i = pages.length - 1; i >= 0; i--) {
          const { path, file } = pages[i];
          if (
            path === '/ui' &&
            file &&
            existsSync(file) &&
            managedPage.test(readFileSync(file, 'utf8'))
          ) {
            pages.splice(i, 1);
          }
        }
      } else if (!pages.some((page) => page.path === '/ui')) {
        pages.push({
          name: 'aiall-ui-brandbook',
          path: '/ui',
          file: fromPackage('../templates/ui.vue'),
        });
      }
    });
  },
});
