# Changelog

All notable changes to @ai.all/ui are recorded here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Brandbook sections can be supplied by the site as named slots and linked by tab ID.

### Changed

- Gallery: the selected count and a Clear selection action sit under the title; the All filter shows the total.
- Gallery: the controls row no longer shifts the title; the settings gear stays in place when the selection badge appears.
- Gallery: 12 files per row option for small icons.
- Gallery: delete confirmation stays inside the gallery frame and the gallery is on by default in development.
- Reset native button and anchor differences on `.btn`; document both directions in the brandbook. Add a full-size transparent variant and theme tokens, show selection on gallery thumbnails, place selected-file actions before Settings, and shorten the main tab labels with Tools first.

- Render the ordinary button as `.btn`; primary is explicit. Buttons, fields and selects share three height tokens and Component theme previews them together.

- The brandbook puts Component list next to Component theme and labels its HTML examples Tags.

- Rename the Dev tools tab to Tools and move the source gallery link into it.

- Brandbook settings use compact Info and Grid selects in a sidebar.

- Source gallery folder filters use link styling and wrap on narrow screens. Single-file deletion is confirmed in the gallery toolbar.

## [0.4.0-beta.1] — 2026-11-27

### Fixed

- The source gallery (`aiallUi.gallery`, `/ui/ds`) works in a site. It only ran inside this repository: from `node_modules` the site's Nitro does not compile TypeScript or auto-import, so `nuxt generate` failed on the server files and every dev page answered 500 with `defineEventHandler is not defined` and `useHead is not defined`. The server files are compiled to `dist/gallery/server/*.mjs` by `npm run build` (explicit `#imports`), and the gallery page and components import the Vue and Nuxt APIs they use. `UiChips` is imported by the gallery itself, so a site's own `UiChips` cannot replace it.
- The gallery exists in development only: a production build (`nuxt build`, `nuxt generate`) has no `/ui/ds` page, no API routes and no `.gitignore` line, whatever `aiallUi.gallery` says. Before, `nuxt generate` tried to prerender `/ui/ds` and failed.
- The gallery page has no site layout (no header, footer or floating buttons), and loads the layered token stylesheet itself, so it renders in a site that sets `aiallUi.css: false`.
- `aiall-pack.json` said 0.3.0-beta.0 in 0.4.0-beta.0; it follows the package version again.
- `ALL.md` (copied to `ui/ALL.md` in a site) no longer links a `docs/CSS-CONVENTIONS.md` that a site does not have.

### Added

- Package test: a site with the gallery configured. In development the API lists the folder, an image is served with its type and `/ui/ds` renders; `ui update` keeps the setting and the gallery still serves; in a production build the page and the API answer 404.

## [0.4.0-beta.0] — 2026-11-27

### Changed

- **Breaking (class names):** BEM element names are gone from the components, the brandbook and the gallery. Inner parts are short names scoped under the root: `.counter__btn` becomes `.btn` (`.counter .btn` in plain CSS), `.gallery__card` becomes `.card`, `.btn__spinner` becomes `.spinner`. Element modifiers are dash modifiers on the part: `.gallery-toolbar__row--settings` becomes `.row.-settings`. Projects that override these classes must rename them. Root classes and dash modifiers (`.btn.-primary`, `.tabs.-pill`) do not change.
- Brandbook page (`templates/ui.vue`): the four classes that collided with component parts are `bb-chip`, `bb-btn`, `bb-tab` and `bb-row`.
- `ui check` (Gate 3) fails on BEM element names (`block__element`), and the naming rule in `ALL.md` says so.
- The package test checks that no BEM name is left in the production CSS.
- Component styles use native CSS nesting: inner parts are written under the root (`& .btn`, `&.-small`). The compiled selectors are the same as before; brandbook screenshots are pixel-identical on desktop.
- `docs/CSS-CONVENTIONS.md`: the CSS rules that `@ai.all/ui` applies, with its exceptions (`UiDevTools` global block, `:deep()` use, transition names).
- `UiTag` and `UiDevTools` styles no longer use tag selectors next to classes; the global `html .dev-issue` became `.dev-issue`.

## [0.3.0-beta.0] — 2026-11-27

### Added

- Source gallery at `/ui/ds` (linked from the brandbook header), an option of the Nuxt module: `aiallUi: { gallery: { folder: 'ds', git: 'ignore' } }`. Browse, search, copy names or paths, select, move, delete, trim margins, remove background and optimise the images of the site's source folder, then replace the originals (a copy stays in `_backup/`). Dev server only: the API and image routes answer 404 in production. `sharp` is an optional peer dependency for the image actions. `git: 'ignore'` (default) adds the folder to the site's `.gitignore` once; `git: 'track'` leaves git alone.
- `UiGallery` with its sub-components (toolbar, viewer, results), built from the ui components. Display options and folders are one-line segments with their labels on the left.
- `UiChips` `inline` prop: the legend on the left of the choices, on one line (a group, not a fieldset).
- `UiDevTools` measures the page's real content box for the grid, so it follows the site's own container (`data-dev-grid`).
- Page width and margins come from the site's `--content-width` and `--page-gutter` (four base steps). The brandbook and the gallery share them.

- Precompiled Vue ESM, TypeScript declarations, modular scoped CSS and an optional combined minified stylesheet.
- Lighthouse, network and CSS coverage measurements for a packed-package consumer.

### Changed

- The Nuxt module uses precompiled components. Project themes override the package's layered fallback styles.
- The managed Brandbook and developer overlays are excluded by default from production. Enable them with `aiallUi.brandbook` and `aiallUi.devTools`.
- Brandbook renders the active tab first, retains previously opened tabs and loads dialogs on demand. The generated starter page links to the Brandbook when it is available.

## [0.2.0-beta.3] — 2026-11-27

### Fixed

- Brandbook shows the configured developer-tools mode when its overlays are disabled.

## [0.2.0-beta.2]

### Added

- Nuxt 4 module for package component registration, project overrides, global CSS and the Brandbook route.
- Versioned scaffold manifest, status, diff, dry-run updates and transaction rollback.
- Packed-package verification in CI for clean Nuxt, Vue/Vite and optional AI-ALL + DS7 integration.

### Fixed

- Standard Nuxt 4 initialization renders routes in place of the starter welcome screen and preserves the Nuxt config.
- Kit components import the Vue APIs they use. Developer tools share state per Vue application.
- Legacy untouched scaffold files migrate to package-backed resources. Modified files and existing component overrides are preserved.

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
