// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Stack } from './Stack.js';

void React;
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * kensaadi/dashforge#63 gap K — "prop nomenclature surprises consumers:
 * `direction="col"` (not "column"), `gap` (not "spacing")".
 *
 * The issue offered two resolutions: accept both spellings, or document the
 * difference. Neither was taken.
 *
 * Accepting both forks the API permanently: every consumer, every theme
 * default and every doc example then has to pick a side, and the two
 * spellings have to be kept in sync forever. Documenting alone does not
 * help the consumer who already wrote the wrong one, which is the entire
 * population the report is about.
 *
 * What was missing is a signal. TypeScript rejects both mistakes at compile
 * time, so this is aimed at where TS does not reach: JS callers, loose
 * spreads, values read from config. There the wrong name is dropped in
 * silence and the Stack renders its default axis, which is precisely what
 * made it "surprising" rather than obviously broken.
 *
 * Warnings are dev-only and fire once per value, mirroring the `gap` guard
 * this component already carried.
 */

/** The render escapes the strict prop types on purpose: that is the case. */
const renderLoose = (props: Record<string, unknown>) =>
  render(
    React.createElement(
      Stack as unknown as React.ComponentType<Record<string, unknown>>,
      props,
      React.createElement('span', null, 'child')
    )
  );

describe('<Stack> nomenclature guards', () => {
  describe('direction', () => {
    it('names the value, the accepted set and the likely intent', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderLoose({ direction: 'column' });

      expect(warn).toHaveBeenCalledTimes(1);
      const msg = warn.mock.calls[0][0] as string;
      expect(msg).toContain('"column"');
      expect(msg).toContain('row, col, row-reverse, col-reverse');
      expect(msg).toContain('Did you mean "col"?');
    });

    it.each([
      ['column-reverse', 'col-reverse'],
      ['vertical', 'col'],
      ['horizontal', 'row'],
    ])('suggests %s -> %s', (given, meant) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderLoose({ direction: given });

      expect(warn.mock.calls[0][0]).toContain(`Did you mean "${meant}"?`);
    });

    it('warns without a suggestion when there is nothing to suggest', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      renderLoose({ direction: 'sideways' });

      const msg = warn.mock.calls[0][0] as string;
      expect(msg).toContain('"sideways"');
      expect(msg).not.toContain('Did you mean');
    });

    it('stays silent on every accepted value', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      for (const d of ['row', 'col', 'row-reverse', 'col-reverse']) {
        renderLoose({ direction: d });
        cleanup();
      }
      renderLoose({});

      expect(warn).not.toHaveBeenCalled();
    });

    it('warns once per value, not once per render', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      // A fresh value: the module-level bucket persists across the suite,
      // so anything already warned about above would not fire again.
      renderLoose({ direction: 'diagonal' });
      cleanup();
      renderLoose({ direction: 'diagonal' });

      expect(warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('spacing', () => {
    it('is dropped, warned about once, and never reaches the DOM', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { container } = renderLoose({ spacing: 3 });
      const root = container.firstElementChild!;

      // React 19 writes an unknown lowercase attribute without complaint,
      // which is how `tooltip` once shipped onto elements (BUG 9).
      expect(root.hasAttribute('spacing')).toBe(false);

      const msg = warn.mock.calls[0][0] as string;
      expect(msg).toContain('has no effect');
      expect(msg).toContain('gap={3}');

      // Once per module lifetime, not once per render. Asserted here
      // rather than in a case of its own, because a second case cannot
      // observe a first warning that has already been spent.
      cleanup();
      renderLoose({ spacing: 4 });
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('leaves a real gap alone', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { container } = renderLoose({ gap: 2 });

      expect(warn).not.toHaveBeenCalled();
      expect(container.firstElementChild!.className).toContain('gap-2');
    });
  });
});
