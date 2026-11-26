# Contributing to @ai.all/ui

`@ai.all/ui` is the UI kit of DS7: tokens, base HTML styles, Vue components and the `/ui` brandbook. Changes should make the kit clearer, more reusable or more correct.

## Before you start

- Open an issue first for a new component, a new token group or a change that breaks existing projects (major version).
- Small corrections (typos, a wrong class, a broken example) can go straight to a pull request.

## Development

```bash
npm install          # Nuxt, for the demo and the build check
npm run dev          # the brandbook at http://localhost:3333/ui
npm test             # the CLI smoke run and every test file
npm run test:one -- test/ui.test.mjs
npm run check:strict # the quality gates on components/ui
npm run verify       # what CI runs: format check, tests, gates, pack; run it before each push
```

CI runs the CLI tests on Linux and macOS with Node 18, 20, 22 and 24 and on Windows with Node 22, and builds the brandbook with Nuxt (`.github/workflows/ci.yml`). Keep `bin/` and `test/` to APIs that Node 18 has: for example no `import.meta.resolve`, `import.meta.dirname` or `Object.groupBy`.

## Rules

- A component is self-contained: only ui tokens, texts through props, no imports from a project.
- A new component or variant appears in `templates/ui.vue` first, with its ID, every size, state and the dark version, before a page uses it.
- Colours only from tokens; variants as separate dash modifiers (`.btn.-outline`); no `!important`.
- Every document is in English. Example copy is placeholder text, never real contact data.
- A user-visible change needs a line in `CHANGELOG.md` under `Unreleased`.
- Commits follow Conventional Commits (`feat(ui): …`, `fix(tokens): …`) with no trailers.

## Release

1. Move the `Unreleased` lines under a new version heading and set the same version in `package.json` and `aiall-pack.json`.
2. `npm run release:check` (clean tree, CHANGELOG section, version not yet on npm, tests).
3. `git tag -a vX.Y.Z -m "Release X.Y.Z"` and push the branch and the tag. The release workflow creates the GitHub release from the CHANGELOG section and publishes to npm (`next` for pre-releases).
