#!/usr/bin/env node
/**
 * verify-tarballs.mjs — packs every @dashforge/* package and checks the
 * TARBALL, not the working tree.
 *
 * Why this exists: 2.0.0 was green on lint, typecheck, test and build
 * across every project, and shipped `@dashforge/ui-core` and
 * `@dashforge/rbac` with a declaration entry point that re-exported from
 * `./src/*` paths the tarball did not contain. Inside the monorepo
 * nothing breaks, because dependents compile against project references
 * that read from `dist/out-tsc/`, where the declarations always exist.
 * Only an installing consumer sees it.
 *
 * The checks, per package:
 *
 *   1. `types` (or `typings`, or `exports['.'].types`) is declared and
 *      the file exists inside the tarball.
 *   2. Every relative specifier that entry re-exports from resolves to a
 *      real `.d.ts`. A `./x.js` specifier maps to `x.d.ts`, which is how
 *      modern moduleResolution spells it.
 *   3. A throwaway consumer imports the package and runs `tsc`.
 *   4. No test files rode along.
 *   5. The exported `VERSION` constant, when a package has one, agrees
 *      with package.json.
 *
 * Check 3 runs with **skipLibCheck: false**, and that is not a detail.
 * With the default `true` TypeScript skips declaration files entirely:
 * the broken 2.0.0 compiles clean and every symbol silently degrades to
 * `any`. A consumer probe on default settings would have certified the
 * exact defect it exists to catch.
 *
 * Usage:
 *   node scripts/verify-tarballs.mjs              # every package
 *   node scripts/verify-tarballs.mjs ui-core tw   # a subset
 *
 * Exit code 1 on the first failing package, so CI stops.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const REPO_ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const LIBS = join(REPO_ROOT, 'libs', 'dashforge');

const ALL = [
  'ui-core', 'rbac', 'forms', 'calendar-core',
  'tw', 'tw-theme', 'tw-tokens',
  'ui', 'theme-mui', 'theme-core', 'tokens',
];

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const packages = only.length ? only : ALL;

const work = mkdtempSync(join(tmpdir(), 'df-tarball-'));
const failures = [];

/**
 * Every package is packed up front, because the internal dependencies are
 * declared with `workspace:*` and pnpm rewrites them at pack time to the
 * EXACT sibling version. Before a release that version is not on the
 * registry yet, so installing one tarball on its own fails to resolve its
 * siblings. The probe installs the local tarballs instead, which is also
 * closer to what a consumer gets: the same files, resolved the same way.
 */
const packed = new Map();   // '@dashforge/x' -> /path/to/x.tgz

function sh(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/** Resolve a relative specifier the way TypeScript would. */
function resolves(fromFile, spec) {
  let rel = spec;
  if (rel.endsWith('.js')) rel = rel.slice(0, -3);
  if (rel.endsWith('.mjs')) rel = rel.slice(0, -4);
  const base = resolve(dirname(fromFile), rel);
  return existsSync(`${base}.d.ts`)
      || existsSync(`${base}.d.mts`)
      || existsSync(join(base, 'index.d.ts'))
      || existsSync(base);
}

// ───── phase 1: pack everything ─────
for (const name of packages) {
  const pkgDir = join(LIBS, name);
  if (!existsSync(join(pkgDir, 'package.json'))) continue;
  const dest = join(work, name);
  mkdirSync(dest, { recursive: true });
  try {
    const out = sh('pnpm', ['pack', '--pack-destination', dest], pkgDir);
    const tgz = out.trim().split('\n').pop().trim();
    packed.set(JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8')).name, tgz);
  } catch (e) {
    failures.push([name, `pnpm pack failed: ${e.message.split('\n')[0]}`]);
  }
}

// ───── phase 2: check each tarball ─────
for (const name of packages) {
  const pkgDir = join(LIBS, name);
  if (!existsSync(join(pkgDir, 'package.json'))) {
    failures.push([name, 'no package.json in libs/dashforge']);
    continue;
  }

  const dest = join(work, name);
  const tgz = packed.get(JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf-8')).name);
  if (!tgz) { failures.push([name, 'pack produced nothing']); continue; }

  const ex = join(dest, 'x');
  mkdirSync(ex, { recursive: true });
  sh('tar', ['xzf', tgz, '-C', ex]);
  const root = join(ex, 'package');
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));

  // 1. the declaration entry point exists
  const entryRel = manifest.types || manifest.typings || manifest.exports?.['.']?.types;
  if (!entryRel) { failures.push([name, 'no `types` declared in package.json']); continue; }
  const entry = resolve(root, entryRel);
  if (!existsSync(entry)) { failures.push([name, `types points at ${entryRel}, absent from the tarball`]); continue; }

  // 2. everything it re-exports from resolves
  const src = readFileSync(entry, 'utf-8');
  const specs = [...new Set([...src.matchAll(/from\s+'(\.[^']+)'/g)].map((m) => m[1]))];
  const dangling = specs.filter((s) => !resolves(entry, s));
  if (dangling.length) {
    failures.push([name, `${dangling.length}/${specs.length} specifiers in ${entryRel} resolve to nothing: ${dangling.slice(0, 4).join(', ')}`]);
    continue;
  }

  // 4. no test files rode along
  const listing = sh('tar', ['tzf', tgz]).split('\n');
  const stray = listing.filter((f) => /__tests__|[.-](spec|test)\.|testHarness/.test(f) && !f.endsWith('.map'));
  if (stray.length) {
    failures.push([name, `${stray.length} test file(s) in the tarball: ${stray.slice(0, 3).join(', ')}`]);
    continue;
  }

  // 5. the VERSION constant agrees with package.json
  const indexTs = join(pkgDir, 'src', 'index.ts');
  if (existsSync(indexTs)) {
    const m = /export const VERSION = '([^']+)'/.exec(readFileSync(indexTs, 'utf-8'));
    if (m && m[1] !== manifest.version) {
      failures.push([name, `exports VERSION '${m[1]}' while publishing ${manifest.version}`]);
      continue;
    }
  }

  // 3. a real consumer compiles against it, with skipLibCheck OFF
  const probe = join(dest, 'probe');
  mkdirSync(join(probe, 'src'), { recursive: true });
  writeFileSync(join(probe, 'package.json'), JSON.stringify({ name: 'probe', private: true, type: 'module' }));
  writeFileSync(join(probe, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler',
      strict: true, noEmit: true, jsx: 'react-jsx',
      skipLibCheck: false,          // the whole point, see the header
      types: [],
    },
    include: ['src'],
  }));
  writeFileSync(join(probe, 'src', 'probe.ts'), `import * as pkg from '${manifest.name}';\nexport const used = Object.keys(pkg).length;\n`);

  try {
    // @types/react goes in unconditionally. Most of these packages name
    // React in their declarations, and without it the probe reports
    // "Cannot find namespace 'React'" on a perfectly good tarball. It is
    // cheaper to satisfy the peer than to start filtering error codes,
    // which is how a guard quietly stops guarding.
    const siblings = [
      ...Object.keys(manifest.dependencies || {}),
      ...Object.keys(manifest.peerDependencies || {}),
    ]
      .filter((d) => d.startsWith('@dashforge/'))
      .map((d) => packed.get(d))
      .filter(Boolean);
    sh('npm', ['install', tgz, ...siblings, '@types/react', '@types/react-dom',
               '--silent', '--no-audit', '--no-fund', '--legacy-peer-deps'], probe);
  } catch (e) {
    failures.push([name, `install of the tarball failed: ${e.message.split('\n')[0]}`]);
    continue;
  }

  const tsc = join(REPO_ROOT, 'node_modules', '.bin', 'tsc');
  try {
    sh(tsc, ['--noEmit', '-p', join(probe, 'tsconfig.json')]);
  } catch (e) {
    const out = `${e.stdout || ''}${e.stderr || ''}`;
    const lines = out.split('\n').filter((l) => l.includes('error TS'));
    // Two kinds of TS2307 land here and only one is this package's fault.
    // `Cannot find module './src/types'` means the tarball is missing its
    // own payload. `Cannot find module 'react'` means the throwaway
    // consumer never installed a peer, which says nothing about the
    // package. Keep the relative ones, and every other error code.
    const notOurProblem = (l) => {
      const m = /Cannot find module '([^']+)'/.exec(l);
      return m ? !m[1].startsWith('.') : false;
    };
    const mine = lines
      .filter((l) => l.includes(`node_modules/${manifest.name}/`))
      .filter((l) => !notOurProblem(l));
    if (mine.length) {
      failures.push([name, `a consumer cannot typecheck against it: ${mine[0].trim()}`]);
      continue;
    }
  }

  console.log(`  ok    ${manifest.name}@${manifest.version}  (${specs.length} specifiers, ${listing.length - 1} files)`);
}

rmSync(work, { recursive: true, force: true });

if (failures.length) {
  console.error(`\n${failures.length} package(s) would ship broken:\n`);
  for (const [name, why] of failures) console.error(`  FAIL  @dashforge/${name}\n        ${why}`);
  process.exit(1);
}
console.log(`\n${packages.length} package(s) verified.`);
