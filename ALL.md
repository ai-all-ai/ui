# ALL.md — @ai.all/ui Instructions

> Standard UI components, monochrome tokens, and living pattern catalog.

## 1. Core Rules for Agents

1. **Tokens-Only Styling:**
   Every component inside `components/ui/` must consume semantic CSS variables (`var(--color-*)`, `var(--radius-*)`, `var(--font-*)`). Never hard-code hex or rgb color literals.

2. **Modifier Convention:**
   Naming must follow BEM with separate dash-prefixed modifier classes:
   - Correct: `class="btn -primary -lg"`
   - Forbidden: `class="btn-primary-lg"` or `class="card-big"`
   - State classes use `.is-` prefix: `.is-active`, `.is-open`.

3. **Component Anatomy:**
   - Single responsibility, pure props/emits.
   - Script setup with TypeScript: `<script setup lang="ts">`.
   - Never use `!important` in component styles.

4. **Living Brandbook Integration:**
   Every new or modified component must be reflected in `templates/ui.vue` with a stable pattern ID (`BTN-01`, `MODAL-01`, `CARD-01`) and a `UiCopyButton` snippet.

5. **Self-Verification:**
   Before committing, always run:
   ```bash
   npm run check:strict
   npm test
   npm run format:check
   ```

6. **Developer Tools:**
   `<UiDevTools />` goes once in `app.vue` or the default layout and covers the whole site: layout grid (`Alt+G`), baseline rhythm (`Alt+R`), outlines (`Alt+O`), viewport size (`Alt+S`) and a visual a11y/SEO check (`Alt+A`). The `/ui` Dev tools tab switches each one. Site setting `runtimeConfig.public.uiDevTools`: `dev` (default), `always` or `off`; env `NUXT_PUBLIC_UI_DEV_TOOLS`. Layout tokens: `--content-width`, `--page-gutter`, `--grid-gutter`, `--grid-edge`, `--rhythm-step`.
