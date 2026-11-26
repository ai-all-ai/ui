#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectCommand } from './project.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CWD = process.cwd();

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

function getAvailableComponents(dir = path.join(ROOT, 'components', 'ui')) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.vue'));
}

// Validator 1: Token Discipline (No raw hex/rgb colors in styles)
function checkTokenDiscipline(targetDir) {
  const issues = [];
  const HEX_RGB = /(?:#[0-9a-fA-F]{3,8}|(?:rgba?)\([^)]+\))/g;
  const ALLOWED_VALUES = new Set([
    '#fff',
    '#ffffff',
    '#000',
    '#000000',
    'transparent',
    'currentColor',
  ]);
  const files = getAvailableComponents(targetDir).map((f) => path.join(targetDir, f));

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const styleMatch = text.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (!styleMatch) continue;
    const style = styleMatch[1];
    for (const m of style.matchAll(HEX_RGB)) {
      const val = m[0].toLowerCase();
      // Allow pure monochrome black/white or transparent in base kit if defined as fallback
      if (ALLOWED_VALUES.has(val)) continue;
      issues.push(
        `${path.basename(f)}: Raw color "${m[0]}" found in <style>. Use var(--color-*) tokens.`,
      );
    }
  }
  return issues;
}

// Validator 2: Modifiers & Naming
function checkModifiers(targetDir) {
  const BAD =
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-(?:active|big|small|large|orange|red|green|blue|dark|light|new|alt|v\d)$/;
  const ALLOW = new Set([
    'is-active',
    'btn-active',
    'page-enter-active',
    'page-leave-active',
    'swap-enter-active',
    'swap-leave-active',
  ]);
  const issues = [];
  const files = getAvailableComponents(targetDir).map((f) => path.join(targetDir, f));

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(/(?:class="([^"]*)"|\.([a-z][a-z0-9_-]*))/g)) {
      const classes = m[1] ? m[1].split(/\s+/) : [m[2]];
      for (const c of classes) {
        if (
          c &&
          BAD.test(c) &&
          !/^is-/.test(c) &&
          !ALLOW.has(c) &&
          !/-(?:enter|leave)-active$/.test(c)
        ) {
          issues.push(
            `${path.basename(f)}: Forbidden compound class "${c}". Use separate dash modifier (.-modifier).`,
          );
        }
      }
    }
  }
  return issues;
}

// Validator 3: Component Anatomy (TypeScript script setup & no !important)
function checkAnatomy(targetDir) {
  const issues = [];
  const files = getAvailableComponents(targetDir).map((f) => path.join(targetDir, f));

  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    if (!text.includes('<template>')) {
      issues.push(`${path.basename(f)}: Missing <template> tag.`);
    }
    if (
      text.includes('<script') &&
      !text.includes('<script setup') &&
      !text.includes('lang="ts"')
    ) {
      issues.push(`${path.basename(f)}: Script must use <script setup lang="ts">.`);
    }
    const styleMatch = text.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch && /!important/.test(styleMatch[1])) {
      issues.push(`${path.basename(f)}: Do not use !important in component scoped styles.`);
    }
  }
  return issues;
}

// Validator 5: Known Tokens (every var(--x) without a fallback is declared in the token files or the component)
function checkKnownTokens(targetDir, tokensFile) {
  // A declaration in CSS (--x: …) or a style binding in the template ('--x': value).
  const DECL = /(--[a-z0-9-]+)['"]?\s*:/gi;
  const declared = new Set();
  const cssDir = path.dirname(tokensFile);
  const localCssFiles = fs.existsSync(cssDir)
    ? fs
        .readdirSync(cssDir)
        .filter((f) => f.endsWith('.css'))
        .map((f) => path.join(cssDir, f))
    : [];
  for (const f of [path.join(ROOT, 'tokens', 'theme-base.css'), ...localCssFiles]) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(DECL)) declared.add(m[1]);
  }
  const issues = [];
  for (const file of getAvailableComponents(targetDir)) {
    const text = fs.readFileSync(path.join(targetDir, file), 'utf8');
    const local = new Set([...text.matchAll(DECL)].map((m) => m[1]));
    const used = new Set([...text.matchAll(/var\((--[a-z0-9-]+)\s*\)/gi)].map((m) => m[1]));
    for (const token of used) {
      if (!declared.has(token) && !local.has(token)) {
        issues.push(
          `${file}: Unknown token "${token}". Declare it in the theme or use a base token.`,
        );
      }
    }
  }
  return issues;
}

// Validator 4: Base Token Contract
function checkTokenContract(tokensFile) {
  const issues = [];
  if (!fs.existsSync(tokensFile)) {
    return [`Tokens file not found: ${tokensFile}`];
  }
  const text = fs.readFileSync(path.join(ROOT, 'tokens', 'theme-base.css'), 'utf8');
  const requiredTokens = [
    '--color-paper',
    '--color-surface',
    '--color-ink',
    '--color-line',
    '--color-brand',
    '--font-sans',
  ];
  for (const token of requiredTokens) {
    if (!text.includes(token)) {
      issues.push(`Base tokens missing required contract variable: ${token}`);
    }
  }
  return issues;
}

function runAllChecks(targetDir, tokensFile, strict = false) {
  console.log(
    `\n@ai.all/ui Health Check: validating components in ${path.relative(CWD, targetDir) || '.'}…\n`,
  );

  const tokenIssues = checkTokenDiscipline(targetDir);
  const modifierIssues = checkModifiers(targetDir);
  const anatomyIssues = checkAnatomy(targetDir);
  const contractIssues = checkTokenContract(tokensFile);
  const knownIssues = checkKnownTokens(targetDir, tokensFile);

  const total =
    tokenIssues.length +
    modifierIssues.length +
    anatomyIssues.length +
    contractIssues.length +
    knownIssues.length;

  if (contractIssues.length === 0) {
    console.log('  ✓ Token Contract: Base design tokens define required semantic variables.');
  } else {
    console.log(`  ✗ Token Contract: ${contractIssues.length} issue(s)`);
    for (const i of contractIssues) console.log(`    - ${i}`);
  }

  if (knownIssues.length === 0) {
    console.log('  ✓ Known Tokens: Every var(--*) used by components is declared.');
  } else {
    console.log(`  ✗ Known Tokens: ${knownIssues.length} unknown token(s)`);
    for (const i of knownIssues.slice(0, 10)) console.log(`    - ${i}`);
  }

  if (tokenIssues.length === 0) {
    console.log('  ✓ Token Discipline: Clean. No raw hex/rgb colors in styles.');
  } else {
    console.log(`  ✗ Token Discipline: ${tokenIssues.length} raw color violation(s)`);
    for (const i of tokenIssues.slice(0, 5)) console.log(`    - ${i}`);
  }

  if (modifierIssues.length === 0) {
    console.log('  ✓ Modifier Architecture: Clean. All variants use dash-prefixed modifiers.');
  } else {
    console.log(`  ✗ Modifier Architecture: ${modifierIssues.length} naming issue(s)`);
    for (const i of modifierIssues.slice(0, 5)) console.log(`    - ${i}`);
  }

  if (anatomyIssues.length === 0) {
    console.log('  ✓ Component Anatomy: Clean. Vue 3 <script setup lang="ts"> and pure CSS.');
  } else {
    console.log(`  ✗ Component Anatomy: ${anatomyIssues.length} issue(s)`);
    for (const i of anatomyIssues.slice(0, 5)) console.log(`    - ${i}`);
  }

  if (total === 0) {
    console.log('\n✓ All @ai.all/ui quality gates passed!\n');
    return 0;
  } else {
    console.log(`\nTotal: ${total} issue(s) found across UI quality gates.\n`);
    if (strict) {
      console.error('Strict mode active: exiting with code 1.');
      return 1;
    }
    return 0;
  }
}

if (cmd === '--version' || cmd === '-v') {
  console.log(JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version);
} else if (cmd === 'list') {
  const list = getAvailableComponents();
  console.log(`\nAvailable @ai.all/ui components (${list.length}):\n`);
  for (const c of list) {
    console.log(`  - ${c.replace('.vue', '')}`);
  }
  console.log(`\nInstall one with: npx @ai.all/ui add <ComponentName>\n`);
} else if (cmd === 'check') {
  const strict = args.includes('--strict');
  const projectUiDir = path.join(CWD, 'app', 'components', 'ui');
  const targetDir = fs.existsSync(projectUiDir)
    ? projectUiDir
    : path.join(ROOT, 'components', 'ui');
  const tokensFile = fs.existsSync(path.join(CWD, 'app', 'assets', 'css', 'theme-base.css'))
    ? path.join(CWD, 'app', 'assets', 'css', 'theme-base.css')
    : path.join(ROOT, 'tokens', 'theme-base.css');

  const code = runAllChecks(targetDir, tokensFile, strict);
  process.exit(code);
} else if (cmd === 'add') {
  const name = args[1];
  if (!name) {
    console.error('Error: Specify component name. Example: npx @ai.all/ui add UiButton');
    process.exit(1);
  }
  const file = name.endsWith('.vue') ? name : `${name}.vue`;
  const src = path.join(ROOT, 'components', 'ui', file);
  if (!getAvailableComponents().includes(file)) {
    console.error(`Error: Component "${file}" not found in catalog.`);
    process.exit(1);
  }
  const destDir = path.join(CWD, 'app', 'components', 'ui');
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, file);
  try {
    fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.log(`Preserved existing ${path.relative(CWD, dest)}`);
    process.exit(0);
  }
  console.log(`Added: ${path.relative(CWD, dest)}`);
} else if (['init', 'status', 'diff', 'update', 'rollback'].includes(cmd)) {
  try {
    projectCommand(ROOT, CWD, cmd, args.slice(1));
  } catch (error) {
    console.error(`UI: ${error.message}`);
    process.exitCode = 1;
  }
} else {
  console.log(`
@ai.all/ui - Universal monochrome UI kit and pattern catalog

Usage:
  npx @ai.all/ui init             Initialize Nuxt integration and project overrides
  npx @ai.all/ui status           Show installed and managed versions and file states
  npx @ai.all/ui diff             Compare local files with this installed package
  npx @ai.all/ui update [--dry-run] Apply safe changes from this installed package
  npx @ai.all/ui rollback [--dry-run] Restore the last scaffold transaction
  npx @ai.all/ui check [--strict] Run UI quality gates (tokens, modifiers, anatomy)
  npx @ai.all/ui list             List all available components
  npx @ai.all/ui add <Component>  Add a component to app/components/ui/
  npx @ai.all/ui --version        Print version
`);
}
