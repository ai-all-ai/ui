# ALL.md — @ai.all/ui Instructions

> Standard UI components, monochrome tokens, and living pattern catalog.

## 1. Core Rules for Agents

1. **Tokens-Only Styling:**
   Every UI component must consume semantic CSS variables (`var(--color-*)`, `var(--radius-*)`, `var(--font-*)`). Never hard-code hex or rgb color literals.

2. **Modifier Convention:**
   Naming must follow BEM with separate dash-prefixed modifier classes:
   - Correct: `class="btn -primary -lg"`
   - Forbidden: `class="btn-primary-lg"` or `class="card-big"`
   - States are dash modifiers too, as in DS7: `.tabs__tab.-active`, `.menu.-open`. Brandbook previews force a state with `-hover`, `-active` and `-focus`.

3. **Component Anatomy:**
   - Single responsibility, pure props/emits.
   - Script setup with TypeScript: `<script setup lang="ts">`.
   - Explicitly import Vue APIs and keep core components independent of Nuxt.
   - Never use `!important` in component styles.

4. **Living Brandbook Integration:**
   Every new or modified component appears on the `/ui` brandbook page (`app/pages/ui.vue`) from the npm package with a stable pattern ID (`BTN-01`, `MODAL-01`, `CARD-01`), every variant, size, state and the dark version, before a page uses it.

5. **Self-Verification:**
   Before committing, run the UI quality gates on the project's UI components:
   ```bash
   npx @ai.all/ui check --strict
   ```

6. **Developer Tools:**
   `<UiDevTools />` goes once in `app.vue` or the default layout and covers the whole site: layout grid (`Alt+G`), baseline rhythm (`Alt+R`), outlines (`Alt+O`), viewport size (`Alt+S`) and a visual a11y/SEO check (`Alt+A`). The `/ui` Dev tools tab switches each one. Site setting `runtimeConfig.public.uiDevTools`: `dev` (default), `always` or `off`; env `NUXT_PUBLIC_UI_DEV_TOOLS`. Layout tokens: `--content-width`, `--page-gutter`, `--grid-gutter`, `--grid-edge`, `--rhythm-step`.
