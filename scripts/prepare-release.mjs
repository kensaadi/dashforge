#!/usr/bin/env node
/**
 * prepare-release.mjs — local release preparation for any
 * @dashforge/* package.
 *
 * What it does (all LOCAL — no commit, no publish, no push):
 *
 *   1. Bumps `package.json` version to the requested value.
 *   2. Updates `export const VERSION = '…'` in `src/index.ts` if the
 *      package exposes one (currently: tw, tw-theme, tw-tokens, forms,
 *      ui-core).
 *   3. Prepends a Keep-a-Changelog scaffold entry to the package's
 *      `CHANGELOG.md`. Sections come pre-populated with the canonical
 *      headings (`### Added` / `### Changed` / `### Fixed` / `### Removed`
 *      / `### Internal`) and a "TODO: fill in" placeholder so a `grep`
 *      for the marker catches an unfinished release before publish.
 *   4. Prepends a pointer entry to the top-level `CHANGELOG.md`.
 *   5. **For TW packages only**: if the sibling `dashforge-docs-lab`
 *      checkout exists, creates `src/tw-docs/content/releases/<version>.mdx`
 *      (scaffold) and adds the corresponding sidebar entry. The MDX is
 *      also a "TODO: fill in" stub — the human writes the prose.
 *
 * What it does NOT do:
 *
 *   - Doesn't `git commit` anything (user reviews diff + commits).
 *   - Doesn't `pnpm publish` (use `publish-prepared.mjs` for that, with
 *     explicit `--confirm`).
 *   - Doesn't `git tag` or `git push`.
 *   - Doesn't run `pnpm install` or rebuild any package.
 *
 * Usage:
 *
 *   node scripts/prepare-release.mjs --package=@dashforge/tw --version=0.2.1-beta
 *   node scripts/prepare-release.mjs --package=@dashforge/ui  --bump=patch
 *
 * Either `--version=<x.y.z>` (explicit) or `--bump=major|minor|patch`
 * is required. The chosen version must be strictly greater than what's
 * currently in package.json.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  resolvePackage,
  parseVersion,
  bumpVersion,
  assertGreater,
  today,
  parseArgs,
  c,
  die,
} from './_release-utils.mjs';

const args = parseArgs(process.argv.slice(2));

if (!args.package) die('Missing --package=@dashforge/<name>');
if (!args.version && !args.bump) {
  die('Missing --version=<x.y.z> or --bump=major|minor|patch');
}

const pkg = resolvePackage(args.package);
const currentVersion = pkg.pkg.version;
const nextVersion = args.version ?? bumpVersion(currentVersion, args.bump);
assertGreater(currentVersion, nextVersion);

console.log(c.bold(`\nPreparing release for ${c.cyan(pkg.name)}`));
console.log(`  current : ${c.dim(currentVersion)}`);
console.log(`  next    : ${c.green(nextVersion)}`);
console.log(`  date    : ${today()}\n`);

const changes = [];

// ───── 1. Bump package.json version ─────
{
  const next = pkg.pkg;
  next.version = nextVersion;
  writeFileSync(pkg.pkgPath, JSON.stringify(next, null, 2) + '\n', 'utf-8');
  changes.push(`✓ ${path.relative(REPO_ROOT, pkg.pkgPath)} — version → ${nextVersion}`);
}

// ───── 2. Bump VERSION const in src/index.ts (if present) ─────
if (existsSync(pkg.indexTsPath)) {
  const content = readFileSync(pkg.indexTsPath, 'utf-8');
  const re = /export const VERSION = '([^']+)'/;
  const m = re.exec(content);
  if (m) {
    if (m[1] === currentVersion) {
      const next = content.replace(re, `export const VERSION = '${nextVersion}'`);
      writeFileSync(pkg.indexTsPath, next, 'utf-8');
      changes.push(`✓ ${path.relative(REPO_ROOT, pkg.indexTsPath)} — VERSION const → ${nextVersion}`);
    } else {
      changes.push(
        `${c.yellow('!')} ${path.relative(REPO_ROOT, pkg.indexTsPath)} — VERSION (${m[1]}) ` +
        `differs from package.json (${currentVersion}); LEFT UNCHANGED — fix by hand.`
      );
    }
  }
}

// ───── 3. Scaffold per-package CHANGELOG.md entry ─────
{
  const existing = existsSync(pkg.changelogPath)
    ? readFileSync(pkg.changelogPath, 'utf-8')
    : `# Changelog — ${pkg.name}\n\nAll notable changes to \`${pkg.name}\` are documented here.\n\nThe format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\nThis project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n`;
  const scaffoldHeader = `## [${nextVersion}] — ${today()}`;
  if (existing.includes(scaffoldHeader)) {
    changes.push(
      `${c.yellow('!')} ${path.relative(REPO_ROOT, pkg.changelogPath)} — entry for ${nextVersion} already present; skipped.`
    );
  } else {
    const scaffold = [
      scaffoldHeader,
      '',
      '> TODO: fill in the prose summary for this release before publishing.',
      '> Remove this blockquote line once the entry is final.',
      '',
      '### Added',
      '',
      '-',
      '',
      '### Changed',
      '',
      '-',
      '',
      '### Fixed',
      '',
      '-',
      '',
      '### Removed',
      '',
      '-',
      '',
      '### Internal',
      '',
      '-',
      '',
      '',
    ].join('\n');
    // Splice the scaffold right above the first existing `## [` heading,
    // OR append to the end if this is a fresh CHANGELOG.
    const firstEntryIdx = existing.search(/^## \[/m);
    const next = firstEntryIdx === -1
      ? existing + scaffold
      : existing.slice(0, firstEntryIdx) + scaffold + existing.slice(firstEntryIdx);
    writeFileSync(pkg.changelogPath, next, 'utf-8');
    changes.push(`✓ ${path.relative(REPO_ROOT, pkg.changelogPath)} — scaffold added for ${nextVersion}`);
  }
}

// ───── 4. Top-level CHANGELOG pointer ─────
{
  const topPath = path.join(REPO_ROOT, 'CHANGELOG.md');
  if (existsSync(topPath)) {
    const top = readFileSync(topPath, 'utf-8');
    const tag = `[${pkg.shortName} ${nextVersion}]`;
    const header = `## ${tag} — ${today()}`;
    if (top.includes(header)) {
      changes.push(`${c.yellow('!')} ${path.relative(REPO_ROOT, topPath)} — pointer for ${tag} already present; skipped.`);
    } else {
      const pointer = [
        header,
        '',
        `> TODO: 1-paragraph summary of this release for the top-level changelog.`,
        `> Detailed per-package entry: see \`libs/dashforge/${pkg.shortName}/CHANGELOG.md\`.`,
        '',
        `Affected package (bumped):`,
        '',
        `| Package | Notes |`,
        `| --- | --- |`,
        `| \`${pkg.name}\` | (one-line summary) |`,
        '',
        '',
      ].join('\n');
      const firstEntryIdx = top.search(/^## \[/m);
      const next = firstEntryIdx === -1
        ? top + pointer
        : top.slice(0, firstEntryIdx) + pointer + top.slice(firstEntryIdx);
      writeFileSync(topPath, next, 'utf-8');
      changes.push(`✓ ${path.relative(REPO_ROOT, topPath)} — pointer added for ${tag}`);
    }
  }
}

// ───── 5. TW-only: docs-lab release MDX + sidebar entry ─────
if (pkg.ecosystem === 'tw') {
  const docsLab = path.resolve(REPO_ROOT, '..', 'dashforge-docs-lab');
  if (existsSync(docsLab)) {
    const releaseMdx = path.join(
      docsLab, 'src', 'tw-docs', 'content', 'releases', `${nextVersion}.mdx`
    );
    if (existsSync(releaseMdx)) {
      changes.push(`${c.yellow('!')} ${releaseMdx} — already present; skipped.`);
    } else {
      mkdirSync(path.dirname(releaseMdx), { recursive: true });
      const mdx = [
        '---',
        `title: ${nextVersion}`,
        `description: ${pkg.name} ${nextVersion} — TODO short summary.`,
        '---',
        '',
        `# ${pkg.name} ${nextVersion}`,
        '',
        '> TODO: fill in the prose. Mirror the structure of the previous release MDX (Added / Changed / Fixed sections, migration notes, compatibility matrix).',
        '',
        `Published: ${today()}.`,
        '',
        '## Added',
        '',
        '-',
        '',
        '## Changed',
        '',
        '-',
        '',
        '## Fixed',
        '',
        '-',
        '',
        '## Migration',
        '',
        'No breaking change — drop-in upgrade.',
        '',
      ].join('\n');
      writeFileSync(releaseMdx, mdx, 'utf-8');
      changes.push(`✓ ${path.relative(REPO_ROOT, releaseMdx)} — release MDX scaffold added`);

      // Sidebar entry — patch the manifest if we recognise the shape.
      const sidebar = path.join(docsLab, 'src', 'tw-docs', 'sidebar.model.ts');
      if (existsSync(sidebar)) {
        const sb = readFileSync(sidebar, 'utf-8');
        const newEntry = `      { type: 'link', label: '${nextVersion}',  path: '/tw/docs/releases/${nextVersion}' },`;
        if (sb.includes(`path: '/tw/docs/releases/${nextVersion}'`)) {
          changes.push(`${c.yellow('!')} sidebar.model.ts — entry for ${nextVersion} already present; skipped.`);
        } else {
          // Insert immediately after the Overview line in the Releases group.
          const marker = `{ type: 'link', label: 'Overview',    path: '/tw/docs/releases/index' },`;
          if (sb.includes(marker)) {
            const next = sb.replace(marker, `${marker}\n${newEntry}`);
            writeFileSync(sidebar, next, 'utf-8');
            changes.push(`✓ sidebar.model.ts — Releases entry for ${nextVersion} added`);
          } else {
            changes.push(
              `${c.yellow('!')} sidebar.model.ts — could not locate Releases group marker; ` +
              `add the entry by hand: ${newEntry.trim()}`
            );
          }
        }
      }
    }
  } else {
    changes.push(c.dim(`(docs-lab not present at ${docsLab} — skipped MDX scaffold)`));
  }
}

// ───── Report ─────
console.log(c.bold('Changes made:\n'));
for (const ch of changes) console.log(`  ${ch}`);

console.log(`\n${c.bold('Next steps')} (all manual — nothing was committed):`);
console.log(`  1. Fill in the CHANGELOG entries (search for ${c.yellow('"TODO: fill in"')} markers).`);
if (pkg.ecosystem === 'tw') {
  console.log(`  2. (TW) Fill in the docs-lab release MDX.`);
}
console.log(`  ${pkg.ecosystem === 'tw' ? '3' : '2'}. Verify build: ${c.cyan(`pnpm nx build ${pkg.name} --skip-nx-cache`)}`);
console.log(`  ${pkg.ecosystem === 'tw' ? '4' : '3'}. Commit locally (review diff first): ${c.cyan(`git add -p && git commit -m "release: ${pkg.name} ${nextVersion}"`)}`);
console.log(`  ${pkg.ecosystem === 'tw' ? '5' : '4'}. When ready to publish: ${c.cyan(`node scripts/publish-prepared.mjs --package=${pkg.name} --confirm`)}`);
console.log();
