import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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
// The gallery's server files: Nitro does not compile TypeScript inside node_modules, so a site gets plain JavaScript.
// Imports are explicit (`#imports`), because nothing auto-imports them there either.
const galleryServer = join(root, 'gallery/server');
const walk = async (dir) =>
  (await readdir(dir, { withFileTypes: true })).flatMap((entry) =>
    entry.isDirectory() ? [] : [join(dir, entry.name)],
  );
const walkAll = async (dir) =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((entry) =>
        entry.isDirectory() ? walkAll(join(dir, entry.name)) : [join(dir, entry.name)],
      ),
    )
  ).flat();
for (const file of (await walkAll(galleryServer)).filter((name) => name.endsWith('.ts'))) {
  const target = join(dist, 'gallery/server', file.slice(galleryServer.length + 1)).replace(
    /\.ts$/,
    '.mjs',
  );
  await mkdir(join(target, '..'), { recursive: true });
  const code = await transform(await readFile(file, 'utf8'), {
    loader: 'ts',
    format: 'esm',
    target: 'es2020',
  });
  // relative imports without an extension (`../utils/gallery`) point at the compiled `.mjs` file
  const fixed = code.code.replace(/(from\s+['"]\.[^'"]*?)(['"])/g, (all, spec, quote) =>
    /\.m?js$/.test(spec) ? all : `${spec}.mjs${quote}`,
  );
  await writeFile(target, fixed);
}
await mkdir(join(dist, 'gallery/lib'), { recursive: true });
for (const file of await walk(join(root, 'gallery/lib'))) {
  await copyFile(file, join(dist, 'gallery/lib', file.slice(file.lastIndexOf('/') + 1)));
}
console.error(`Built ${core.length} Vue components, developer tools and CSS bundles.`);
