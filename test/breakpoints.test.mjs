// The kit breakpoints live in tokens/breakpoints.json. CSS media queries and the dev tools must use the same numbers.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(join(root, file), 'utf8');
const { breakpoints, names } = JSON.parse(read('tokens/breakpoints.json'));
const sources = [
  ...readdirSync(join(root, 'components/ui')).map((f) => `components/ui/${f}`),
  ...readdirSync(join(root, 'gallery/components')).map((f) => `gallery/components/${f}`),
  'templates/kit-header.css',
  'templates/ui.vue',
].filter((f) => f.endsWith('.vue') || f.endsWith('.css'));

test('the scale is 480, 768, 1024, 1280 and 1440 px, with a name for each band', () => {
  assert.deepEqual(breakpoints, [480, 768, 1024, 1280, 1440]);
  assert.equal(names.length, breakpoints.length + 1);
});

test('media queries use only the kit breakpoints', () => {
  const allowed = new Set([
    ...breakpoints.map((n) => `max-width: ${n}px`),
    `min-width: ${breakpoints[3]}px`,
  ]);
  for (const file of sources) {
    for (const [, query] of read(file).matchAll(/@media \(([^)]*)\)/g)) {
      if (query.startsWith('prefers-reduced-motion')) continue;
      assert.ok(
        allowed.has(query),
        `${file} uses (${query}); use a value from tokens/breakpoints.json`,
      );
    }
  }
});

test('dev tools list the same breakpoints and names, and read them with matchMedia', () => {
  const src = read('components/ui/UiDevTools.vue');
  assert.ok(src.includes(`const BREAKPOINTS = [${breakpoints.join(', ')}];`), 'BREAKPOINTS differ');
  assert.ok(
    src.includes(`const NAMES = [${names.map((n) => `'${n}'`).join(', ')}];`),
    'NAMES differ',
  );
  assert.match(src, /matchMedia\(`\(max-width: \$\{n\}px\)`\)/);
});
