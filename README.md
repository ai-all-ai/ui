# @ai.all/ui

[![npm](https://img.shields.io/npm/v/@ai.all/ui)](https://www.npmjs.com/package/@ai.all/ui)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![repo](https://img.shields.io/badge/github-ai--all--ai%2Fui-blue)](https://github.com/ai-all-ai/ui)

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
without editing `nuxt.config`. The module registers the catalog from npm, loads the
package CSS, then loads the project CSS entry in `app/assets/css/main.css`. Put
token overrides in `app/assets/css/theme-base.css` and custom HTML styles in
`app/assets/css/base.css`. Keep their imports in a customized `main.css`.

Templates can use `<UiButton />` directly. A matching component under
`app/components/ui/` takes precedence. Use `npx ui add UiButton` to start an
override, then restart Nuxt if it was already running.

For a custom Nuxt source or modules directory, register `'@ai.all/ui/nuxt'` in the
existing `modules` array and place styles and overrides under that source directory.
The module supplies `/ui` when pages are enabled and there is no local route for
it. Keep `<NuxtPage />` in a custom app entry and add `<UiDevTools />` once if you
want the developer overlays.

### Vue 3 with Vite

Use Vue 3.5 or later and Vite's Vue plugin. Import SFCs and styles directly:

```vue
<script setup>
import UiButton from '@ai.all/ui/components/ui/UiButton.vue';
import '@ai.all/ui/tokens/theme-base.css';
import '@ai.all/ui/tokens/base.css';
</script>

<template>
  <UiButton>Get started</UiButton>
</template>
```

Import the styles once in the application entry when multiple pages use them.
The `/ui` route and its URL-based navigation are provided by the Nuxt integration.

### AI-ALL and DS7

Install and initialize these integrations when the project uses them. If
`.ai/aiall.json` exists with a `packs` array, `npx ui init` registers the UI pack.
Run `npx aiall sync` and `npx aiall check` after initialization or migration.

---

## 3. Built-In Quality Gates (`ui check`)

`@ai.all/ui` contains its own multi-gate validator:

| Gate | Check | Rule |
|---|---|---|
| **Gate 1: Token Contract** | `tokens/theme-base.css` | Verifies required semantic variables are declared (`--color-paper`, `--color-ink`, `--color-brand`, etc.). |
| **Gate 1b: Known Tokens** | Components in `<style>` | Every `var(--x)` without a fallback is declared in the theme CSS files or in the component itself. |
| **Gate 2: Token Discipline** | Components in `<style>` | Forbids raw `#hex` or `rgb()` literals in components; enforces `var(--color-*)`. |
| **Gate 3: Modifier Naming** | Class attributes | Enforces separate dash-prefixed modifiers (`.-modifier`), forbids compound anti-patterns (`.btn-big`). |
| **Gate 4: Component Anatomy** | Vue Single File Components | Requires `<template>`, `<script setup lang="ts">`, and forbids `!important`. |

Run quality gates:
```bash
npx @ai.all/ui check
npx @ai.all/ui check --strict # Fails with exit code 1 on violations
```

---

## 4. Commands Reference

| Command | Description |
|---|---|
| `npx @ai.all/ui init` | Scaffolds the Nuxt integration, override styles, Brandbook entry, and AI-ALL pack. |
| `npx @ai.all/ui check` | Runs all UI quality gates. |
| `npx @ai.all/ui check --strict` | Runs quality gates in CI mode (exit code 1 on issue). |
| `npx @ai.all/ui list` | Lists all available components in the catalog. |
| `npx @ai.all/ui add <Component>` | Copies a component from catalog to `app/components/ui/`. |
| `npx ui status` | Shows the installed and recorded versions plus file decisions. |
| `npx ui diff` | Shows local files alongside the installed version’s scaffold. |
| `npx ui update [--dry-run]` | Plans or applies safe scaffold updates. |
| `npx ui rollback [--dry-run]` | Plans or restores the most recent scaffold transaction. |
| `npx @ai.all/ui --version` | Prints current package version. |

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

- **Atoms:** `UiIcon`, `UiButton` (primary, secondary, outline, ghost, link; small, medium, big; square, block, loading; `on-dark`), `UiTag`, `UiCopyButton`, `UiCheckbox`, `UiSwitch`, `UiImg`, `UiMedia`
- **Molecules:** `UiField`, `UiSelect`, `UiChips` (pill, soft, segment, tile; small, medium; `on-dark`), `UiAlert`, `UiSpecs`, `UiPriceBox`, `UiStepper`, `UiTimeline`, `UiSliderNav` (dots, numbered, arrows; small; `on-dark`), `UiCounter` (− / +), `UiTabs`, `UiBreadcrumb`, `UiAccordion` (card, plain, accent; one open at a time)
- **Organisms:** `UiCardGrid`, `UiModal`, `UiLightbox`
- **Tools:** `UiDevTools` (layout grid, baseline rhythm, outlines, viewport size and a visual a11y/SEO check, in development)

## 6. Local Demo

```bash
npm install
npm run dev   # http://localhost:3333/ui
```

The dev page renders `templates/ui.vue`, the same package Brandbook that the Nuxt integration renders.

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
  runtimeConfig: { public: { uiDevTools: 'dev' } } // 'dev' | 'always' | 'off'
  ```

  `dev` (default) shows the tools in development only; `always` everywhere (a review on staging); `off` removes them. Without a rebuild: `NUXT_PUBLIC_UI_DEV_TOOLS=always|dev|off`. The choices are remembered in `localStorage` (`ui-dev-tools`).

| Shortcut | Where | Does |
|---|---|---|
| `Alt` + `G` | any page with `UiDevTools` | Steps the grid 12 → 16 → 24 → off |
| `Alt` + `R` / `O` / `S` / `A` | any page with `UiDevTools` | Rhythm / outlines / viewport size / visual check |
| `Esc` | modal, lightbox, brandbook menu | Closes it |
| `+` / `-` / `0` | lightbox | Zoom in / out / fit |
| `Tab` / `Shift` + `Tab` | everywhere | Moves focus; a 2 px ring shows where it is |

## 8. License

MIT. Author: Igor Orlov.
