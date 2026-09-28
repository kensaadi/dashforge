// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Regression guard for BUG 26 in libs/dashforge/README-BUG.md.
 *
 * `dashforgePreset()` extends `theme.borderRadius` with
 * `none / sm / md / lg / xl / 2xl / full`, all `var(--df-tw-radius-*)`, and
 * **no `DEFAULT` key**. Tailwind's own `DEFAULT` therefore survives the
 * extend, so the bare `rounded` utility keeps its hard-coded 0.25rem and is
 * immune to the token scale by construction.
 *
 * Measured on `learn/dash`, squaring every radius token on `<html>` the way
 * the provider writes them:
 *
 *   rounded-sm ....... 2px -> 0px     (reads the token)
 *   rounded-md ....... 6px -> 0px     (reads the token)
 *   rounded (bare) ... 4px -> 4px     (immune)
 *   checkbox ......... 4px -> 4px     (the reported symptom)
 *
 * This is a source scan rather than a per-component assertion because the
 * entry asked for a lint rule: the defect is not any one component, it is
 * that a bare `rounded` can land anywhere later and reintroduce it
 * silently. Ten occurrences across eight components existed when this was
 * written; the entry had named three.
 *
 * NOT included, deliberately, and each checked against the preset rather
 * than assumed:
 *   - bare `shadow` — the preset DOES define `boxShadow.DEFAULT` as
 *     `var(--df-tw-shadow-DEFAULT)`, so it is token-driven. The entry's
 *     ⚠️ lumped it in with `rounded`; the two differ.
 *   - bare `border` — sets `border-width: 1px`, not a token-scale lookup.
 *   - `blur` — every hit is `type: 'blur'`, an event type.
 */

const HERE = dirname(fileURLToPath(import.meta.url));

/** Every .ts/.tsx under components/, excluding tests. */
function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      sourceFiles(full, out);
    } else if (/\.tsx?$/.test(name) && !/\.(test|spec)\./.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * `rounded` as a utility: at a token boundary, optionally variant-prefixed
 * (`focus-visible:rounded`), and NOT followed by `-` or a word character.
 */
const BARE_ROUNDED = /(?<![\w-])((?:[a-z-]+:)*)rounded(?![-\w])/;

describe('BUG 26 regression guard — no bare `rounded` in a class string', () => {
  const files = sourceFiles(HERE);

  it('scans a non-trivial number of component sources', () => {
    // Guards the guard: a broken path would make every assertion below
    // vacuously pass.
    expect(files.length).toBeGreaterThan(50);
  });

  it('finds no bare `rounded` utility anywhere under components/', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        // Comments are prose, and `rounded` is a legitimate word there.
        if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
        // A class string is quoted; a bare identifier line is not.
        if (!trimmed.includes("'") && !trimmed.includes('"')) return;
        // `rounded` is also the name of a PROP on Box / Image / Video and a
        // member of `AvatarShape`. Those are type-level and correct.
        if (/rounded\s*[?:=,]/.test(trimmed)) return;
        if (/\b(?:Pick|Omit)<|\|\s*'rounded'|'rounded'\s*\|/.test(trimmed)) return;
        // `BoxProps['rounded']` — indexed access into a props type.
        if (/\[\s*'rounded'\s*\]/.test(trimmed)) return;
        // `case 'rounded':` — a member of the `AvatarShape` union.
        if (/\bcase\s+'rounded'/.test(trimmed)) return;

        const m = BARE_ROUNDED.exec(trimmed);
        if (m) {
          offenders.push(
            `${relative(HERE, file)}:${i + 1}  ${m[0]}  ->  ${trimmed.slice(0, 70)}`,
          );
        }
      });
    }

    expect(
      offenders,
      `bare \`rounded\` is hard-coded 0.25rem and ignores --df-tw-radius-*.\n` +
        `Use a suffixed tier (rounded-sm / rounded-md / …):\n` +
        offenders.join('\n'),
    ).toEqual([]);
  });
});
