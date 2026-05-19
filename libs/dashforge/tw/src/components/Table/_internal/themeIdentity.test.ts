import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Theme-identity regression test.
 *
 * Enforces the Dashforge rule (memory: `feedback_dashforge_preset_is_identity`):
 * the `@dashforge/tw-theme` default preset auto-inverts the neutral
 * palette via a CSS-variable swap. Adding `dark:` Tailwind variants
 * on `neutral-*` classes creates a DOUBLE inversion that breaks
 * dark mode (both classes resolve to the dark value).
 *
 * This test scans Table source files for the anti-pattern and fails
 * if any are introduced. Color palettes (`primary`, `secondary`,
 * `success`, `warning`, `danger`, `info`) are EXEMPT — they do not
 * auto-invert, so `dark:` variants on them are a legitimate design
 * choice (e.g. RenderChip color rows).
 */
const TABLE_DIR = join(__dirname, '..');

/**
 * Match `dark:<modifier>?:bg-neutral-X` / `text-neutral-X` /
 * `border-neutral-X` / `placeholder:text-neutral-X` / `ring-neutral-X` etc.
 *
 * The `(?:[a-z-]+:)*` chunk eats arbitrary intermediate variants
 * (e.g. `dark:hover:bg-neutral-...`, `dark:placeholder:text-neutral-...`).
 */
const NEUTRAL_DARK_RE =
  /dark:(?:[a-z-]+:)*(?:bg|text|border|ring|placeholder:text|focus-visible:bg|hover:bg|hover:text|focus:bg)?-?neutral-\d+/;

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
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

describe('Table — theme identity rule (no `dark:` on neutral palette)', () => {
  const files = walkSourceFiles(TABLE_DIR).filter(
    // The test file itself contains the regex example — exclude.
    (f) => !f.endsWith('themeIdentity.test.ts'),
  );

  it('finds at least the expected source files', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const file of files) {
    const rel = file.replace(TABLE_DIR + '/', '');
    it(`${rel} — contains no \`dark:*-neutral-N\` classes`, () => {
      const source = readFileSync(file, 'utf-8');
      // Strip line comments to avoid false positives in docstrings
      const stripped = source
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      const match = stripped.match(NEUTRAL_DARK_RE);
      if (match) {
        // Surface the offending excerpt to make the failure actionable.
        const idx = stripped.indexOf(match[0]);
        const context = stripped.slice(Math.max(0, idx - 60), idx + match[0].length + 60);
        throw new Error(
          `Found \`dark:\`-on-neutral anti-pattern in ${rel}:\n  ...${context}...\n` +
            `Rule: dashforgePreset() auto-inverts neutral palette via CSS-var swap. ` +
            `Adding \`dark:bg-neutral-N\` (etc.) creates double inversion and breaks dark mode.\n` +
            `Fix: drop the \`dark:\` variant — the same class works in both modes.\n` +
            `See memory: \`feedback_dashforge_preset_is_identity\`.`,
        );
      }
      expect(match).toBeNull();
    });
  }
});
