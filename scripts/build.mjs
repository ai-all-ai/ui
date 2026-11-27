import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileScript, compileStyleAsync, parse } from '@vue/compiler-sfc';
import { transform } from 'esbuild';

const root = fileURLToPath(new URL('..', import.meta.url));
const input = join(root, 'components/ui');
const dist = join(root, 'dist');
const names = (await readdir(input))
  .filter((file) => /^Ui\w+\.vue$/.test(file))
  .map((file) => file.slice(0, -4));
const core = names.filter((name) => name !== 'UiDevTools');
const styles = new Map();
const write = (file, code) => writeFile(join(dist, file), code);
const minifyCSS = async (css) => (await transform(css, { loader: 'css', minify: true })).code;

await rm(dist, { recursive: true, force: true });
for (const folder of ['components', 'styled', 'styles', 'runtime']) {
  await mkdir(join(dist, folder), { recursive: true });
}

for (const name of names) {
  const filename = join(input, `${name}.vue`);
  const source = await readFile(filename, 'utf8');
  const { descriptor, errors } = parse(source, { filename });
  if (errors.length) throw new Error(`${filename}: ${errors.join('\n')}`);
  const id = `data-v-${createHash('sha256')
    .update(name + '\n' + source)
    .digest('hex')
    .slice(0, 12)}`;
  const scoped = descriptor.styles.some((style) => style.scoped);
  const script = compileScript(descriptor, {
    id,
    isProd: true,
    inlineTemplate: true,
    genDefaultAs: 'component',
  });
  const metadata = scoped ? `component.__scopeId = '${id}';\n` : '';
  const code = await transform(`${script.content}\n${metadata}export default component;\n`, {
    loader: 'ts',
    sourcefile: `${name}.vue`,
    format: 'esm',
    target: 'es2020',
    minifySyntax: true,
    legalComments: 'eof',
  });
  await write(`components/${name}.mjs`, code.code);
  const blocks = [];
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      filename,
      source: style.content,
      id,
      scoped: style.scoped,
    });
    if (result.errors.length) throw new Error(`${filename}: ${result.errors.join('\n')}`);
    blocks.push(result.code);
  }
  const css = blocks.join('\n');
  styles.set(name, css);
  await write(`styles/${name}.css`, await minifyCSS(css));
  await write(
    `styled/${name}.mjs`,
    `import '../styles/${name}.css';\nexport { default } from '../components/${name}.mjs';\n`,
  );
}

const foundationParts = await Promise.all(
  ['theme-base.css', 'base.css'].map((file) => readFile(join(root, 'tokens', file), 'utf8')),
);
const foundation = `@layer aiall-ui-foundation {\n${foundationParts.join('\n')}\n}`;
await write('styles/foundation.css', await minifyCSS(foundation));
await write(
  'styles/all.css',
  await minifyCSS([foundation, ...core.map((name) => styles.get(name))].join('\n')),
);

for (const [file, prefix, extension] of [
  ['index.mjs', './components/', '.mjs'],
  ['index.d.ts', './components/ui/', '.vue'],
]) {
  await write(
    file,
    core
      .map((name) => `export { default as ${name} } from '${prefix}${name}${extension}';`)
      .join('\n') + '\n',
  );
}
const tools = await readFile(join(root, 'runtime/dev-tools.ts'), 'utf8');
await write(
  'runtime/dev-tools.mjs',
  (await transform(tools, { loader: 'ts', format: 'esm', target: 'es2020' })).code,
);
console.error(`Built ${core.length} Vue components, developer tools and CSS bundles.`);
