import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Package-level theme-identity regression test.
 *
 * Enforces the Dashforge rule
 * (memory: `feedback_dashforge_preset_is_identity`):
 * the `@dashforge/tw-theme` default preset auto-inverts the neutral
 * palette via a CSS-variable swap (`bg-neutral-50` is light surface
 * in light mode AND dark surface in dark mode — same class, different
 * physical color). Adding a `dark:` Tailwind variant on a
 * `neutral-*` class creates a DOUBLE inversion that breaks dark mode.
 *
 * The Sprint 4.1 Table fix established the rule; Sprint 4.3 applies
 * it to the whole catalog and adds this test as a regression guard.
 *
 * **Allowed exception** (Category B in `THEME-AUDIT.md`): the pattern
 * `bg-white dark:bg-neutral-N` / `fill-white dark:fill-neutral-N` is
 * LEGITIMATE — `bg-white` is hardcoded (no auto-inversion via CSS
 * vars) so a `dark:` counterpart IS needed to get a dark elevated
 * surface in dark mode. The regex below strips these legitimate
 * patterns before scanning for the anti-pattern.
 *
 * Color palettes (`primary` / `secondary` / `success` / `warning` /
 * `danger` / `info`) are EXEMPT from this rule by design — they
 * do not auto-invert, so `dark:` shifts on them are legitimate
 * design choices (tone refinement across modes).
 */
const COMPONENTS_DIR = join(__dirname, '..');

// The legitimate Category B patterns we allow:
//  1. `bg-white dark:bg-neutral-N`
//  2. `fill-white dark:fill-neutral-N`
//  3. variant-prefixed versions, e.g.
//     `data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-N`
//
// Strip these from the source before scanning for the anti-pattern.
const CATEGORY_B_RE =
  /(?:[\w[\]:-]+:)?(?:bg|fill)-white\s+dark:(?:[\w[\]:-]+:)*(?:bg|fill)-neutral-\d+/g;

// Anti-pattern: any `dark:` variant on a `neutral-N` class.
// Covers `bg`, `text`, `border`, `ring`, `placeholder:text`,
// `hover:bg`, `focus-visible:bg`, `data-[state=*]:bg`, etc.
const NEUTRAL_DARK_RE =
  /dark:(?:[\w[\]:-]+:)*(?:bg|text|border|ring|fill|placeholder|focus-visible|hover|focus|data)?-?neutral-\d+/;

function walkSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkSourceFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.name.endsWith('.test.ts')) continue;
    if (entry.name.endsWith('.test.tsx')) continue;
    if (entry.name.endsWith('.spec.ts')) continue;
    if (entry.name.endsWith('.spec.tsx')) continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

describe('Catalog — theme identity rule (no `dark:` on neutral palette)', () => {
  const files = walkSourceFiles(COMPONENTS_DIR);

  it('finds the catalog source files', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const file of files) {
    const rel = file.replace(COMPONENTS_DIR + '/', '');
    it(`${rel} — no \`dark:*-neutral-N\` anti-pattern`, () => {
      const source = readFileSync(file, 'utf-8');
      const stripped = source
        // 1. Strip legitimate Category B patterns (bg-white / fill-white
        //    paired with a `dark:` neutral target — bg-white doesn't
        //    auto-invert, so the `dark:` is intentional).
        .replace(CATEGORY_B_RE, '')
        // 2. Strip comments — the regex examples in THEME-AUDIT and
        //    this test source itself contain the anti-pattern as text.
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

      const match = stripped.match(NEUTRAL_DARK_RE);
      if (match) {
        const idx = stripped.indexOf(match[0]);
        const context = stripped.slice(
          Math.max(0, idx - 80),
          idx + match[0].length + 80,
        );
        throw new Error(
          `Found \`dark:*-neutral-N\` anti-pattern in ${rel}:\n` +
            `  ...${context.replace(/\s+/g, ' ').trim()}...\n\n` +
            `Rule: dashforgePreset() auto-inverts neutral palette via CSS-var swap. ` +
            `Adding \`dark:bg-neutral-N\` (or similar) creates double inversion ` +
            `and breaks dark mode.\n\n` +
            `Fix: drop the \`dark:\` variant — the base class auto-inverts.\n\n` +
            `Exception: \`bg-white dark:bg-neutral-N\` IS allowed (bg-white doesn't ` +
            `auto-invert, the dark variant is required for proper dark elevation).\n\n` +
            `See: libs/dashforge/tw/THEME-AUDIT.md, ` +
            `memory \`feedback_dashforge_preset_is_identity\`.`,
        );
      }
      expect(match).toBeNull();
    });
  }
});
