import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import cp from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLI = path.join(ROOT, 'bin', 'ui.js');

test('@ai.all/ui list returns available components', () => {
  const r = cp.spawnSync(process.execPath, [CLI, 'list'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Available @ai\.all\/ui components/);
  assert.match(r.stdout, /UiButton/);
  assert.match(r.stdout, /UiModal/);
});

test('@ai.all/ui init scaffolds theme-base.css, pages/ui.vue and aiall-pack.json', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-init-'));
  fs.mkdirSync(path.join(tmp, '.ai'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.ai', 'aiall.json'),
    JSON.stringify({ schemaVersion: 1, packs: ['aiall-core'] }),
  );

  const r = cp.spawnSync(process.execPath, [CLI, 'init'], { cwd: tmp, encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.ok(fs.existsSync(path.join(tmp, 'app', 'assets', 'css', 'theme-base.css')));
  assert.ok(fs.existsSync(path.join(tmp, 'app', 'assets', 'css', 'base.css')));
  assert.ok(fs.existsSync(path.join(tmp, 'app', 'pages', 'ui.vue')));
  assert.ok(fs.existsSync(path.join(tmp, 'ui', 'aiall-pack.json')));

  const cfg = JSON.parse(fs.readFileSync(path.join(tmp, '.ai', 'aiall.json'), 'utf8'));
  assert.ok(cfg.packs.includes('ui/aiall-pack.json'));

  fs.rmSync(tmp, { recursive: true, force: true });
});

test('@ai.all/ui add copies component to app/components/ui/', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-add-'));
  const r = cp.spawnSync(process.execPath, [CLI, 'add', 'UiButton'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.ok(fs.existsSync(path.join(tmp, 'app', 'components', 'ui', 'UiButton.vue')));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('@ai.all/ui check validates quality gates', () => {
  const r = cp.spawnSync(process.execPath, [CLI, 'check', '--strict'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Token Contract: Base/);
  assert.match(r.stdout, /Known Tokens: Every/);
  assert.match(r.stdout, /Token Discipline: Clean/);
  assert.match(r.stdout, /Modifier Architecture: Clean/);
  assert.match(r.stdout, /Component Anatomy: Clean/);
  assert.match(r.stdout, /All @ai\.all\/ui quality gates passed/);
});

test('@ai.all/ui --version prints package version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const r = cp.spawnSync(process.execPath, [CLI, '--version'], { encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), pkg.version);
});

test('@ai.all/ui exports the paths a parent package resolves', () => {
  for (const spec of [
    '@ai.all/ui/bin/ui.js',
    '@ai.all/ui/aiall-pack.json',
    '@ai.all/ui/templates/ui.vue',
    '@ai.all/ui/tokens/theme-base.css',
    '@ai.all/ui/components/ui/UiButton.vue',
  ]) {
    // createRequire, not import.meta.resolve: Node 18 needs a flag for the latter
    assert.ok(fs.existsSync(createRequire(import.meta.url).resolve(spec)), spec);
  }
});

test('@ai.all/ui check fails on a token the theme does not declare', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-tokens-'));
  const dir = path.join(tmp, 'app', 'components', 'ui');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'UiBox.vue'),
    '<script setup lang="ts"></script>\n<template><div class="box" :style="{ \'--box-w\': \'1px\' }" /></template>\n<style scoped>\n.box { --box-gap: 1rem; gap: var(--box-gap); color: var(--color-ink); background: var(--color-forest); border-color: var(--color-unset, currentColor); width: var(--box-w); }\n</style>\n',
  );
  const r = cp.spawnSync(process.execPath, [CLI, 'check', '--strict'], {
    cwd: tmp,
    encoding: 'utf8',
  });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /Unknown token "--color-forest"/);
  assert.doesNotMatch(r.stdout, /--box-gap|--box-w|--color-ink"|--color-unset/);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('@ai.all/ui components import nothing from a project', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'components', 'ui'))) {
    const text = fs.readFileSync(path.join(ROOT, 'components', 'ui', f), 'utf8');
    assert.doesNotMatch(text, /from ['"]~~?\//, `${f} imports from the host project`);
  }
});
