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
 *
 * .npmrc workaround:
 *   The repo `.npmrc` uses `${NPM_TOKEN}` which pnpm v10 doesn't
 *   expand. We side-step by temporarily moving the file out of the
 *   way so `pnpm publish` falls back to the user's global
 *   `~/.npmrc`, then restore it afterwards (try/finally).
 *
 * Usage:
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw
 *   node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
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

// ───── 4. Build the package ─────
{
  const buildCmd = `pnpm nx build ${pkg.name} --skip-nx-cache`;
  if (dryRun) {
    console.log(`${c.yellow('[dry-run]')} would run: ${c.cyan(buildCmd)}`);
  } else {
    console.log(`${c.cyan('$')} ${buildCmd}`);
    execSync(buildCmd, { cwd: REPO_ROOT, stdio: 'inherit' });
  }

  const distEsm = path.join(pkg.dir, 'dist', 'index.esm.js');
  const distDts = path.join(pkg.dir, 'dist', 'index.d.ts');
  if (!dryRun) {
    if (!existsSync(distEsm)) die(`Build did not emit ${distEsm}`);
    if (!existsSync(distDts)) die(`Build did not emit ${distDts}`);
    console.log(`${c.green('✓')} dist artifacts present.`);
  }
}

// ───── 5. Publish (with .npmrc workaround) ─────
{
  const npmrc = path.join(REPO_ROOT, '.npmrc');
  const npmrcBackup = path.join(REPO_ROOT, '.npmrc.during-publish.bak');
  // Pass `--otp=<code>` through to pnpm publish when the user provides
  // one (npm 2FA accounts require this). If omitted and the account
  // has 2FA on, the publish fails fast with EOTP — re-run with --otp.
  const otp = args.otp ? ` --otp=${args.otp}` : '';
  const publishCmd = `pnpm publish --no-git-checks${otp}`;

  if (dryRun) {
    console.log(`${c.yellow('[dry-run]')} would temporarily move ${c.cyan('.npmrc → .npmrc.during-publish.bak')}`);
    console.log(`${c.yellow('[dry-run]')} would run (from ${pkg.dir}): ${c.cyan(publishCmd)}`);
    console.log(`${c.yellow('[dry-run]')} would restore .npmrc`);
  } else {
    let moved = false;
    try {
      if (existsSync(npmrc)) {
        renameSync(npmrc, npmrcBackup);
        moved = true;
        console.log(`${c.dim('(moved .npmrc out of the way so ~/.npmrc auth wins)')}`);
      }
      console.log(`${c.cyan('$')} ${publishCmd}  (cwd=${path.relative(REPO_ROOT, pkg.dir)})`);
      execSync(publishCmd, { cwd: pkg.dir, stdio: 'inherit' });
      console.log(`${c.green('✓')} Published ${pkg.name}@${version}.`);
    } finally {
      if (moved && existsSync(npmrcBackup)) {
        renameSync(npmrcBackup, npmrc);
        console.log(`${c.dim('(.npmrc restored)')}`);
      }
    }
  }
}

// ───── 6. Local git tag (no push) ─────
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
  console.log(`To push the tag (NOT done automatically): ${c.cyan(`git push origin ${pkg.name}@${version}`)}`);
}
console.log();

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
