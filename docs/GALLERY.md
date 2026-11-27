# Source gallery

The source gallery is a tool inside the `/ui` brandbook for the source images of a site: browse them, process them and replace the originals. It works on the development server only.

It answers four questions: where are my images, which of them need work, how do I process them safely, and how do I put the result in place.

## 1. Turn it on

In the site's `nuxt.config.ts` (or the ui app, as in this repository):

```ts
export default defineNuxtConfig({
  aiallUi: { gallery: { folder: 'ds', git: 'ignore' } },
});
```

- `folder` (default `ds`): the source folder, relative to the project root. Files are read from there, never from `public/`.
- `git` (default `'ignore'`): `'ignore'` adds `/ds/` to the site's `.gitignore` once, so large originals stay out of the repository; `'track'` leaves git alone.

The page is at `/ui/ds`. The brandbook header links to it, and the gallery header links back (`← Brandbook`).

## 2. The screen

- **Title row:** `@ai.all/ui · DS7 ← Brandbook`, then **Source files**. On the right, three groups:
  - **Show:** `Name` (copies the file name) or `Path` (copies the path inside `ds/`).
  - **Background:** `Light` or `Dark`, to check a picture on both.
  - **Columns:** `4 per row` or `7 per row`.
- **Folder row:** `All`, or one folder with its file count (`. (3)` is the root of `ds/`), and **Search by name**.
- **Action panel:** the count of selected files, the buttons and the settings (section 4).
- **Grid of cards:** one card per image, with a circle to select it.

## 3. Browse and select

- **Folders:** click a folder to show only its files. `All` shows everything.
- **Search:** filters by file name as you type.
- **Select:** click the circle on a card. Shift with a second click selects the range between them.
- **Select all / Clear:** selects every file shown (after folder and search filters) or clears the selection.
- **View:** click the picture for a full-size viewer.
- **Copy:** copies the names (Show: Name) or the paths (Show: Path) of the selected files, one per line.

## 4. Process (dev only, needs `sharp`)

`sharp` is an optional peer dependency of the site: `npm i -D sharp`. Without it the gallery still browses, selects and copies; the processing buttons report that `sharp` is missing.

Processing never touches the originals. A result is written to `ds/_processed/<action>/` and waits there until you replace or discard it.

- **Trim margins:** removes flat borders around the picture (a colour close to the edge colour). No settings.
- **Remove background:** makes the flat background transparent. Only the single colour connected to the edge is removed. A JPEG becomes a PNG (`name.jpg` → `name.png`). Setting: **Background tolerance**, 4 %, 8 %, 15 % or 25 %; higher removes more shades.
- **Optimise:** recompresses the file in its own format (PNG, JPEG, WebP or AVIF) at the chosen quality. SVG and animated files are skipped. Setting: **JPEG quality**, 60, 70, 80 or 90.

Trim and Optimise work on any photo. Remove background works on a flat, single-colour backdrop; on a busy background it cuts parts of the subject, so check the result before replacing the original. The results list under the grid shows each result by action and folder.

## 5. Move, delete, apply

- **Move to:** choose a folder under `ds/`, then **Move**. A file with the same name already there is skipped, not overwritten.
- **Delete:** removes the selected files from `ds/`.
- **Replace** (on a result; **Replace all originals** for the whole list): puts the result in place of the original. The original is first copied to `ds/_backup/` (keeping its folder), so it can be restored by hand.
- **Discard** (on a result; **Discard all** for the whole list): deletes the result from `_processed/`; the original stays as it is.

Nothing changes in `ds/` until you replace an original with a result, move a file or delete a file.

## 6. Safety

- Paths are checked on the server: a name cannot leave the source folder (`..` and absolute paths are refused), and only image files are read or served.
- The gallery exists on the dev server only: a production build (`nuxt build`, `nuxt generate`) has no `/ui/ds` page and no API or image routes, whatever `aiallUi.gallery` says.
- The page is marked `noindex`.
- `_processed/` and `_backup/` live inside `ds/`, which `git: 'ignore'` keeps out of git.

## 7. Limits

- Background removal is for a flat backdrop; it does not cut out people or objects from photos.
- Tolerance is one colour distance; shadows on the backdrop may stay.
- Processing runs one image at a time on the server; a large folder takes a while.
- The gallery is for the source folder, not for the final images the site serves. The site builds its final images from its own sources, not from this folder.

## 8. Where it lives

- Page: `gallery/pages/ds.vue`, served at `/ui/ds`.
- Components: `gallery/components/` (`UiGallery`, `UiGalleryToolbar`, `UiGalleryResults`, `UiGalleryViewer`).
- Server: `gallery/server/` (API under `/api/ds`, images under `/ds-files/`), logic in `gallery/lib/ds.js`. `npm run build` compiles the server files to `dist/gallery/server/*.mjs`, because Nitro compiles no TypeScript inside `node_modules` and auto-imports nothing there; the sources therefore import what they use from `#imports`.
- The page has no site layout and loads the layered token stylesheet itself, so it works in a site with `aiallUi.css: false`. A site's own global rules for generic class names (`.modal`, `.tabs`) still apply to the gallery's components, as they do to every ui component.
- Tests: `test/gallery.test.mjs`.
