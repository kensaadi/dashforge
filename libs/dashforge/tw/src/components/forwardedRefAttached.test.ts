// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Catalog-wide guard: a component that wraps itself in `forwardRef` has
 * promised that `<Component ref={r} />` hands the caller a DOM node. Taking
 * the `ref` parameter and never attaching it is a silent break of that
 * promise — no type error, no console warning, `r.current` simply stays
 * `null` forever.
 *
 * `<Slider>` shipped that way: `forwardRef<HTMLSpanElement, SliderProps>`
 * with `ref` named in the signature and referenced nowhere else in the file,
 * over a root element that is a `div` rather than a `span`. It surfaced as a
 * `@typescript-eslint/no-unused-vars` warning sitting in the lint output
 * among 197 others, which is how it stayed invisible.
 *
 * A source scan rather than a render test on purpose: a render test needs the
 * required props of each of the twenty-odd components, and the thing worth
 * pinning is the invariant, not one component's markup.
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

/** The `ref` identifier, not `xRef` / `.ref` / `refValue`. */
const REF_IDENTIFIER = /(?<![\w.$])ref(?![\w])/;

/**
 * Drops the `(props, ref)` parameter lists, so what remains is every *use*
 * of the identifier. Covers the single-line and prettier-wrapped forms.
 */
function stripRefParameters(source: string): string {
  return source
    .replace(/\(\s*\w+,\s*ref,?\s*\)/g, '(params)')
    .replace(/\(\s*\w+:[^,]+,\s*ref:[^)]+\)/g, '(params)');
}

describe('forwarded refs are attached, not just accepted', () => {
  const files = sourceFiles(HERE).filter((f) =>
    readFileSync(f, 'utf8').includes('forwardRef<')
  );

  it('finds the forwardRef components at all', () => {
    // Guards the guard: a broken path makes every assertion below vacuous.
    expect(files.length).toBeGreaterThan(15);
  });

  it('every component that takes a `ref` parameter also uses it', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      // Only files that actually name the parameter can drop it.
      if (!/\(\s*\w+(?::[^,]+)?,\s*ref\b/.test(source)) continue;

      const withoutParams = stripRefParameters(source);
      if (!REF_IDENTIFIER.test(withoutParams)) {
        offenders.push(relative(HERE, file));
      }
    }

    expect(offenders).toEqual([]);
  });

  it('the element type declared to forwardRef matches the root tag', () => {
    // The pair that got Slider wrong: `HTMLSpanElement` declared over a
    // `div` root. Only the unambiguous single-root cases are checked, so a
    // component that renders different tags by prop is left alone.
    const tagFor: Record<string, string> = {
      HTMLDivElement: 'div',
      HTMLSpanElement: 'span',
      HTMLButtonElement: 'button',
      HTMLAnchorElement: 'a',
      HTMLImageElement: 'img',
      HTMLVideoElement: 'video',
    };
    const mismatches: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      const decls = [...source.matchAll(/forwardRef<\s*(HTML\w+)/g)];
      // Several forwardRef declarations in one file means several roots;
      // pairing them up reliably is not worth the guesswork.
      if (decls.length !== 1) continue;

      const declared = decls[0][1];
      const expected = tagFor[declared];
      if (!expected) continue;

      // Lower-case only: `<Slot>` and friends are polymorphic wrappers whose
      // rendered tag is not knowable from here, and Button / IconButton /
      // Link all legitimately hand their ref to one.
      const attached = source.match(/<([a-z][\w-]*)\s+ref=\{ref[^}]*\}/);
      if (attached && attached[1] !== expected) {
        mismatches.push(
          `${relative(HERE, file)}: declares ${declared}, attaches to <${attached[1]}>`
        );
      }
    }

    expect(mismatches).toEqual([]);
  });
});
