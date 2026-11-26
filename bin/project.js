import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const MANIFEST = 'ui/.manifest.json';
const JOURNAL = 'ui/.transaction.json';
const LOCK = 'ui/.lock';
const AI_CONFIG = '.ai/aiall.json';
const PACK = 'ui/aiall-pack.json';
const APP = 'app/app.vue';
const HEAD = 'app/pages/index.vue';
const MAIN = 'app/assets/css/main.css';
const BRAND = 'app/assets/css/theme-base.css';
const BASE = 'app/assets/css/base.css';
const PAGE = 'app/pages/ui.vue';
const MODULE = 'modules/aiall-ui.mjs';
const RULES = 'ui/ALL.md';
const files = new Set([APP, HEAD, MAIN, BRAND, BASE, PAGE, MODULE, RULES, PACK]);
const json = (data) => JSON.stringify(data, null, 2) + '\n';
const hash = (content) =>
  content === null ? null : createHash('sha256').update(content).digest('hex');
const stockApp =
  /^\s*<template>\s*(?:<div>\s*(?:<NuxtRouteAnnouncer\s*\/>\s*)?)?<NuxtWelcome\s*\/>\s*(?:<\/div>\s*)?<\/template>\s*$/;

export function projectCommand(root, cwd, command, args) {
  const source = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const version = JSON.parse(source('package.json')).version;
  const legacy = JSON.parse(source('bin/legacy-hashes.json'));
  const dryRun = args.includes('--dry-run');
  if (args.some((arg) => arg !== '--dry-run')) throw new Error('Unknown option.');

  function location(file) {
    let target = cwd;
    for (const segment of file.split('/')) {
      target = path.join(target, segment);
      const info = fs.lstatSync(target, { throwIfNoEntry: false });
      if (info?.isSymbolicLink()) throw new Error(`Refusing to follow a symbolic link: ${file}`);
    }
    return target;
  }

  function read(file) {
    try {
      return fs.readFileSync(location(file), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  function write(file, content) {
    const target = location(file);
    if (content === null) {
      fs.rmSync(target, { force: true });
      return;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const temp = target + '.' + randomUUID();
    try {
      const mode = file === JOURNAL ? 0o600 : fs.statSync(target, { throwIfNoEntry: false })?.mode;
      fs.writeFileSync(temp, content, { flag: 'wx', mode });
      fs.renameSync(temp, target);
    } finally {
      fs.rmSync(temp, { force: true });
    }
  }

  function lock(run) {
    const file = location(LOCK);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let fd;
    try {
      fd = fs.openSync(file, 'wx');
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new Error(
          'ui/.lock exists. Remove it only after confirming no UI command is running.',
        );
      }
      throw error;
    }
    try {
      return run();
    } finally {
      fs.closeSync(fd);
      fs.unlinkSync(file);
    }
  }

  function expect(file, content) {
    if (read(file) !== content) throw new Error(`${file} changed during the operation.`);
  }

  function rollback() {
    const raw = read(JOURNAL);
    if (raw === null) throw new Error('No UI transaction to roll back.');
    const journal = JSON.parse(raw);
    if (journal.schema !== 1 || !Array.isArray(journal.changes)) {
      throw new Error('Unsupported UI transaction.');
    }
    for (const { file, before, after } of journal.changes) {
      if (
        (!files.has(file) && file !== AI_CONFIG && file !== MANIFEST) ||
        ![before, after].every((value) => value === null || typeof value === 'string')
      )
        throw new Error('Invalid UI transaction entry.');
      const current = read(file);
      if (current !== before && current !== after) {
        throw new Error(`Rollback would overwrite changes in ${file}.`);
      }
    }
    for (const { file, before, after } of [...journal.changes].reverse()) {
      console.log(`Restore ${file}`);
      if (!dryRun && read(file) !== before) {
        expect(file, after);
        write(file, before);
      }
    }
    if (!dryRun) write(JOURNAL, null);
  }

  if (command === 'rollback') return dryRun ? rollback() : lock(rollback);

  function run() {
    const previous = read(MANIFEST);
    const manifest = previous === null ? { schema: 1, files: {} } : JSON.parse(previous);
    if (manifest.schema !== 1 || !manifest.files || typeof manifest.files !== 'object') {
      throw new Error('Unsupported UI manifest.');
    }
    const currentApp = read(APP);
    const pack = JSON.parse(source('aiall-pack.json'));
    const docs = { 'tokens/theme-base.css': BRAND, 'templates/ui.vue': PAGE, 'ALL.md': RULES };
    for (const directive of pack.directives ?? [])
      directive.doc = docs[directive.doc] ?? directive.doc;

    const desired = {
      [MODULE]: "export { default } from '@ai.all/ui/nuxt';\n",
      [BRAND]:
        '/* Override @ai.all/ui design tokens here. The Nuxt module loads the defaults. */\n',
      [BASE]: '/* Add project-wide base styles here. The Nuxt module loads the defaults. */\n',
      [MAIN]: "@import './theme-base.css';\n@import './base.css';\n",
      [PAGE]:
        '<script setup lang="ts">\nimport Brandbook from \'@ai.all/ui/templates/ui.vue\';\n</script>\n\n<template>\n  <Brandbook />\n</template>\n',
      [RULES]: source('ALL.md'),
      [PACK]: json(pack),
    };
    const welcome = stockApp.test(currentApp ?? '');
    if (welcome || manifest.files[APP]) {
      desired[APP] =
        '<template>\n  <NuxtRouteAnnouncer />\n  <NuxtPage />\n  <UiDevTools />\n</template>\n';
    }
    if (manifest.files[HEAD] || (welcome && !fs.existsSync(location('app/pages')))) {
      desired[HEAD] =
        '<template>\n  <main><h1>Welcome</h1><NuxtLink to="/ui">Brandbook</NuxtLink></main>\n</template>\n';
    }

    const changes = [];
    const tracked = {};
    console.log(`UI installed ${version}, manifest ${manifest.version ?? 'absent'}`);
    for (const [file, after] of Object.entries(desired)) {
      const before = read(file);
      const currentHash = hash(before);
      const wantedHash = hash(after);
      const trackedHash = manifest.files[file];
      const adopt =
        before === after ||
        (before === null && !trackedHash) ||
        (before !== null &&
          (currentHash === trackedHash ||
            legacy[file]?.includes(hash(before.replace(/\r\n/g, '\n'))) ||
            (file === APP && welcome)));
      const status =
        before === after ? 'Current' : adopt ? (before === null ? 'Create' : 'Update') : 'Preserve';
      console.log(`${status} ${file}`);
      if (command === 'diff' && before !== after) {
        console.log(`--- ${file} (${currentHash ?? 'missing'})\n+++ package (${wantedHash})`);
        for (const line of (before ?? '').trimEnd().split('\n')) console.log(`-${line}`);
        for (const line of after.trimEnd().split('\n')) console.log(`+${line}`);
      }
      if (adopt) {
        tracked[file] = wantedHash;
        if (before !== after) changes.push({ file, before, after });
      } else if (trackedHash) {
        tracked[file] = trackedHash;
      }
    }
    if (currentApp && !welcome && !currentApp.includes('NuxtPage')) {
      console.log('Custom app entry preserved. Render <NuxtPage /> in it to use page routes.');
    }

    const aiConfig = read(AI_CONFIG);
    if (aiConfig !== null) {
      try {
        const config = JSON.parse(aiConfig);
        if (Array.isArray(config?.packs) && !config.packs.includes(PACK)) {
          console.log(`Register ${PACK} in ${AI_CONFIG}`);
          config.packs.push(PACK);
          changes.push({ file: AI_CONFIG, before: aiConfig, after: json(config) });
        }
      } catch {
        console.log(`Preserve invalid JSON in ${AI_CONFIG}`);
      }
    }

    if (!['init', 'update'].includes(command) || dryRun) return;
    const next = json({ schema: 1, version, files: tracked });
    if (next !== previous) changes.push({ file: MANIFEST, before: previous, after: next });
    if (!changes.length) return;

    const oldJournal = read(JOURNAL);
    if (oldJournal !== null && JSON.parse(oldJournal).phase !== 'committed') {
      throw new Error('An incomplete UI transaction exists. Run ui rollback first.');
    }
    for (const { file, before } of changes) expect(file, before);
    write(JOURNAL, json({ schema: 1, phase: 'pending', changes }));
    for (const { file, before, after } of changes) {
      expect(file, before);
      write(file, after);
    }
    write(JOURNAL, json({ schema: 1, phase: 'committed', changes }));
  }

  return !dryRun && ['init', 'update'].includes(command) ? lock(run) : run();
}
