# Releasing @dashforge/* packages

This monorepo publishes ten `@dashforge/*` packages to npm, split across
two ecosystems (TW + MUI) and a shared bridge layer. Each package
versions independently — see `ROADMAP-1.0.md` for the rationale.

The release tooling lives in `scripts/` and is intentionally split into
two stages so the human stays in control of the destructive bits
(commit + publish + push).

```
┌─ prepare-release.mjs ─┐    ┌─ (you, manually)  ─┐    ┌─ publish-prepared.mjs ─┐
│  bump version         │    │  fill CHANGELOG    │    │  npmrc workaround       │
│  bump VERSION const   │ →  │  fill release MDX  │ →  │  nx build + verify dist │
│  scaffold CHANGELOG   │    │  git commit        │    │  pnpm publish (--confirm)│
│  scaffold release MDX │    │                    │    │  git tag (LOCAL)        │
└───────────────────────┘    └────────────────────┘    └─────────────────────────┘
```

No step is automated end-to-end on purpose. Either script can be run
in isolation: prepare modifies files only, publish reads the result
and ships it.

## Quick reference

```bash
# Step 1 — local prep (no commit, no publish, no push)
node scripts/prepare-release.mjs --package=@dashforge/tw --version=0.2.1-beta
# or by bump:
node scripts/prepare-release.mjs --package=@dashforge/ui  --bump=patch

# Step 2 — fill in CHANGELOG.md + (TW only) release MDX. The scaffold
#          markers ("TODO: fill in") are also checked by step 4.

# Step 3 — review + commit
git add -p
git commit -m "release: @dashforge/tw 0.2.1-beta"

# Step 4 — publish (dry-run by default; add --confirm to actually ship)
node scripts/publish-prepared.mjs --package=@dashforge/tw                            # dry-run
node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm                  # live
node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm --otp=123456     # live w/ npm 2FA (account has 2FA → required)

# Step 5 — push the tag if you want (NEVER auto-pushed)
git push origin "@dashforge/tw@0.2.1-beta"
```

## What `prepare-release.mjs` does

1. **`package.json` version** bumped to the requested value.
2. **`src/index.ts` `VERSION` const** bumped if the package exposes one
   (tw, tw-theme, tw-tokens, forms, ui-core today).
3. **Per-package `CHANGELOG.md`** — a new entry is prepended with the
   canonical Keep-a-Changelog sections (`Added` / `Changed` / `Fixed` /
   `Removed` / `Internal`) and a `TODO: fill in` placeholder so an
   unfinished CHANGELOG blocks publish.
4. **Top-level `CHANGELOG.md`** — a 1-paragraph pointer scaffold is
   prepended.
5. **TW packages only**: if a sibling `dashforge-docs-lab/` checkout
   exists, also creates `src/tw-docs/content/releases/<version>.mdx`
   and patches the sidebar manifest with the new entry. (MUI side is
   left alone — the MUI docs site has its own sidebar that we keep
   curated by hand.)

What it does **NOT** do: no git commit, no `pnpm install`, no rebuild,
no publish, no push. You review the diff and commit manually.

## What `publish-prepared.mjs` does

1. **Working tree** must be clean (`git status --porcelain` → empty).
2. **CHANGELOG check** — refuses to publish if the version's entry in
   `CHANGELOG.md` (or the TW release MDX) still contains the
   `TODO: fill in` marker.
3. **npm view** — refuses to publish if the version is already on npm.
4. **`pnpm nx build <pkg> --skip-nx-cache`** — fresh build, then asserts
   `dist/index.esm.js` and `dist/index.d.ts` exist.
5. **`.npmrc` workaround** — the repo `.npmrc` uses
   `_authToken=${NPM_TOKEN}` which pnpm v10 doesn't expand. The script
   temporarily renames the file out of the way so `pnpm publish` falls
   back to the user's global `~/.npmrc` (with the real token), then
   restores it in a `finally` block (even if publish errors).
6. **`pnpm publish --no-git-checks`** from the package directory.
7. **Local git tag** `@dashforge/<pkg>@<version>` (annotated, NOT pushed).

Dry-run mode (the default — no `--confirm` flag) prints every command
it WOULD run and validates the preconditions, but never invokes
`pnpm publish` or `git tag`.

## Adding a new release entry to the top-level CHANGELOG

`prepare-release.mjs` scaffolds a 1-paragraph pointer that links back
to the per-package CHANGELOG.md. For multi-package releases (e.g. a
coordinated bump of the bridge layer + a consumer package), prepare each
package separately, then collapse the two top-level pointer scaffolds
into a single combined entry by hand before committing.

## Handling the .npmrc auth token

The repo `.npmrc` is committed with `_authToken=${NPM_TOKEN}` so it's
safe in version control (no secret leaked). For CI to publish without
the workaround, set the `NPM_TOKEN` env var to a valid npm token before
running `publish-prepared.mjs --confirm`; pnpm + npm will expand it as
documented in
[the npmrc reference](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc#auth-related-configuration).

For local interactive publishes, the script's `.npmrc` rename
workaround means a working `~/.npmrc` (with `_authToken=…` resolved to
a real value) is sufficient.

## Why two scripts (not one)

The user reviewed and committed CHANGELOG content matters: an
auto-generated release log is bait for "rubber-stamped" PRs that miss
real breaking changes. The prep step puts the scaffold in front of the
human; the publish step refuses to ship if the scaffold wasn't filled
in.

## Recovering from a botched run

- **`prepare-release.mjs` exited mid-way**: changes are non-destructive
  text edits — re-run with the same args. The script is idempotent
  modulo the CHANGELOG prepend (which warns and skips if the version's
  entry is already present).
- **`publish-prepared.mjs --confirm` errored after `pnpm publish`**:
  the version is on npm. The local tag may or may not be created — run
  `git tag -l '@dashforge/*@<version>'` to check. Don't attempt to
  unpublish; bump to the next patch and prepare again.
- **`.npmrc` left moved out of the way**: the `finally` block should
  restore it; if not, manually `mv .npmrc.during-publish.bak .npmrc`.
