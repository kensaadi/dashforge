#!/usr/bin/env node
/**
 * publish-prepared.mjs — publish a previously-prepared @dashforge/*
 * release to npm + create a local git tag.
 *
 * Expected workflow:
 *   1. `node scripts/prepare-release.mjs --package=… --version=…` (LOCAL)
 *   2. Fill in CHANGELOG / MDX TODOs.
 *   3. `git commit` the prep changes (you, manually).
 *   4. `node scripts/publish-prepared.mjs --package=… --confirm` (this script)
 *   5. `git push --tags` (you, manually — never auto-pushed).
 *
 * Without `--confirm` the script runs in **dry-run** mode: it prints
 * every command it WOULD run, validates state, but never invokes
 * `pnpm publish` and never creates a tag.
 *
 * Safety guards:
 *   - Validates the working tree is clean (no uncommitted changes that
 *     would leak into the build).
 *   - Validates CHANGELOG.md and the optional release MDX do NOT
 *     contain the `TODO: fill in` placeholder for the current version.
 *   - Validates the dist exists after the build step.
 *   - Aborts if the version is already published on npm
 *     (`npm view <pkg>@<version> version`).
 *   - Validates the user is authenticated against npm via global
 *     `~/.npmrc` (`pnpm whoami` from `/tmp` — bypasses the repo's
 *     own `.npmrc` that uses `${NPM_TOKEN}` placeholders).
 *
 * Publishing from `/tmp` (Sprint 2 P5 simplification):
 *   The previous implementation moved the repo `.npmrc` aside before
 *   calling `pnpm publish`, then restored it in `finally`. That was a
 *   workaround for pnpm v10 not expanding `${NPM_TOKEN}` in the repo's
 *   committed `.npmrc`. Sprint 1 publish hell taught us a simpler way:
 *   `cd /tmp && pnpm publish /abs/path/to/package` — running pnpm from
 *   OUTSIDE the repo means it never reads the repo's `.npmrc` in the
 *   first place. Only `~/.npmrc` (with the real bypass-2FA automation
 *   token) is consulted. Cleaner, fewer moving parts, no restore
 *   needed if the publish crashes mid-flight.
 *
 * Skip-build behaviour:
 *   - `--skip-build` (manual override) — never rebuilds; asserts dist
 *     exists.
 *   - `--force-build` (manual override) — always rebuilds, even if
 *     dist looks fresh.
 *   - Otherwise: auto-detect. If `dist/index.esm.js` mtime is newer
 *     than the newest file in `src/`, skip the build (saves the
 *     30-second build window during OTP retries — Sprint 1 pain
 *     point).
 *
 * Usage:
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm --otp=123456
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm --force-build
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import {
  REPO_ROOT,
  resolvePackage,
  parseArgs,
  c,
  die,
} from './_release-utils.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.package) die('Missing --package=@dashforge/<name>');
const dryRun = !args.confirm;

const pkg = resolvePackage(args.package);
const version = pkg.pkg.version;

console.log(c.bold(`\nPublish ${dryRun ? c.yellow('[DRY-RUN]') : c.green('[LIVE]')} for ${c.cyan(pkg.name)}@${c.cyan(version)}\n`));

// ───── 1. Working tree must be clean ─────
{
  const status = execSync('git status --porcelain', { cwd: REPO_ROOT, encoding: 'utf-8' });
  if (status.trim()) {
    console.error(c.red('✗') + ' Working tree is not clean. Commit or stash first:');
    console.error(status);
    process.exit(1);
  }
  console.log(`${c.green('✓')} Working tree clean.`);
}

// ───── 2. CHANGELOG / MDX TODO check ─────
{
  const checkFile = (file, label) => {
    if (!existsSync(file)) return;
    const lines = readFileSync(file, 'utf-8').split('\n');
    // Find the section heading for THIS version, then scan until the
    // next ## heading and look for the "TODO: fill in" placeholder.
    const startRe = file.endsWith('.mdx')
      ? new RegExp(`^# ${escapeRe(pkg.name)} ${escapeRe(version)}\\b`)
      : new RegExp(`^## \\[${escapeRe(version)}\\]`);
    let in_section = false;
    for (const line of lines) {
      if (startRe.test(line)) { in_section = true; continue; }
      if (in_section && /^##? \[?/.test(line)) break;
      if (in_section && line.includes('TODO: fill in')) {
        die(`${label} still contains a "TODO: fill in" marker for ${version}. ` +
            `Edit ${path.relative(REPO_ROOT, file)} before publishing.`);
      }
    }
  };
  checkFile(pkg.changelogPath, 'CHANGELOG.md');
  // top-level CHANGELOG uses a `## [pkg vX.Y.Z] — date` heading
  const topPath = path.join(REPO_ROOT, 'CHANGELOG.md');
  if (existsSync(topPath)) {
    const topContent = readFileSync(topPath, 'utf-8');
    const topRe = new RegExp(`## \\[${escapeRe(pkg.shortName)} ${escapeRe(version)}\\][\\s\\S]*?(?=\\n## \\[|$)`);
    const m = topRe.exec(topContent);
    if (m && m[0].includes('TODO:')) {
      die(`Top-level CHANGELOG.md still contains a TODO for ${pkg.name} ${version}. Fill it in first.`);
    }
  }
  console.log(`${c.green('✓')} No outstanding "TODO: fill in" markers for ${version}.`);
}

// ───── 3. Not already published on npm ─────
{
  let publishedVersions = '';
  try {
    publishedVersions = execSync(`npm view ${pkg.name} versions --json`, { encoding: 'utf-8' });
  } catch {
    // package likely never published before — fine.
    publishedVersions = '[]';
  }
  const versions = JSON.parse(publishedVersions);
  if (Array.isArray(versions) && versions.includes(version)) {
    die(`${pkg.name}@${version} is already published on npm. Bump the version first.`);
  }
  console.log(`${c.green('✓')} ${pkg.name}@${version} not yet on npm.`);
}

// ───── 4. Auth probe (npm whoami via ~/.npmrc) ─────
//
// Run `pnpm whoami` from /tmp so pnpm doesn't read the repo's
// committed `.npmrc` (which uses `${NPM_TOKEN}` placeholders that
// pnpm v10 won't expand). This validates that the user has a working
// global auth setup BEFORE we try to publish — better to fail fast
// here with a clear message than to discover it mid-`pnpm publish`.
{
  if (dryRun) {
    console.log(`${c.yellow('[dry-run]')} would probe: ${c.cyan('cd /tmp && pnpm whoami')}`);
  } else {
    let whoami;
    try {
      whoami = execSync('pnpm whoami', { cwd: os.tmpdir(), encoding: 'utf-8' }).trim();
    } catch (e) {
      die(
        `Auth probe failed. Your ~/.npmrc isn't authenticated to npm.\n` +
        `  Fix: run ${c.cyan('npm login')} (interactive) OR put an automation\n` +
        `       token in ~/.npmrc — see RELEASING.md for details.`
      );
    }
    console.log(`${c.green('✓')} Authenticated to npm as ${c.cyan(whoami)} (via ~/.npmrc).`);
  }
}

// ───── 5. Build the package (auto-skip if fresh) ─────
//
// Build decision tree:
//   --skip-build flag        → never build, assert dist exists
//   --force-build flag       → always build
//   (auto, default)          → build only if dist mtime ≤ newest src mtime
//
// The auto-skip exists because of the Sprint 1 OTP-window pain:
// a 30-second rebuild between "user reads OTP" and "pnpm publish
// sends it to npm" routinely caused EOTP. If the user has already
// run `pnpm nx build` to validate in dev, the dist is fresh and a
// rebuild would just waste the OTP window for nothing.
{
  // Resolve the dist entry from the package's own `main` field.
  // Rollup-built packages (`@dashforge/tw-theme`, `@dashforge/tw`)
  // emit `dist/index.esm.js`; tsc-built packages
  // (`@dashforge/tw-tokens`) emit `dist/index.js`. Hardcoding
  // `index.esm.js` wrongly fails the freshness / emit check for the
  // tsc-built ones.
  const distEntry = path.resolve(pkg.dir, pkg.pkg.main ?? './dist/index.esm.js');
  const distDts = path.join(pkg.dir, 'dist', 'index.d.ts');

  const distExists = existsSync(distEntry) && existsSync(distDts);
  let shouldBuild;
  let reason;

  if (args['skip-build']) {
    if (!distExists) die(`--skip-build given but ${distEntry} or ${distDts} missing.`);
    shouldBuild = false;
    reason = '--skip-build flag set';
  } else if (args['force-build']) {
    shouldBuild = true;
    reason = '--force-build flag set';
  } else if (!distExists) {
    shouldBuild = true;
    reason = 'no dist found';
  } else {
    const distMtime = statSync(distEntry).mtimeMs;
    const srcDir = path.join(pkg.dir, 'src');
    const newestSrcMtime = existsSync(srcDir) ? findNewestMtime(srcDir) : 0;
    if (newestSrcMtime > distMtime) {
      shouldBuild = true;
      reason = `src/ has newer files than dist/ (dist=${new Date(distMtime).toISOString().slice(0,19)}, src=${new Date(newestSrcMtime).toISOString().slice(0,19)})`;
    } else {
      shouldBuild = false;
      reason = `dist is fresh (mtime=${new Date(distMtime).toISOString().slice(0,19)}, newer than src)`;
    }
  }

  if (!shouldBuild) {
    console.log(`${c.green('✓')} Skipping build — ${reason}.`);
  } else {
    const buildCmd = `pnpm nx build ${pkg.name} --skip-nx-cache`;
    if (dryRun) {
      console.log(`${c.yellow('[dry-run]')} would run: ${c.cyan(buildCmd)} (${reason})`);
    } else {
      console.log(`${c.cyan('$')} ${buildCmd}  (${reason})`);
      execSync(buildCmd, { cwd: REPO_ROOT, stdio: 'inherit' });
      if (!existsSync(distEntry)) die(`Build did not emit ${distEntry}`);
      if (!existsSync(distDts)) die(`Build did not emit ${distDts}`);
      console.log(`${c.green('✓')} dist artifacts present.`);
    }
  }
}

// ───── 6. Publish (from /tmp, no .npmrc swap) ─────
//
// `cd /tmp && pnpm publish <abs-path>` works because:
//   • pnpm walks UP from the cwd looking for an `.npmrc`. From /tmp,
//     it never crosses our repo, so the committed `.npmrc` with
//     `${NPM_TOKEN}` placeholder is never read — pnpm uses ONLY
//     `~/.npmrc` (which has the real automation token).
//   • Passing the absolute package path as a positional arg tells
//     pnpm what to publish. Identical effect to `cd <pkg> && pnpm publish`
//     except the cwd doesn't taint .npmrc resolution.
//   • No need to rename / restore the repo `.npmrc`. The publish is
//     atomic from our side; if it crashes, nothing is left in an
//     inconsistent state.
{
  // Pass `--otp=<code>` through when the user provides one. With a
  // bypass-2FA automation token in ~/.npmrc, --otp is NOT needed at
  // all — see RELEASING.md "Token type matters" section.
  const otp = args.otp ? ` --otp=${args.otp}` : '';
  const publishCmd = `pnpm publish ${pkg.dir} --no-git-checks${otp}`;
  const cwd = os.tmpdir();

  if (dryRun) {
    console.log(`${c.yellow('[dry-run]')} would run (cwd=${cwd}): ${c.cyan(publishCmd)}`);
  } else {
    console.log(`${c.cyan('$')} ${publishCmd}  (cwd=${cwd})`);
    execSync(publishCmd, { cwd, stdio: 'inherit' });
    console.log(`${c.green('✓')} Published ${pkg.name}@${version}.`);
  }
}

// ───── 7. Local git tag (no push) ─────
{
  const tag = `${pkg.name}@${version}`;
  const tagCmd = `git tag -a "${tag}" -m "Release ${pkg.name} ${version}"`;
  if (dryRun) {
    console.log(`${c.yellow('[dry-run]')} would run: ${c.cyan(tagCmd)}`);
  } else {
    // Check if tag already exists locally
    try {
      execSync(`git rev-parse "${tag}"`, { cwd: REPO_ROOT, stdio: 'ignore' });
      console.log(`${c.yellow('!')} Tag ${tag} already exists locally; skipped.`);
    } catch {
      execSync(tagCmd, { cwd: REPO_ROOT, stdio: 'inherit' });
      console.log(`${c.green('✓')} Created local tag ${tag}.`);
    }
  }
}

console.log(`\n${c.bold('Done.')} ${dryRun ? c.yellow('Dry run — nothing changed.') : ''}`);
if (!dryRun) {
  const tag = `${pkg.name}@${version}`;
  // Path to per-package CHANGELOG (relative to repo root) so the
  // gh-release template can point at the section we just published.
  const pkgRel = path.relative(REPO_ROOT, pkg.dir);
  const changelogPath = `${pkgRel}/CHANGELOG.md`;

  console.log();
  console.log(c.bold('Next steps (manual):'));
  console.log();
  console.log(`  1. Push the git tag:`);
  console.log(`     ${c.cyan(`git push origin "${tag}"`)}`);
  console.log();
  console.log(`  2. Create a GitHub Release for the tag — descriptive title + pre-release flag.`);
  console.log(`     Pattern: ${c.cyan(`<pkg> <version> — <short subtitle>`)}`);
  console.log(`     Example: ${c.cyan(`${pkg.name} ${version} — Sprint N bundle (X fixes + Y feature)`)}`);
  console.log();
  console.log(`     Template (extract the section from ${c.cyan(changelogPath)} into a tmp file,`);
  console.log(`     then create the release with --prerelease):`);
  console.log();
  console.log(c.cyan(`     # Extract the [${version}] section from ${changelogPath} into /tmp/release-notes.md`));
  console.log(c.cyan(`     awk '/^## \\[${version}\\]/,/^## \\[/{ if (/^## \\[/ && !/^## \\[${version}\\]/) exit; print }' \\`));
  console.log(c.cyan(`       ${changelogPath} > /tmp/release-notes.md`));
  console.log();
  console.log(c.cyan(`     # Edit the title subtitle below, then run:`));
  console.log(c.cyan(`     gh release create "${tag}" \\`));
  console.log(c.cyan(`       --repo kensaadi/dashforge \\`));
  console.log(c.cyan(`       --prerelease \\`));
  console.log(c.cyan(`       --title "${pkg.name} ${version} — <FILL IN SHORT SUBTITLE>" \\`));
  console.log(c.cyan(`       --notes-file /tmp/release-notes.md`));
  console.log();
  console.log(c.dim(`     (Strict precedent: every per-package release on GitHub uses the descriptive`));
  console.log(c.dim(`      title pattern and is marked Pre-release until 1.0.0. The repo-root`));
  console.log(c.dim(`      RELEASING.md documents the same flow.)`));
}
console.log();

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Walk a directory tree and return the newest `mtimeMs` across all
 * regular files. Ignores `node_modules/` and `dist/`.
 *
 * Used by the auto-skip-build heuristic: if every src file is older
 * than the current dist, the dist is up-to-date and we can skip the
 * 30-second rebuild.
 */
function findNewestMtime(dir) {
  let newest = 0;
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const m = statSync(full).mtimeMs;
        if (m > newest) newest = m;
      }
    }
  };
  walk(dir);
  return newest;
}
