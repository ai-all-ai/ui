# Changelog

All notable changes to @ai.all/ui are recorded here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0-beta.1] — 2026-11-26

### Changed
- States are dash modifiers, as in DS7: `-active` (slider dot) and the brandbook previews `-hover`, `-active`, `-focus` replace the `is-` classes; the highlight in Base elements is `-hl`.
- `ALL.md` (copied to `ui/ALL.md` by `ui init`) speaks to a project: the brandbook is `app/pages/ui.vue`, the check is `npx @ai.all/ui check --strict`.

### Fixed
- `ui init` adds `@import './theme-base.css'` and `@import './base.css'` to `app/assets/css/main.css` (creates it when missing), so the tokens reach every page and DS7's css check sees the files used.
- `ui init`: the AI-ALL pack points at the files init puts in the project (`app/assets/css/theme-base.css`, `app/pages/ui.vue`, `ui/ALL.md`), so `aiall check` passes; before, it linked to paths inside the package.

## [0.2.0-beta.0] — 2026-11-26

### Added
- Brandbook `/ui` rebuilt with four tabs kept in the URL (`?tab=`): Foundations (colours in groups with live values and contrast, type, space, radius, shadow), Base elements (every HTML tag with a sample, tag chips that outline the tag in the sample, a filterable index), Components (a spec plate and live demo per pattern ID) and Catalog (filterable table, Markdown export). Every variable, value, ID, name, description, class and snippet has a copy button.
- Brandbook layout: icons in equal cards (icon, name and copy in fixed rows), button sizes and states in an equal-cell matrix with the code under each control.
- Brandbook Dev tools tab: one section per tool with its switch, what it checks and its shortcut; INFO and GRID controls stacked in the top bar.
- Brandbook detail switch (top bar and menu, remembered): View shows demos only, Info adds names, descriptions, classes and code, Full adds every copy button.
- Brandbook navigation: the tabs and on-page links stay in a sticky bar with a menu button (native popover) on the right; anchor links land below the bar at any width. Base elements open with a full page built from plain HTML (hover shows each tag, a switch outlines every element), with the tag index at the end. Component plates show classes and usage on two copyable lines; button states show their selector.
- `UiButton`: five variants (primary, secondary, outline, ghost, link), three sizes, square and block shapes, loading state, `on-dark` for dark bands; hover, active, focus, disabled and loading are documented on light and dark.
- `UiChips` (CHIPS-01): four variants taken from the sites (pill, soft, segment, tile with icons through a slot), small and medium sizes, `on-dark`, `hide-legend`, options as strings or `{ value, label, icon }`.
- `UiAccordion` (FAQ-01): questions open one at a time on native `<details name>` with a fallback; card, plain and accent variants.
- Brandbook: placeholder guide for every field kind (example values and why), select with a round chevron badge.
- `UiDevTools` (DEVTOOLS-01), from miluzsolar's grid: layout grid (12, 16, 24 columns, a dashed line one base step outside; Alt+G or the Grid button), baseline rhythm (Alt+R), outlines (Alt+O), viewport size (Alt+S) and a visual check that marks missing alt, labels, names, heading order, h1, duplicate ids and SEO basics in red (Alt+A). Site setting `runtimeConfig.public.uiDevTools`: `dev`, `always` or `off` (`NUXT_PUBLIC_UI_DEV_TOOLS`). Layout tokens `--content-width`, `--page-gutter`, `--grid-gutter`, `--grid-edge`, `--rhythm-step`; on phones the gutter and edge are set on `:root`. The Known Tokens gate accepts custom properties set in a template style binding.
- `UiCounter` (COUNTER-01, outline and inner), `UiTabs` (TABS-01, underline and pill), `UiBreadcrumb` (BREADCRUMB-01, plain and pill); sizes, `on-dark` and forced preview states on chips, tags and slider controls.
- Brandbook variant matrices for chips, tags, counter, slider controls, tabs and breadcrumb: each variant in its own labelled row of sizes, states and dark, with class, HTML and Vue copy per cell.
- `UiModal` types: small (confirm), wide, read, side panel and bottom sheet, a photo on top; the page behind is dimmed and blurred (`--backdrop-blur`); opening animation that respects reduced motion. The brandbook shows each type with its class and Vue tag.
- Asterisk favicon for the ui demo app (light and dark). The brandbook template sets no favicon, so inside a project `/ui` shows the project's own.
- `UiIcon` (ICON-01) and `UiTag` (TAG-01, with `on-dark`).
- `tokens/base.css`: styles for plain HTML elements; `ui init` copies it.
- Tokens: inverse colours for dark bands, space scale, text sizes, shadows, control and focus tokens.
- `ui check`: Known Tokens gate fails on a `var(--x)` that no theme file or component declares.

### Changed
- All components are self-contained: they no longer import project files (i18n, icons, scenes, masks, image manifests), call missing components or use colours from other sites. Texts come in as props.
- `UiCheckbox` uses `v-model` through `defineModel`; `UiField` is a plain labelled field with browser validation; `UiModal` uses the native `<dialog>`; `UiSpecs` takes `{ value, label }` items; `UiImg` requires `width` and `height`.
- `--color-warning` darkened to `#b45309` for 4.5:1 contrast on white.

### Removed
- `UiTrust`, `UiCarousel` and `UiSlides`: page sections of one site with its own texts and photos, not kit components.

### Fixed
- Select arrow: the UiSelect badge is centred with insets, and native `<select>` gets the same round badge instead of the browser arrow stuck to the edge.
- `ui --version` printed help instead of the version.
- `exports` now exposes `bin/*`, `templates/*` and `aiall-pack.json`, so a parent package (such as ds7) can `require.resolve('@ai.all/ui/bin/ui.js')`.
- Dev playground returned 500 (`__VUE_OPTIONS_API__ is not defined`) with vue-router 5.5.2; pinned vue-router 5.5.1 via `overrides` (affects only this repo's install, not consumers).

### Compatibility
- Pre-release: install with `npm i @ai.all/ui@next`. Component props and class names may still change before 0.2.0.
- Components from 0.1.0 were copies of one site and did not build on their own. Projects that copied them should copy them again (`npx @ai.all/ui add <Component>`) and adjust props: `UiCheckbox` and `UiSwitch` use `v-model`, `UiField` takes `kind`, `hint` and `error`, `UiSpecs` takes `{ value, label }`, `UiImg` needs `width` and `height`, `UiModal` closes with `@close` and takes `size` and `placement`.
- `UiTrust`, `UiCarousel` and `UiSlides` are gone; keep a project copy if a page still uses them.
- `ui check` fails on tokens the theme does not declare. Declare project tokens in a CSS file next to `theme-base.css` or use a base token.
- Add `<UiDevTools />` to `app.vue` or the default layout for the developer tools; `runtimeConfig.public.uiDevTools` switches them (`dev`, `always`, `off`).

## [0.1.0] — 2026-11-26

### Added
- Initial pre-release of `@ai.all/ui`.
- `tokens/theme-base.css`: neutral monochrome tokens (ink, paper, line, brand, feedback, typography, radiuses).
- 21 core components in `components/ui/` (buttons, modals, selects, chips, cards, sliders, steppers, copy buttons).
- CLI `ui`: `init`, `list`, `add <Component>` commands.
- Interactive brandbook template in `templates/ui.vue`.
