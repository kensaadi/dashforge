// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';

const HERE = dirname(fileURLToPath(import.meta.url));

function sources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) sources(full, out);
    else if (/\.tsx?$/.test(name) && !/\.(test|spec)\./.test(name)) out.push(full);
  }
  return out;
}

const FILES = sources(HERE);

function scan(rx: RegExp): string[] {
  const hits: string[] = [];
  for (const file of FILES) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith('*') || t.startsWith('//')) return;
      let m: RegExpExecArray | null;
      const r = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : rx.flags + 'g');
      while ((m = r.exec(t)) !== null) {
        hits.push(`${relative(HERE, file)}:${i + 1}  ${m[0]}`);
      }
    });
  }
  return hits;
}

/**
 * Catalog-wide compliance with the token scales.
 *
 * Companion to `tokenDrivenRadius.test.ts` (BUG 26), generalised. The
 * defect these catch is not any one component: it is that an arbitrary
 * value or a bare utility can land anywhere later and silently leave the
 * theme behind, and nobody notices because the component looks right.
 */

describe('token-scale compliance', () => {
  it('scans a non-trivial number of sources', () => {
    // Guards the guard: a broken path makes everything below vacuous.
    expect(FILES.length).toBeGreaterThan(50);
  });

  it('no hard-coded font size', () => {
    // The scale now reaches 10px (`2xs`), added precisely because Avatar
    // and Alert could not express themselves inside it.
    const hits = scan(/\btext-\[\d+(?:px|rem|em)\]/);
    expect(
      hits,
      `use a fontSize tier (${Object.keys(defaultTWThemeLight.fontSize).join(' / ')}):\n${hits.join('\n')}`,
    ).toEqual([]);
  });

  it('no hard-coded colour', () => {
    const hits = scan(/#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border|ring)-\[(?:#|rgb)/);
    expect(hits, `colours come from the palette:\n${hits.join('\n')}`).toEqual([]);
  });

  it('no hard-coded shadow', () => {
    const hits = scan(/\bshadow-\[/);
    expect(hits, `shadows come from the scale:\n${hits.join('\n')}`).toEqual([]);
  });

  it('every overlay stays on the shared z ladder', () => {
    // A component authored alone can pick any z and look correct. The
    // Drawer carried MUI's `z-[1400]` while the rest of the catalog sat on
    // Tailwind's 0-50, so a Dialog raised from inside it rendered behind.
    const hits = scan(/\bz-\[(\d+)\]/).filter((h) => {
      const n = Number(h.match(/z-\[(\d+)\]/)?.[1] ?? 0);
      return n > 50;
    });
    expect(
      hits,
      `these left the 0-50 overlay ladder:\n${hits.join('\n')}`,
    ).toEqual([]);
  });

  it('movement transitions are gated on prefers-reduced-motion', () => {
    // Colour and opacity are not motion; `transform` and `all` are.
    const hits: string[] = [];
    for (const file of FILES) {
      const txt = readFileSync(file, 'utf8');
      for (const m of txt.matchAll(/(\w+):\s*(\[[^\]]*\]|'[^']*')/g)) {
        const blk = m[2];
        if (/transition-(transform|all)\b/.test(blk) && !blk.includes('motion-reduce')) {
          hits.push(`${relative(HERE, file)}  slot \`${m[1]}\``);
        }
      }
    }
    expect(hits, `ungated movement:\n${hits.join('\n')}`).toEqual([]);
  });
});
