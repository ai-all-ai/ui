import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import cp from 'node:child_process';
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
  assert.match(r.stdout, /Token Discipline: Clean/);
  assert.match(r.stdout, /Modifier Architecture: Clean/);
  assert.match(r.stdout, /Component Anatomy: Clean/);
  assert.match(r.stdout, /All @ai\.all\/ui quality gates passed/);
});
