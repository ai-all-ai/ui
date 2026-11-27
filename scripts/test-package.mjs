import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { globSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const work = mkdtempSync(join(process.env.UI_TEST_PARENT || tmpdir(), 'aiall-ui-package-'));
const npm = process.env.npm_execpath
  ? [process.execPath, process.env.npm_execpath]
  : [process.platform === 'win32' ? 'npm.cmd' : 'npm'];
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')).packages;
const version = (name) => lock['node_modules/' + name].version;
const local = (name) => join('node_modules', '@ai.all', 'ui', 'bin', name);
const servers = new Set();
let browser;

function run(cwd, [command, ...args], env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `${args.join(' ')} failed in ${cwd}\n${result.error ?? ''}\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result.stdout;
}

function put(cwd, file, content) {
  const target = join(cwd, file);
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content);
}

function fixture(name, deps) {
  const cwd = join(work, name);
  put(cwd, 'package.json', JSON.stringify({ private: true, type: 'module', dependencies: deps }));
  run(cwd, [...npm, 'install', '--no-audit', '--no-fund', '--prefer-offline']);
  return cwd;
}

async function serve(cwd, args, readyPath, env = {}) {
  const socket = createServer();
  const port = await new Promise((done, fail) => {
    socket.on('error', fail);
    socket.listen(0, '127.0.0.1', () => {
      const { port } = socket.address();
      socket.close(() => done(port));
    });
  });
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    args.map((arg) => (arg === '%PORT%' ? String(port) : arg)),
    {
      cwd,
      env: {
        ...process.env,
        ...env,
        HOST: '127.0.0.1',
        PORT: String(port),
        NUXT_TELEMETRY_DISABLED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    },
  );
  const stop = () => {
    if (!server.pid || !servers.delete(stop)) return;
    try {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F']);
      } else {
        process.kill(-server.pid, 'SIGTERM');
      }
    } catch (error) {
      if (error.code !== 'ESRCH') throw error;
    }
  };
  servers.add(stop);
  let logs = '';
  for (const stream of [server.stdout, server.stderr])
    stream.on('data', (chunk) => (logs += chunk));
  let exit;
  server.on('exit', (code) => (exit = code));
  for (let attempt = 0; attempt < 120 && exit === undefined; attempt++) {
    try {
      const response = await fetch(origin + readyPath, { signal: AbortSignal.timeout(3000) });
      if (!response.ok) {
        const body = await response.text();
        if (response.status === 503 && body.includes('__NUXT_LOADING__')) {
          await setTimeout(500);
          continue;
        }
        throw new Error(
          `HTTP ${response.status} at ${origin + readyPath}\n${logs}\n${body.slice(0, 1500)}`,
        );
      }
      return { origin, stop };
    } catch (error) {
      if (error.message.startsWith('HTTP ')) throw error;
      await setTimeout(500);
    }
  }
  throw new Error(`Server did not start: ${args.join(' ')}\n${logs}`);
}

async function html(origin, path, expected) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const text = await response.text();
  assert.match(text, expected, path);
  return text;
}

async function inspect(origin, name, check) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const issues = [];
  page.on('pageerror', (error) => issues.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) issues.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) {
      issues.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });
  await page.route('**/*', (request) =>
    request.request().url().startsWith(origin) || request.request().url().startsWith('data:')
      ? request.continue()
      : request.fulfill({ status: 200, body: '' }),
  );
  try {
    await check(page);
    assert.deepEqual(issues, [], name);
  } catch (error) {
    if (issues.length) console.error(name, issues);
    throw error;
  } finally {
    await page.close();
  }
}

const nuxtCli = join('node_modules', 'nuxt', 'bin', 'nuxt.mjs');
const vue = { vue: version('vue') };
const nuxt = { ...vue, nuxt: version('nuxt') };
const config =
  "export default defineNuxtConfig({ compatibilityDate: '2026-11-26', devtools: { enabled: false } });\n";
const stock =
  '<template>\n  <div>\n    <NuxtRouteAnnouncer />\n    <NuxtWelcome />\n  </div>\n</template>\n';
const manifest = 'ui/.manifest.json';
const css = 'app/assets/css/theme-base.css';
const main = 'app/assets/css/main.css';
const custom = ':root { --color-brand: #123456; --ui-test-brand: supported; }\n';
const read = (cwd, file) => readFileSync(join(cwd, file), 'utf8');
const ui = (cwd, ...args) => run(cwd, [process.execPath, local('ui.js'), ...args]);
const ecosystem = { '@ai.all/aiall': '1.0.0', '@ai.all/ds7': '2.6.0' };

try {
  console.log(`Package fixtures and screenshots: ${work}`);
  const [archive] = JSON.parse(run(root, [...npm, 'pack', '--json', '--pack-destination', work]));
  const tarball = join(work, archive.filename);
  browser = await chromium.launch();

  const app = fixture('nuxt', { ...nuxt, '@ai.all/ui': tarball });
  put(app, 'nuxt.config.ts', config);
  put(app, 'app/app.vue', stock);
  ui(app, 'init');
  assert.equal(read(app, 'nuxt.config.ts'), config);
  const initial = read(app, manifest);
  ui(app, 'init');
  assert.equal(read(app, manifest), initial);
  assert.throws(() => read(app, 'node_modules/@ai.all/aiall/package.json'), { code: 'ENOENT' });
  assert.throws(() => read(app, 'node_modules/@ai.all/ds7/package.json'), { code: 'ENOENT' });

  const dev = await serve(app, [nuxtCli, 'dev', '--host', '127.0.0.1'], '/ui');
  await html(dev.origin, '/', /href="\/ui"/);
  await html(dev.origin, '/ui?tab=components', /BREADCRUMB-01/);
  await inspect(dev.origin, 'Nuxt dev', async (page) => {
    await page.goto(dev.origin + '/ui');
    await page
      .getByRole('heading', { name: /Brandbook/ })
      .first()
      .waitFor();
    assert.ok(
      await page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue('--color-paper').trim(),
      ),
    );
    await page.waitForFunction(() => {
      const firstToken = document.querySelector('#c-brand small');
      return firstToken?.textContent && firstToken.textContent !== '…';
    });
    await page.screenshot({ path: join(work, 'brandbook-desktop.png') });
    await page.getByRole('tab', { name: 'Components', exact: true }).first().click();
    await page.waitForURL('**/ui?tab=components');
    await page.locator('#CHIPS-01').waitFor();
    assert.equal(await page.locator('#panel-components dialog').count(), 0);
    await page
      .locator('#MODAL-01')
      .getByRole('button', { name: 'Open', exact: true })
      .first()
      .click();
    await page.locator('dialog[open]').waitFor();
    await page.keyboard.press('Escape');
    await page.locator('dialog[open]').waitFor({ state: 'hidden' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Grid', exact: true }).click();
    await page.getByRole('button', { name: 'Grid 12', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Grid 12', exact: true }).click();
    await page.keyboard.press('Alt+g');
    await page.keyboard.press('Alt+g');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(work, 'brandbook-mobile.png') });
  });
  dev.stop();
  console.log('PASS Nuxt dev, SSR, Brandbook tabs, tokens and developer tools');

  put(app, 'app/assets/css/theme.css', `@layer theme { ${custom} }\n`);
  put(
    app,
    'app/components/ui/UiBreadcrumb.vue',
    '<template><nav data-local-breadcrumb>Local trail</nav></template>\n',
  );
  put(
    app,
    'app/pages/probe.vue',
    '<template><main><UiButton>Package button</UiButton><UiBreadcrumb /></main></template>\n',
  );
  run(app, [process.execPath, nuxtCli, 'build'], { NUXT_TELEMETRY_DISABLED: '1' });
  const lean = await serve(app, ['.output/server/index.mjs'], '/probe');
  await html(lean.origin, '/probe', /Package button/);
  assert.doesNotMatch(await html(lean.origin, '/', /Welcome/), /href="\/ui"/);
  assert.equal((await fetch(lean.origin + '/ui')).status, 404);
  for (const file of globSync('.output/**/*.{mjs,js,css}', { cwd: app })) {
    assert.doesNotMatch(read(app, file), /dev-grid__|lightbox__|Brandbook of the site/, file);
  }
  await inspect(lean.origin, 'Nuxt modular production CSS', async (page) => {
    await page.goto(lean.origin + '/probe');
    const button = page.getByRole('button', { name: 'Package button' });
    assert.equal(await button.evaluate((node) => getComputedStyle(node).display), 'inline-flex');
    assert.equal(
      await button.evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(18, 52, 86)',
    );
  });
  lean.stop();
  console.log('PASS default production artifacts exclude Brandbook and developer overlays');
  put(
    app,
    'nuxt.config.ts',
    config.replace(
      'defineNuxtConfig({',
      "defineNuxtConfig({ aiallUi: { brandbook: true, devTools: true, css: 'bundle' },",
    ),
  );
  const build = run(app, [process.execPath, nuxtCli, 'build'], { NUXT_TELEMETRY_DISABLED: '1' });
  assert.doesNotMatch(build, /NUXT_B300[1279]/);
  const preview = await serve(app, [nuxtCli, 'preview'], '/probe', {
    NUXT_PUBLIC_UI_DEV_TOOLS: 'off',
  });
  await html(preview.origin, '/probe', /Package button[\s\S]*Local trail/);
  await html(preview.origin, '/ui?tab=components', /data-local-breadcrumb/);
  await inspect(preview.origin, 'Nuxt production preview', async (page) => {
    await page.goto(preview.origin + '/ui?tab=tools');
    await page.locator('#t-about p').filter({ hasText: 'uiDevTools is off' }).waitFor();
    assert.equal(await page.locator('.dev-grid').count(), 0);
    await page.goto(preview.origin + '/ui?tab=components');
    await page.locator('#CHIPS-01').waitFor();
    await page.locator('[data-local-breadcrumb]').first().waitFor();
    await page.goto(preview.origin + '/probe');
    const button = page.getByRole('button', { name: 'Package button' });
    await button.waitFor();
    assert.equal(await button.evaluate((node) => getComputedStyle(node).display), 'inline-flex');
    assert.equal(
      await button.evaluate((node) => getComputedStyle(node).backgroundColor),
      'rgb(18, 52, 86)',
    );
    assert.equal(
      await page.evaluate(() =>
        getComputedStyle(document.body).getPropertyValue('--ui-test-brand').trim(),
      ),
      'supported',
    );
  });
  preview.stop();
  console.log('PASS Nuxt production build, preview, SSR and local precedence');

  const overlays = await serve(app, ['.output/server/index.mjs'], '/ui', {
    NUXT_PUBLIC_UI_DEV_TOOLS: 'always',
  });
  await inspect(overlays.origin, 'Nuxt production developer tools', async (page) => {
    await page.goto(overlays.origin + '/ui');
    await page.waitForFunction(() => {
      const firstToken = document.querySelector('#c-brand small');
      return firstToken?.textContent && firstToken.textContent !== '…';
    });
    await page.getByRole('tab', { name: 'Dev tools', exact: true }).click();
    await page.waitForURL('**/ui?tab=tools');
    await page.getByText('Show width × height and breakpoint', { exact: true }).click();
    await page.locator('.dev-grid .size').waitFor();
    await page.reload();
    await page.locator('.dev-grid .size').waitFor();
    await page.keyboard.press('Alt+r');
    await page.locator('.dev-grid .rhythm').waitFor();
    await page.keyboard.press('Alt+o');
    await page.locator('html.dev-outlines').waitFor();
    await page.keyboard.press('Alt+a');
    await page.getByRole('complementary', { name: 'Page audit' }).waitFor();
  });
  overlays.stop();
  console.log('PASS production overlay modes, shortcuts and persistence');

  const previous = process.env.UI_TEST_PREVIOUS || '0.2.0-beta.0';
  const integrated = fixture('ecosystem', { ...nuxt, ...ecosystem, '@ai.all/ui': previous });
  put(integrated, 'nuxt.config.ts', config);
  put(integrated, 'app/app.vue', stock);
  run(integrated, [process.execPath, 'node_modules/@ai.all/ds7/bin/ds7.js', 'init', '--yes']);
  ui(integrated, 'init');
  const oldPage = read(integrated, 'app/pages/ui.vue');
  put(integrated, css, read(integrated, css) + custom);
  const customisation = read(integrated, css);
  run(integrated, [...npm, 'install', '--no-audit', '--no-fund', tarball]);
  assert.match(ui(integrated, 'status'), /manifest absent/);
  assert.match(ui(integrated, 'update', '--dry-run'), /Preserve app\/assets\/css\/theme-base.css/);
  assert.match(ui(integrated, 'diff'), /app\/pages\/ui.vue/);
  assert.equal(read(integrated, 'app/pages/ui.vue'), oldPage);
  ui(integrated, 'update');
  assert.match(read(integrated, 'app/pages/ui.vue'), /import Brandbook/);
  assert.equal(read(integrated, css), customisation);
  const newManifest = read(integrated, manifest);
  const cli = 'node_modules/@ai.all/aiall/bin/cli.js';
  for (const command of ['sync', 'check']) run(integrated, [process.execPath, cli, command]);
  ui(integrated, 'check', '--strict');
  const ecosystemDev = await serve(integrated, [nuxtCli, 'dev', '--host', '127.0.0.1'], '/ui');
  await html(ecosystemDev.origin, '/ui?tab=components', /CHIPS-01/);
  ecosystemDev.stop();
  ui(integrated, 'rollback', '--dry-run');
  assert.equal(read(integrated, manifest), newManifest);
  ui(integrated, 'rollback');
  assert.equal(read(integrated, 'app/pages/ui.vue'), oldPage);
  assert.equal(read(integrated, css), customisation);
  assert.throws(() => read(integrated, manifest), { code: 'ENOENT' });
  ui(integrated, 'update');
  assert.equal(read(integrated, css), customisation);
  assert.ok(read(integrated, main));
  console.log('PASS AI-ALL + DS7, migration, dry-run, rollback and custom token preservation');

  const vite = fixture('vite', {
    ...vue,
    vite: version('vite'),
    '@vitejs/plugin-vue': version('@vitejs/plugin-vue'),
    '@ai.all/ui': tarball,
  });
  assert.throws(() => read(vite, 'node_modules/nuxt/package.json'), { code: 'ENOENT' });
  put(
    vite,
    'vite.config.mjs',
    "import vue from '@vitejs/plugin-vue';\nexport default { plugins: [vue()] };\n",
  );
  put(
    vite,
    'index.html',
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>Vue fixture</title></head><body><div id="app"></div><script type="module" src="/main.js"></script></body></html>\n',
  );
  put(
    vite,
    'main.js',
    "import { createApp } from 'vue';\nimport App from './App.vue';\nimport '@ai.all/ui/styles/foundation.css';\ncreateApp(App).mount('#app');\n",
  );
  const components = archive.files.filter(({ path }) =>
    /^dist\/components\/Ui\w+\.mjs$/.test(path),
  );
  assert.equal(components.length, 25);
  put(
    vite,
    'ssr.mjs',
    `
    import assert from 'node:assert/strict';
    import { createSSRApp, h } from 'vue';
    import { renderToString } from 'vue/server-renderer';
    import { UiButton } from '@ai.all/ui';
    assert.match(await renderToString(createSSRApp(() => h(UiButton, null, () => 'Server ESM'))), /data-v-.*Server ESM/);
  `,
  );
  run(vite, [process.execPath, 'ssr.mjs']);
  put(
    vite,
    'App.vue',
    `<script setup>
import { defineAsyncComponent, ref } from 'vue';
import UiButton from '@ai.all/ui/styled/UiButton';
import UiChips from '@ai.all/ui/styled/UiChips';
import LegacyIcon from '@ai.all/ui/components/ui/UiIcon.vue';
const Lightbox = defineAsyncComponent(() => import('@ai.all/ui/styled/UiLightbox'));
const open = ref(false);
</script>
<template>
  <UiChips :options="['Red', 'Blue']" />
  <UiButton @click="open = true">Open image</UiButton>
  <LegacyIcon name="check" />
  <Lightbox v-if="open" :open="open" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'/%3E" alt="Example" @close="open = false" />
</template>
`,
  );
  const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
  put(
    vite,
    'consumer.ts',
    `
    import { UiButton } from '@ai.all/ui';
    import UiChips from '@ai.all/ui/styled/UiChips';
    const size: InstanceType<typeof UiButton>['$props']['size'] = 'small';
    const chips: InstanceType<typeof UiChips>['$props']['options'] = ['Red'];
    // @ts-expect-error Unknown size.
    const invalid: InstanceType<typeof UiButton>['$props']['size'] = 'missing';
    export { size, chips, invalid };
  `,
  );
  run(vite, [
    process.execPath,
    tsc,
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--module',
    'esnext',
    '--moduleResolution',
    'bundler',
    '--target',
    'es2022',
    'consumer.ts',
  ]);
  const viteCli = 'node_modules/vite/bin/vite.js';
  run(vite, [process.execPath, viteCli, 'build']);
  const vitePreview = await serve(
    vite,
    [viteCli, 'preview', '--host', '127.0.0.1', '--port', '%PORT%'],
    '/',
  );
  await inspect(vitePreview.origin, 'Vue/Vite production', async (page) => {
    await page.goto(vitePreview.origin);
    const button = page.getByRole('button', { name: 'Open image' });
    await button.waitFor();
    assert.equal(await button.evaluate((node) => getComputedStyle(node).display), 'inline-flex');
    await page.getByText('Red', { exact: true }).waitFor();
    assert.equal(await page.locator('.lightbox').count(), 0);
    assert.equal(
      await page.evaluate(() =>
        performance.getEntriesByType('resource').some((entry) => /UiLightbox/.test(entry.name)),
      ),
      false,
    );
    await button.click();
    await page.locator('dialog[open]').waitFor();
    assert.equal(
      await page.evaluate(() =>
        performance.getEntriesByType('resource').some((entry) => /UiLightbox/.test(entry.name)),
      ),
      true,
    );
  });
  vitePreview.stop();
  console.log('PASS Vue/Vite ESM, modular CSS, SSR, types, legacy SFC and lazy Lightbox');
} finally {
  for (const stop of servers) stop();
  await browser?.close();
}
