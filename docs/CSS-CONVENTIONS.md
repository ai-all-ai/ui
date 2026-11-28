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

`npx @ai.all/ui check --strict` (five gates) runs in CI and before a release:

- Token Contract: the theme declares the required semantic tokens
- Known Tokens: every `var(--x)` a component uses is declared
- Token Discipline: tokens only, no raw colour values
- Modifier Architecture: dash modifiers; no compound names (`.btn-big`) and no BEM elements (`__`)
- Component Anatomy: `<script setup lang="ts">`, `<template>`, no `!important`

Tag selectors next to classes, id selectors and nesting depth are checked in code review.

## Specificity, scope and the brandbook page

These come from DS7 (`02-design-system/CSS-CONVENTIONS.md`, sections 14 and 15). They are the most common source of breakage when a component is converted to nesting.

- **Nesting raises specificity.** A flat part rule `.btn` is 0,1,0; the same rule nested as `.counter .btn` is 0,2,0. An override, including one in a media query, is written at the same level as the rule it overrides. `UiCounter` and the brandbook were checked by screenshot after this change.
- **Scoped styles reach child roots.** A component that renders a child with root `.btn` must not use `.btn` as one of its own part names: the child root carries the parent's scope attribute and would be styled too. The brandbook's own cell wrapper is `.specimen` for this reason.
- **The brandbook page is a parent component** with root `.bb`. Its parts are nested under `.bb`, its media queries are nested under `.bb` too, and its markup uses short names (`.row`, `.tab`, `.swatch`, `.specimen`).
- **Converted order.** Nested rules stay in the place of the rule they replace. A later rule with equal specificity still wins.

## Breakpoints

One set for the whole kit, in `tokens/breakpoints.json`: **480, 768, 1024, 1280, 1440 px**. It is the only set. Each value is for one band:

| Breakpoint | Band                      | Used for                                                         |
| ---------- | ------------------------- | ---------------------------------------------------------------- |
| 480 px     | phone                     | single columns, icon-only labels in the stepper                  |
| 768 px     | tablet, narrow (portrait) | cards in one column, gallery in two                              |
| 1024 px    | tablet, wide (landscape)  | three columns, timeline in three                                 |
| 1280 px    | laptop                    | the brandbook desktop header                                     |
| 1440 px    | desktop                   | reserved for the dev tools badge; no component query uses it yet |

Rules:

- CSS media queries use these values only: `max-width: 480px`, `max-width: 768px`, `max-width: 1024px`, `min-width: 1280px`.
- A new breakpoint needs three things in one change: a new value in `tokens/breakpoints.json`, the matching query in CSS and in `UiDevTools`, and a note in this file. `test/breakpoints.test.mjs` fails until all three agree.
- Do not write a breakpoint in a component by hand. Use one of the five values.

See also _Where JavaScript reads the breakpoints_ in `docs/SITE-SETUP.md`.

## Verification used for the conversion

- `npx @ai.all/ui check --strict`, `npm test` (the test suite), `npm run build`, `npm run test:package` (Playwright).
- Screenshot of the brandbook at 1440 px and 390 px, compared with the release before the conversion: identical at 1440 px; at 390 px the only difference is a 24×5 px area at the bottom edge (the floating button, present before the conversion too).
