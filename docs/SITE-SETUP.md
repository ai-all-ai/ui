# Setting up @ai.all/ui in a site

This guide is for a real site: what to install, what to import, how to set the theme, and how to keep the page small. It describes the setup as it works today. The last section lists changes that are proposed but not made yet.

## 1. Install

```bash
npm i @ai.all/ui
```

The package works with Nuxt 4 and with Vue 3 on Vite or Node SSR. Use one of the two setups below, not both.

## 2. Nuxt (recommended)

Add the module and nothing else:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ai.all/ui/nuxt'],
  aiallUi: {
    brandbook: 'dev', // the /ui page: 'dev' (default), true or false
    devTools: 'dev', // layout grid, rhythm, outlines, visual check: 'dev' (default), 'always', true or false
    css: true, // the foundation and component styles (default true)
    gallery: true, // dev-only source gallery at /ui/ds: true (default) or false; or { folder: 'ds', git: 'ignore' }
  },
});
```

What the module does:

- Registers the components, so `<UiButton>` works in any page without an import.
- Loads the foundation tokens and base element styles once.
- Adds the `/ui` brandbook and the developer tools in development only. Production builds carry neither.
- Adds the source gallery on the development server only. It is on by default; `gallery: false` turns it off.

Production builds leave out the brandbook and the developer tools already. Set `brandbook: false` and `devTools: false` only to make that explicit.

## 3. Vite or Node SSR (without Nuxt)

Import the styles once, in the app entry:

```ts
// main.ts
import '@ai.all/ui/styles.css'; // all components, one file
```

Then import only the components the page uses:

```ts
import UiButton from '@ai.all/ui/components/UiButton';
```

`styles.css` is the whole kit (about 8 KB gzipped). If the page uses three components, importing the three modular styles from `@ai.all/ui/styles/*` is smaller, but it needs one more step, so start with `styles.css` and measure before splitting.

## 4. The theme

Tokens are CSS variables. The package ships the defaults in `tokens/theme-base.css`. A site changes them in its own `theme.css`, loaded after the package styles:

```css
/* theme.css */
:root {
  --color-brand: #0b5cad;
  --color-brand-hover: #094a8a;
  --radius-md: 12px;
  --content-width: 72rem;
}
```

Rules that keep the theme clean:

- Change a value in one place: colours, radii, spacing and widths are variables, never copied into components.
- Use the component hooks (`--ui-button-*`, and similar hooks as they are added) only for one-off changes.
- Keep the page width in `--content-width`; the brandbook and the gallery read the same value.

## 5. Keep the page small

- Nuxt: nothing to do. The production build tree-shakes unused components and minifies the CSS and JS.
- Vite: import only the components the page uses. The component JavaScript in the package is already minified (36 KB before gzip for the whole kit).
- Do not import `UiDevTools` or the brandbook into production code. The module keeps them out by default.

## 6. Check before you ship

```bash
npx @ai.all/ui check --strict
```

The checks cover tokens, colour use, modifier names, component structure and that every variable a component uses is declared. Run it in CI.

## 7. Updating

```bash
npx ui status      # installed version and file decisions
npx ui diff        # local files against the installed scaffold
npx ui update --dry-run
npx ui update
npx ui rollback    # if the update was wrong
```

Changes made in the site's own files are kept. The package never overwrites a file the site has changed.

## Proposed, not done yet

These changes would shrink the package and make the setup simpler. None of them is in the package yet.

- **Fewer files in `dist/`.** The build writes 117 files: 26 ESM files in `components/`, 25 wrappers in `styled/`, 27 CSS files in `styles/`, plus the index, runtime and gallery files. The proposal is to ship only the ESM components and `styles.css` by default, and to keep `styled/` and per-component CSS as an option. That cuts the default output to about 30 files without changing what a site imports.
- **Dark-background tokens.** A shared set of tokens for dark surfaces, so the `-on-dark` variants stop repeating the same overrides in each component.
- **Repeated CSS.** The focus ring and other rules that repeat in many components move into `tokens/base.css`, after each case is checked in a browser.
- **Reduced motion.** The seven copies of the `prefers-reduced-motion` rule stay in their components until the owner decides on a single global rule, because a global rule changes motion across the whole site.

## Checklist for a new site

1. `npm i @ai.all/ui`.
2. Add `modules: ['@ai.all/ui/nuxt']` (Nuxt) or import `styles.css` (Vite).
3. Put the brand values in `theme.css`.
4. Set `devTools` and `brandbook` for production as the site needs.
5. Run `npx @ai.all/ui check --strict` in CI.

## Breakpoints

The kit has one set of breakpoints, the same in CSS and in JavaScript: **480, 768, 1024, 1280 and 1440 px**. The source is `tokens/breakpoints.json`. A site does not need its own breakpoints; a site that adds one must follow the rule in `docs/CSS-CONVENTIONS.md`: a new value goes into the shared source, the test and the docs in the same change.

| Band          | Width         | Typical device                                 |
| ------------- | ------------- | ---------------------------------------------- |
| phone         | up to 480 px  | small phones                                   |
| tablet narrow | 481–768 px    | tablets in portrait, large phones in landscape |
| tablet wide   | 769–1024 px   | tablets in landscape, small laptops            |
| laptop        | 1025–1280 px  | laptops                                        |
| desktop       | 1281–1440 px  | desktop screens                                |
| wide          | above 1440 px | large monitors                                 |

### Where JavaScript reads the breakpoints

Only `UiDevTools` reads a breakpoint in JavaScript: the viewport badge (`Alt` + `S`) names the band the page is in. It does this with `window.matchMedia('(max-width: 768px)')` for each value, so the label follows the same queries as the CSS. It does not read `window.innerWidth` to decide the band; the number of pixels is shown, the band comes from the query.

Use `matchMedia` in JavaScript only when the code must choose a different behaviour by width, such as loading a component on phones only. For layout, use CSS: media queries reflow the page with no JavaScript, and container queries (with `@container`) can adapt a block to its own width. No JavaScript library is needed to rearrange blocks.

When a site writes its own JavaScript for a breakpoint, it takes the number from `tokens/breakpoints.json` and creates the query the same way:

```js
const phone = matchMedia('(max-width: 480px)');
phone.addEventListener('change', (e) => console.log(e.matches));
```

### A site with its own breakpoint

Most sites need only the five shared values. When one page needs a different width (a fixed banner, a map that must stay two columns down to 600 px), follow this path:

1. Use the nearest shared value first. Changing the layout to 768 px is usually enough.
2. If a value is really needed, put the query in the site's own CSS layer (its `theme.css` or a file of its own), never in the ui package. Add a comment that says why.
3. Write the difference in the site's `ds7/local/CUSTOM-LAYER.md`, next to the other differences from the standard, so the next update keeps it visible.
4. Do not add the value to `tokens/breakpoints.json`. A value that more than one site needs is proposed to the ui package as a change: the shared source, the test and the docs move together.

This matches the DS7 convention: the standard stays as the package ships it, and the project's own layer lives in `ds7/local/`.
