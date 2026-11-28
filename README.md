# @ai.all/ui

[![CI](https://github.com/ai-all-ai/ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ai-all-ai/ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@ai.all/ui)](https://www.npmjs.com/package/@ai.all/ui)
[![node](https://img.shields.io/node/v/@ai.all/ui)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Tokens first, then components, then the brandbook.** A monochrome UI kit for DS7 web projects: tokens, base HTML styles, self-contained Vue components and a living `/ui` brandbook with developer tools.

```bash
npm install @ai.all/ui
npx ui init
```

---

## 1. Overview

`@ai.all/ui` is an autonomous UI kit and pattern catalog designed to work both **completely stand-alone** and as an integrated part of the **AI-ALL + DS7** ecosystem.

- **Monochrome Slate Core:** Clean black-and-white visual baseline out of the box. Zero domain-specific colors.
- **Tokens-First:** Every component consumes semantic CSS custom properties (`--color-ink`, `--color-paper`, `--color-brand`, `--color-line`).
- **Brand Overlay Architecture:** A project changes only 5–7 brand variables in `theme.css` to recolor the entire UI.
- **Base Elements:** `tokens/base.css` styles plain HTML tags (headings, lists, tables, forms, code, quotes) with tokens only.
- **Light and Dark Surfaces:** `--color-inverse-*` tokens and the `-on-dark` modifier for dark bands and footers.
- **Living Brandbook:** `/ui` page with four tabs (Foundations, Base elements, Components, Catalog), stable pattern IDs (`BTN-01`, `MODAL-01`) and copy buttons for every variable, value, ID, name, description, class and snippet.
- **Autonomous Quality Gates:** Built-in zero-dependency validator (`npx @ai.all/ui check`) enforcing token discipline, modifier naming, and component anatomy.

---

## 2. Architecture & Ecosystem Integration

The `@ai.all` ecosystem is organized into three cooperating layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      @ai.all/aiall (Core Sync Engine)                  │
│  - Master instruction coordinator: aiall sync, aiall check             │
│  - Agent entrypoints: AGENTS.md, CLAUDE.md, GEMINI.md                  │
│  - Pack registry via .ai/aiall.json                                    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│     @ai.all/ds7 (Standards)  │          │      @ai.all/ui (UI Kit)     │
│  - Architecture & Quality    │          │  - Neutral Monochrome Tokens │
│  - 5 Gates: check & guard    │          │  - 25 Vue 3 components       │
│  - SITE-GRAPH & Layout rules │          │  - Living Brandbook /ui      │
│  - Static Audits (SEO/a11y)  │          │  - UI Validator (ui check)   │
└──────────────┬───────────────┘          └──────────────┬───────────────┘
               │                                         │
               └────────────────────┬────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Target Web Project (Nuxt 4 / Vue 3)                  │
│  1. .ai/aiall.json: registers both packs (ds7 + ui)                    │
│  2. theme.css: overrides brand variables on top of theme-base.css      │
│  3. app/components/ui/: optional local component overrides   │
└────────────────────────────────────────────────────────────────────────┘
```

### Nuxt 4

Run `npm install @ai.all/ui` and `npx ui init` in the project. Start Nuxt and open
`/ui`. The local module entry in `modules/aiall-ui.mjs` loads the package module
without editing `nuxt.config`. The module registers compiled ESM components from the package. Its default CSS
mode loads the small foundation sheet once and attaches scoped CSS to the used
components. Put project tokens and theme rules in `app/assets/css/theme.css`
and import it from `main.css`. The kit's foundation lives in the
`aiall-ui-foundation` cascade layer. A later project layer or unlayered
project styles override the fallback tokens and HTML styles. Older
`theme-base.css` and `base.css` project files can remain in the CSS entry during
migration.

Use `<UiButton />` directly. A matching component under `app/components/ui/`
takes precedence. Use `npx ui add UiButton` to start an override. For a custom
Nuxt source or modules directory, add `'@ai.all/ui/nuxt'` to the existing
`modules` array and use that source directory for styles and overrides.

The managed `/ui` route and developer overlay are enabled in development. The
default production build excludes both. A custom project-owned `/ui` page
remains available. Enable the tools you need when building a staging or internal
site:

```ts
export default defineNuxtConfig({
  modules: ['@ai.all/ui/nuxt'],
  aiallUi: { brandbook: true, devTools: true },
  runtimeConfig: { public: { uiDevTools: 'off' } },
});
```

Use one module entry, either `modules/aiall-ui.mjs` from init or the config
entry above. Use `aiallUi.css: 'bundle'` for a single minified foundation and
component sheet. `css: false` skips automatic global CSS and leaves scoped
component styles attached. Remove older manual imports of the package's
`tokens/*.css` from project CSS when using the module foundation. Legacy raw
SFC imports remain supported. Use one delivery path for each component.

### Vue 3 with Vite or Node SSR

Vue 3.5+ is a peer dependency. The ESM exports compile templates ahead of time
and leave Vue external. Choose one CSS strategy:

| Strategy          | Component import                                               | Global CSS                                                                                        |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Modular (Vite)    | `import UiButton from '@ai.all/ui/styled/UiButton'`            | Import `@ai.all/ui/styles/foundation.css` once                                                    |
| Combined          | `import { UiButton } from '@ai.all/ui'`                        | Import `@ai.all/ui/styles.css` once                                                               |
| Manual / Node SSR | `import UiButton from '@ai.all/ui/components/UiButton'`        | Serve `styles/foundation.css` and individual `styles/UiButton.css` through the app's CSS pipeline |
| Legacy Vue SFC    | `import UiButton from '@ai.all/ui/components/ui/UiButton.vue'` | Import the foundation once                                                                        |

The JS-only exports can run in Node with `vue/server-renderer`. The styled
subpaths import CSS and belong in a bundler pipeline. Vite SSR consumers using
those subpaths should set `ssr.noExternal: ['@ai.all/ui']`.

### Lazy loading and preload

Keep first-screen components synchronous so their HTML renders on the server.
Nuxt and Vite emit the module hints for the current route and entry graph.
Use `<LazyUiModal v-if="open" />` and `<LazyUiLightbox v-if="open" />` for
overlays that are closed initially. Warm a likely next interaction on hover or
keyboard focus if the Network trace justifies it:

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue';

const open = ref(false);
const loadLightbox = () => import('@ai.all/ui/styled/UiLightbox');
const Lightbox = defineAsyncComponent(loadLightbox);
const warmLightbox = () => {
  void loadLightbox().catch(() => {});
};
</script>

<template>
  <button @pointerenter="warmLightbox" @focus="warmLightbox" @click="open = true">
    Open image
  </button>
  <Lightbox v-if="open" :open="open" src="/photo.webp" alt="Product photo" @close="open = false" />
</template>
```

Preload a known LCP image or a critical self-hosted font at the application
level. Keep below-fold images lazy. Serve hashed production assets with
immutable caching and Brotli or gzip. For Nuxt/Nitro, `compressPublicAssets`
precompresses static assets. Enable compression for SSR HTML at the host or
reverse proxy. The package leaves the host's caching and compression settings
under project control.

### AI-ALL and DS7

Install and initialize these integrations when the project uses them. If
`.ai/aiall.json` exists with a `packs` array, `npx ui init` registers the UI pack.
Run `npx aiall sync` and `npx aiall check` after initialization or migration.

---

## 3. Built-In Quality Gates (`ui check`)

`@ai.all/ui` contains its own multi-gate validator:

| Gate                          | Check                      | Rule                                                                                                                                     |
| ----------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Gate 1: Token Contract**    | `tokens/theme-base.css`    | Verifies required semantic variables are declared (`--color-paper`, `--color-ink`, `--color-brand`, etc.).                               |
| **Gate 1b: Known Tokens**     | Components in `<style>`    | Every `var(--x)` without a fallback is declared in the theme CSS files or in the component itself.                                       |
| **Gate 2: Token Discipline**  | Components in `<style>`    | Forbids raw `#hex` or `rgb()` literals in components; enforces `var(--color-*)`.                                                         |
| **Gate 3: Modifier Naming**   | Class attributes           | Enforces separate dash-prefixed modifiers (`.-modifier`), forbids compound anti-patterns (`.btn-big`) and BEM elements (`.card__title`). |
| **Gate 4: Component Anatomy** | Vue Single File Components | Requires `<template>`, `<script setup lang="ts">`, and forbids `!important`.                                                             |

Run quality gates:

```bash
npx @ai.all/ui check
npx @ai.all/ui check --strict # Fails with exit code 1 on violations
```

---

## 4. Commands Reference

| Command                          | Description                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `npx @ai.all/ui init`            | Scaffolds the Nuxt integration, override styles, Brandbook entry, and AI-ALL pack. |
| `npx @ai.all/ui check`           | Runs all UI quality gates.                                                         |
| `npx @ai.all/ui check --strict`  | Runs quality gates in CI mode (exit code 1 on issue).                              |
| `npx @ai.all/ui list`            | Lists all available components in the catalog.                                     |
| `npx @ai.all/ui add <Component>` | Copies a component from catalog to `app/components/ui/`.                           |
| `npx ui status`                  | Shows the installed and recorded versions plus file decisions.                     |
| `npx ui diff`                    | Shows local files alongside the installed version’s scaffold.                      |
| `npx ui update [--dry-run]`      | Plans or applies safe scaffold updates.                                            |
| `npx ui rollback [--dry-run]`    | Plans or restores the most recent scaffold transaction.                            |
| `npx @ai.all/ui --version`       | Prints current package version.                                                    |

### Updating a project

Install the desired npm version or tarball first, then run:

```bash
npx ui status
npx ui diff
npx ui update --dry-run
npx ui update
```

The package supplies the default styles, components and Brandbook. The update
command records the installed version and SHA-256 hashes of managed project files
in `ui/.manifest.json`. It preserves edited files, previously managed files you
deleted, and local component overrides. It recognizes the unmodified scaffolds
from 0.2.0-beta.0 and 0.2.0-beta.1. For a customized legacy Brandbook, use the new
package page as a reference when merging your edits. Customized legacy styles
are retained in full and can still override the current defaults.

`npx ui rollback` restores the last scaffold transaction and stops if a file was
edited since that transaction. It only restores project files. Use npm to change
the installed package version. Keep `ui/.transaction.json` and `ui/.lock` local
and out of version control. After interruption, check that the CLI has stopped
before removing a stale lock, then run `npx ui rollback` to restore the pending
transaction.

---

## 5. Included Core Components

Every component is self-contained: it uses only the tokens above, takes its texts as props and imports nothing from a project.

An ordinary `<UiButton>` renders `.btn`. Add `variant="primary"` or
`variant="secondary"` for a different role. Use `bright` or `light` for the theme’s named appearance variants, and `size="small"` or `size="big"` for
a different size. The default color and states read `--ui-button-background`,
`--ui-button-color`, `--ui-button-hover-background` and `--ui-button-hover-color`.
The primary variant reads its corresponding `--ui-button-primary-*` tokens.
Passing `href` renders an anchor with the same button appearance. `variant="link"`
renders a compact text-link appearance on a native button when no `href` is
provided. `variant="transparent"` keeps the button size and padding without a
resting fill; its text and hover colors use `--ui-button-transparent-*` tokens.

Buttons, single-line fields and selects share `--control-height`,
`--control-height-small` and `--control-height-big` (44, 36 and 52 px by default).
Set those heights once in the theme to size the controls together. The button
has separate horizontal padding and font tokens for each size. Square buttons
use the same height for their width.

- **Atoms:** `UiIcon`, `UiButton` (primary, secondary, bright, light, outline, ghost, transparent, link; small, medium, big; square, block, loading; `on-dark`), `UiTag`, `UiCopyButton`, `UiCheckbox`, `UiSwitch`, `UiImg`, `UiMedia`
- **Molecules:** `UiField`, `UiSelect`, `UiChips` (pill, soft, segment, tile; small, medium; `on-dark`), `UiAlert`, `UiSpecs`, `UiPriceBox`, `UiStepper`, `UiTimeline`, `UiSliderNav` (dots, numbered, arrows; small; `on-dark`), `UiCounter` (− / +), `UiTabs`, `UiBreadcrumb`, `UiAccordion` (card, plain, accent; one open at a time)
- **Organisms:** `UiCardGrid`, `UiModal`, `UiLightbox`
- **Tools:** `UiDevTools` (layout grid, baseline rhythm, outlines, viewport size and a visual a11y/SEO check, in development)

## 6. Local Demo

```bash
npm install
npm run dev   # http://localhost:3333/ui
```

The dev page renders `templates/ui.vue`, the same package Brandbook that the Nuxt integration renders.

`npm run build` generates ESM, CSS and declarations into `dist/`. `npm pack`
runs the build automatically. `npm run verify` installs the packed archive in
clean consumers and checks Nuxt SSR, Vue/Vite, TypeScript and lazy loading.
Run `npx playwright install chromium` before local browser verification. The
release workflow runs the same check before publishing the version in the Git tag.
See [PERFORMANCE.md](PERFORMANCE.md) for measurements and reproduction commands.

---

## 7. Developer Tools and Shortcuts

Put `<UiDevTools />` once in `app.vue` or the default layout: the tools then work on every page of the site. The `/ui` brandbook has a **Dev tools** tab with a switch for each, and the top bar has the grid and the detail level.

- **Layout grid** (`Alt` + `G`, or the red Grid button): 12 / 16 / 24 columns inside `--content-width`, `--grid-gutter` between them, a dashed line one base step outside (`--grid-edge`).
- **Baseline rhythm** (`Alt` + `R`): horizontal lines every `--rhythm-step` to check vertical spacing.
- **Outlines** (`Alt` + `O`): a thin outline on every element.
- **Viewport size** (`Alt` + `S`): width × height and the breakpoint in a corner badge.
- **Visual check** (`Alt` + `A`): marks in red, with the reason on hover, what the visible page misses: image alt and size, names of links and buttons, field labels, heading order, one h1, duplicate ids, title and description length, canonical (unless noindex), `lang`. Click an item in the list to scroll to it. It is a quick check while building; CI audits stay the source of truth.
- **Site setting** in `nuxt.config.ts`:

  ```ts
  runtimeConfig: {
    public: {
      uiDevTools: 'dev';
    }
  } // 'dev' | 'always' | 'off'
  ```

  `dev` (default) shows the tools in development only. Set `aiallUi.devTools: true` when building production with overlays available. In that build, switch between `always` and `off` without rebuilding with `NUXT_PUBLIC_UI_DEV_TOOLS=always|dev|off`. The choices are remembered in `localStorage` (`ui-dev-tools`).

| Shortcut                      | Where                           | Does                                             |
| ----------------------------- | ------------------------------- | ------------------------------------------------ |
| `Alt` + `G`                   | any page with `UiDevTools`      | Steps the grid 12 → 16 → 24 → off                |
| `Alt` + `R` / `O` / `S` / `A` | any page with `UiDevTools`      | Rhythm / outlines / viewport size / visual check |
| `Esc`                         | modal, lightbox, brandbook menu | Closes it                                        |
| `+` / `-` / `0`               | lightbox                        | Zoom in / out / fit                              |
| `Tab` / `Shift` + `Tab`       | everywhere                      | Moves focus; a 2 px ring shows where it is       |

## Project brandbook sections

To add a project section, import `@ai.all/ui/templates/ui.vue` in the project's
`app/pages/ui.vue`. Pass an array of `{ id, name }` as `sections` and supply a
named slot for each ID. Use lowercase, dash-separated IDs that do not match
an existing tab. The component keeps the package tabs and uses `?tab=<id>`
for direct links to project sections. Keep the wrapper and slot content in
the project so updating the package also updates the built-in tabs.

## 7. Source gallery (dev only)

A tool inside the brandbook for the source images of a site: browse them, process and replace the originals. It is a Nuxt layer of this package, served on the development server only.

**Turn it on** in the site's `nuxt.config.ts` (or in the ui app, as this repository does):

```ts
aiallUi: { gallery: { folder: 'ds', git: 'ignore' } }
```

- `folder`: the source folder, relative to the project root (`ds` by default). Files are read from there, never from `public/`.
- `git`: `'ignore'` (default) adds `/ds/` to the site's `.gitignore` once, so large originals stay out of the repository; `'track'` leaves git alone.

**Where it is:** `/ui/ds`, linked from the brandbook header (`← Brandbook`) and from the page itself. The full guide is in [docs/GALLERY.md](docs/GALLERY.md). The full guide is in [docs/GALLERY.md](docs/GALLERY.md).

**What you can do**

- **Browse:** folders as segments (All or one folder), search by name, Name or Path labels to copy, 4 or 7 images per row, light or dark background.
- **Select:** a circle on each card, Shift selects a range, Select all and Clear.
- **Copy:** the names or paths of the selection, to paste into code or a message.
- **View:** click a picture for a full-size viewer.
- **Process** (`sharp` needed, an optional peer): Trim margins (remove flat borders), Remove background (only the flat colour connected to the edge; set the tolerance first), Optimise (WebP or JPEG at the chosen quality).
- **Move** the selected files to another folder, or **Delete** them.
- **Apply:** a processed result replaces the original; the original is kept in `_backup/`. A result can be discarded instead.

**Safety**

- Paths are checked: a name cannot climb out of the source folder, and only image files are served.
- The API and the image routes answer 404 in production; the page is marked `noindex`.
- Nothing is changed in the source folder until you apply a result or move/delete a file.

**Limits**

- Background removal works on a flat, single-colour background; it is not a cut-out tool for photos with busy backgrounds.
- Processing needs `sharp` installed in the site (`npm i -D sharp`); without it the gallery still browses and copies.

## 8. License

MIT. Author: Igor Orlov.
