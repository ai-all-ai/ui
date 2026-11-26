# Nuxt and package integration register

| Requirement or reported defect | Implementation | Regression coverage |
|---|---|---|
| Clean Nuxt 4 failed after install and init | Standard `modules` entry delegates to the exported Nuxt module | New Nuxt fixture uses the packed archive |
| Package components and `UiBreadcrumb` failed to resolve | Module scans the package and gives local components precedence | Brandbook component tab and a custom breadcrumb on both routes |
| Main CSS was missing and tokens were absent | Init creates the project entry and the module loads package defaults before local styles | Browser checks computed defaults and custom tokens |
| The welcome screen hid the Brandbook | Init recognizes the stock app shell and enables route rendering | HTTP checks for `/` and `/ui`, browser navigation and screenshots |
| `UiChips` threw `computed is not defined` | Vue APIs are explicit and Nuxt-specific wiring lives in the adapter | Component tab SSR and Vue/Vite build |
| Core components need plain Vue and SSR | Vue 3 peer, optional Nuxt peer, per-app developer state | Vite fixture without Nuxt and Nuxt SSR on dev and preview |
| Component design rules and package autonomy | Existing Atomic Design catalog and strict quality gates | Package checkout and fixture quality gates |
| Init and updates must preserve user work | Hash manifest, legacy matching, write journal and rollback conflict check | Repeated init, customized token migration, dry-run and rollback |
| Optional AI-ALL and DS7 interoperability | Existing AI-ALL registry gains the UI reference when present | DS7 init and AI-ALL sync/check with all three packages |
| Tests must validate installed artifacts | `npm run verify` installs the tarball in isolated consumers | CI package job and desktop/mobile Chromium artifacts |

The CLI scaffolds the standard Nuxt 4 directory layout. Custom source directories can register the module explicitly. Customized legacy pages retain their source and may require a manual merge to consume the new Brandbook.
