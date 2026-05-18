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
4. **Auth probe** — `pnpm whoami` from `/tmp` (so the repo `.npmrc`
   is never read). Fails fast with a clear message if `~/.npmrc` is
   unauthenticated, before any build / publish happens.
5. **Build (auto-skip if fresh)**:
    - `--skip-build` flag → never rebuild, assert dist exists.
    - `--force-build` flag → always rebuild.
    - Otherwise, auto-detect: skip the rebuild if `dist/index.esm.js`
      mtime is newer than the newest file under `src/`. Saves the
      ~30-second build during OTP retries (Sprint 1 pain point).
6. **`cd /tmp && pnpm publish <abs/path/to/pkg> --no-git-checks`** —
    publishes from outside the repo so the committed `.npmrc` (with
    `${NPM_TOKEN}` placeholder) is never read. Only `~/.npmrc` is
    consulted. No file rename, no try/finally, no `.bak` cleanup
    needed.
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

## Token type matters

This is the **single most important thing** to know about Dashforge
publishing, learned the hard way during the Sprint 1 `0.2.1-beta`
publish attempt (8 OTP codes burned, 20-minute rate-limit timeout).

npm offers two token shapes:

| Token type        | OTP required per publish? | Use case |
| ----------------- | :-: | -- |
| **Publish (classic)** | Yes, unless "Bypass 2FA" is checked | Default when you click "Generate new token" — DO NOT use as-is for our publish script. |
| **Automation**    | No (bypasses 2FA for write actions) | The right choice for CLI / CI / our `publish-prepared.mjs`. |

The Sprint 1 publish hell was caused by `~/.npmrc` holding a
**Publish token without bypass** — the script worked correctly, but
every OTP we passed was rate-limited / timed out because the round-trip
"read OTP → invoke script → script builds → script sends to npm"
took longer than npm's 30-second OTP window.

**Setup once, forget about OTP forever**:
  1. Go to <https://www.npmjs.com/settings/<your-user>/tokens>.
  2. Generate New Token → **Automation** (yes, even for manual local
     publishes — "automation" just means "no 2FA challenge", not
     "must run in CI").
  3. Paste it into `~/.npmrc` as:
     ```
     //registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxxxxxxxxxxxx
     ```
  4. `publish-prepared.mjs --confirm` now works in one shot, no `--otp`
     flag needed.

The repo `.npmrc` is committed with `_authToken=${NPM_TOKEN}` so it's
safe in version control (no secret leaked). `publish-prepared.mjs`
publishes from `/tmp` so this committed `.npmrc` is never read — only
`~/.npmrc` is consulted.

If you DON'T want to use an automation token (e.g. you want 2FA on
every publish), pass `--otp=<code>` and have a stopwatch ready —
the script auto-skips the build phase when dist is fresh, which
should be enough to stay inside the OTP window.

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
