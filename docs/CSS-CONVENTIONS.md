# CSS conventions in @ai.all/ui

The full rules are in DS7: `02-design-system/CSS-CONVENTIONS.md` in the ds7 package (also in the DS7 repository). This page lists what `@ai.all/ui` applies, and where the ui components follow the rules and where they keep a deliberate exception.

## Applied in every component

- **Root names are short** (`.btn`, `.tabs`, `.counter`, `.pbox`, `.tline`). Variants are dash modifiers (`.btn.-lg`, `.tabs.-pill`).
- **Inner parts are short and nested under the root** (`.counter .btn`, `.tabs .tab`). Written with native CSS nesting (`& .btn`, `&.-small`) in the components that have been converted; flat rules that are not converted yet remain valid.
- **No BEM**: no `__` element names, no `--` modifiers on elements. `npx @ai.all/ui check` fails on them.
- **Custom properties on the root** (`--counter-ink`, `--counter-line`); parts read them.
- **Tokens only**: colour, space, radius and type come from `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--text-*)`.
- **No `!important`** in component styles.
- **ARIA state** for accessible state (`[aria-selected='true']`); dash modifiers for visual state (`.tab.-active`).

## Exceptions

- **`UiDevTools` global block.** The audit outline and the outlines tool must reach the whole page, so the block is global. Its rules are prefixed with the root (`html.dev-outlines .dev-issue`).
- **`:deep()`** is used only to reach a child ui component's root class or its svg, in the component that renders it (`.btn :deep(svg)`, `.chips`).
- **Transition names** (`page-enter-active`, `swap-leave-to`) are Vue's names and keep their suffix words.

## Checks

`npx @ai.all/ui check --strict` (Gates 1 to 4) runs in CI and before a release:

- tokens only, no raw colour values
- dash modifiers; no compound names (`.btn-big`) and no BEM elements (`__`)
- `<script setup lang="ts">`, `<template>`, no `!important`

Tag selectors next to classes, id selectors and nesting depth are checked in code review.

## Specificity, scope and the brandbook page

These come from DS7 (`02-design-system/CSS-CONVENTIONS.md`, sections 14 and 15). They are the most common source of breakage when a component is converted to nesting.

- **Nesting raises specificity.** A flat part rule `.btn` is 0,1,0; the same rule nested as `.counter .btn` is 0,2,0. An override, including one in a media query, is written at the same level as the rule it overrides. `UiCounter` and the brandbook were checked by screenshot after this change.
- **Scoped styles reach child roots.** A component that renders a child with root `.btn` must not use `.btn` as one of its own part names: the child root carries the parent's scope attribute and would be styled too. The brandbook's own cell wrapper is `.specimen` for this reason.
- **The brandbook page is a parent component** with root `.bb`. Its parts are nested under `.bb`, its media queries are nested under `.bb` too, and its markup uses short names (`.row`, `.tab`, `.swatch`, `.specimen`).
- **Converted order.** Nested rules stay in the place of the rule they replace. A later rule with equal specificity still wins.

## Verification used for the conversion

- `npx @ai.all/ui check --strict`, `npm test` (25 tests), `npm run build`, `npm run test:package` (Playwright).
- Screenshot of the brandbook at 1440 px and 390 px, compared with the release before the conversion: identical at 1440 px; at 390 px the only difference is a 24×5 px area at the bottom edge (the floating button, present before the conversion too).
