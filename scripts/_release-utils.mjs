/**
 * Shared helpers for the release prep / publish scripts.
 *
 * Kept in plain `.mjs` (no TypeScript build step) so the scripts are
 * runnable directly via `node scripts/prepare-release.mjs …`.
 *
 * Conventions assumed across every publishable @dashforge/* package:
 *  - lives at `libs/dashforge/<short-name>/`
 *  - has `package.json` with `name: "@dashforge/<short-name>"` and
 *    `version: "x.y.z[-tag]"`
 *  - optionally has `src/index.ts` with `export const VERSION = '…'`
 *  - has its own `CHANGELOG.md` next to package.json
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/** Absolute path to the monorepo root (= the dir containing scripts/). */
export const REPO_ROOT = path.resolve(
  new URL('..', import.meta.url).pathname
);

/** Ecosystem grouping — drives prose tags + which sandboxes need updating. */
export const ECOSYSTEM_OF = {
  '@dashforge/tw':         'tw',
  '@dashforge/tw-theme':   'tw',
  '@dashforge/tw-tokens':  'tw',
  '@dashforge/ui':         'mui',
  '@dashforge/theme-mui':  'mui',
  '@dashforge/theme-core': 'mui',
  '@dashforge/tokens':     'mui',
  '@dashforge/forms':      'bridge',
  '@dashforge/rbac':       'bridge',
  '@dashforge/ui-core':    'bridge',
};

/** Every publishable @dashforge/* package known to the release tooling. */
export const ALL_PACKAGES = Object.keys(ECOSYSTEM_OF);

/**
 * Resolve a package name to its filesystem location + parsed manifest.
 * Throws if the package isn't a known publishable @dashforge/* one.
 */
export function resolvePackage(name) {
  if (!ALL_PACKAGES.includes(name)) {
    throw new Error(
      `Unknown package "${name}". Known: ${ALL_PACKAGES.join(', ')}`
    );
  }
  const shortName = name.replace(/^@dashforge\//, '');
  const dir = path.join(REPO_ROOT, 'libs', 'dashforge', shortName);
  const pkgPath = path.join(dir, 'package.json');
  if (!existsSync(pkgPath)) {
    throw new Error(`Expected package.json at ${pkgPath}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  if (pkg.private) {
    throw new Error(`Package "${name}" is marked private — not publishable.`);
  }
  return {
    name,
    shortName,
    dir,
    pkgPath,
    pkg,
    ecosystem: ECOSYSTEM_OF[name],
    changelogPath: path.join(dir, 'CHANGELOG.md'),
    indexTsPath: path.join(dir, 'src', 'index.ts'),
  };
}

/**
 * Parse semver-ish version strings used by Dashforge packages.
 * Accepts both clean ("0.2.0") and pre-release ("0.2.0-beta") forms.
 * Returns { major, minor, patch, preRelease }.
 */
export function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(v);
  if (!m) throw new Error(`Unparseable version "${v}"`);
  return {
    major: +m[1],
    minor: +m[2],
    patch: +m[3],
    preRelease: m[4] ?? null,
  };
}

/**
 * Compute the next version given a current one and a bump strategy.
 * Pre-release tag is preserved (so 0.2.0-beta + patch → 0.2.1-beta).
 * `bump` is one of 'major' | 'minor' | 'patch'.
 */
export function bumpVersion(current, bump) {
  const v = parseVersion(current);
  let { major, minor, patch } = v;
  if (bump === 'major') { major += 1; minor = 0; patch = 0; }
  else if (bump === 'minor') { minor += 1; patch = 0; }
  else if (bump === 'patch') { patch += 1; }
  else throw new Error(`Unknown bump "${bump}" (use major|minor|patch).`);
  return v.preRelease
    ? `${major}.${minor}.${patch}-${v.preRelease}`
    : `${major}.${minor}.${patch}`;
}

/**
 * Validate that `next` is strictly greater than `current` under semver.
 * Pre-release tags are compared lexically as a coarse safety net (the
 * common case is the SAME pre-release tag carried forward).
 */
export function assertGreater(current, next) {
  const a = parseVersion(current);
  const b = parseVersion(next);
  const cmpNum = a.major !== b.major
    ? b.major - a.major
    : a.minor !== b.minor
      ? b.minor - a.minor
      : b.patch - a.patch;
  if (cmpNum > 0) return;
  if (cmpNum < 0) throw new Error(`New version ${next} < current ${current}`);
  // numeric tie → compare pre-release tags
  const at = a.preRelease ?? '';
  const bt = b.preRelease ?? '';
  if (at === bt) throw new Error(`New version ${next} == current ${current}`);
  // No pre-release ranks higher than any pre-release ("1.0.0" > "1.0.0-rc")
  if (at && !bt) return; // current=rc, next=stable → OK
  if (!at && bt) throw new Error(`Pre-release ${next} < stable ${current}`);
  if (bt < at) throw new Error(`Pre-release ${next} < ${current}`);
}

/**
 * Today in YYYY-MM-DD (UTC). Used for CHANGELOG entry dates.
 */
export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Minimal CLI flag parser. Recognises `--key=value` and `--flag`
 * (boolean). Anything else is collected as a positional. No fancy
 * commander-style behaviour — keeps the scripts dependency-free.
 */
export function parseArgs(argv) {
  const out = { _: [] };
  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const eq = arg.indexOf('=');
      if (eq === -1) out[arg.slice(2)] = true;
      else out[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      out._.push(arg);
    }
  }
  return out;
}

/**
 * In-memory text replace + write helper with idempotency check.
 * Returns `true` if the file was changed.
 */
export function replaceInFile(filePath, search, replace) {
  const content = readFileSync(filePath, 'utf-8');
  const next = typeof search === 'string'
    ? content.replace(search, replace)
    : content.replace(search, replace);
  if (next === content) return false;
  writeFileSync(filePath, next, 'utf-8');
  return true;
}

/** ANSI helpers — minimal, no chalk dep. */
export const c = {
  bold:   (s) => `\x1b[1m${s}\x1b[22m`,
  dim:    (s) => `\x1b[2m${s}\x1b[22m`,
  green:  (s) => `\x1b[32m${s}\x1b[39m`,
  yellow: (s) => `\x1b[33m${s}\x1b[39m`,
  red:    (s) => `\x1b[31m${s}\x1b[39m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[39m`,
};

/** Pretty-print a fatal error and exit non-zero. */
export function die(msg) {
  console.error(`${c.red('✗')} ${msg}`);
  process.exit(1);
}
