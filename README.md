# @ai.all/ui

Universal monochrome UI foundation, design tokens, and living pattern catalog for DS7 web projects.

[![npm](https://img.shields.io/npm/v/@ai.all/ui)](https://www.npmjs.com/package/@ai.all/ui)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 1. Overview

`@ai.all/ui` is an autonomous UI kit and pattern catalog designed to work both **completely stand-alone** and as an integrated part of the **AI-ALL + DS7** ecosystem.

- **Monochrome Slate Core:** Clean black-and-white visual baseline out of the box. Zero domain-specific colors.
- **Tokens-First:** Every component consumes semantic CSS custom properties (`--color-ink`, `--color-paper`, `--color-brand`, `--color-line`).
- **Brand Overlay Architecture:** A project changes only 5–7 brand variables in `theme.css` to recolor the entire UI.
- **Living Brandbook:** Interactive `/ui` sandbox page with stable pattern IDs (`BTN-01`, `MODAL-01`, `CARD-01`) and instant copy-code buttons (`UiCopyButton`).
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
│  - 5 Gates: check & guard    │          │  - 21 Tested Vue 3 Atoms/Org │
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
│  3. app/components/ui/: components copied or referenced from catalog   │
└────────────────────────────────────────────────────────────────────────┘
```

### Stand-Alone vs Ecosystem Mode

1. **Stand-Alone:**
   Use `@ai.all/ui` as a fast UI kit in any Vue/Nuxt project without AI-ALL:
   ```bash
   npx @ai.all/ui init
   npx @ai.all/ui add UiButton
   npx @ai.all/ui check --strict
   ```

2. **In AI-ALL Ecosystem:**
   `npx @ai.all/ui init` automatically registers `ui/aiall-pack.json` into `.ai/aiall.json`. Running `npx aiall sync` propagates UI directives and design rules directly into the root `ALL.md` and all agent instruction entrypoints.

---

## 3. Built-In Quality Gates (`ui check`)

`@ai.all/ui` contains its own autonomous multi-gate validator:

| Gate | Check | Rule |
|---|---|---|
| **Gate 1: Token Contract** | `tokens/theme-base.css` | Verifies required semantic variables are declared (`--color-paper`, `--color-ink`, `--color-brand`, etc.). |
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
| `npx @ai.all/ui init` | Scaffolds `theme-base.css`, `pages/ui.vue`, `ui/aiall-pack.json`, and updates `.ai/aiall.json`. |
| `npx @ai.all/ui check` | Runs all 4 autonomous UI quality gates. |
| `npx @ai.all/ui check --strict` | Runs quality gates in CI mode (exit code 1 on issue). |
| `npx @ai.all/ui list` | Lists all 21 available components in the catalog. |
| `npx @ai.all/ui add <Component>` | Copies a component from catalog to `app/components/ui/`. |
| `npx @ai.all/ui --version` | Prints current package version. |

---

## 5. Included Core Components

- **Buttons & Actions:** `UiButton`, `UiCopyButton`
- **Form Controls:** `UiField`, `UiSelect`, `UiCheckbox`, `UiSwitch`, `UiChips`
- **Modals & Overlays:** `UiModal`, `UiAlert`
- **Disclosure & Flow:** `UiAccordion`, `UiStepper`, `UiTimeline`
- **Media & Zero-CLS:** `UiImg`, `UiMedia`, `UiLightbox`, `UiCarousel`, `UiSlides`, `UiSliderNav`
- **Commerce & Structure:** `UiCardGrid`, `UiSpecs`, `UiPriceBox`, `UiTrust`

---

## 6. License

MIT. Author: Igor Orlov.
