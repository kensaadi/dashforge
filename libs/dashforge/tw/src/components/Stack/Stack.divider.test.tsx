// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Stack } from './Stack.js';
import { Divider } from '../Divider/Divider.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap F — "Divider doesn't reliably render between
 * Stack children". Filed without a repro and with the right guess attached:
 * "may be the prop semantics confusing consumers."
 *
 * It is the semantics, and the trap is sharper than confusion. `<Divider>`
 * defaults to `horizontal`. A horizontal rule in a `direction="row"` Stack
 * resolves to `h-0 border-t w-full`: no height to see, and a demand for the
 * container's whole width, so the items get squeezed rather than separated.
 * Nothing warned, and the rule was in the DOM the whole time, which is why
 * it read as "doesn't reliably render".
 *
 * A Stack knows its own axis, so it now supplies the orientation the caller
 * did not choose. An explicit `orientation` still wins, and a divider that
 * is not ours is passed through untouched.
 */

const rules = (c: HTMLElement) => [
  ...c.querySelectorAll('[role="separator"], hr'),
];
const classesOfFirstRule = (c: HTMLElement) => rules(c)[0]?.className ?? '';

describe('<Stack divider>', () => {
  describe('orientation derived from the stack axis', () => {
    it('separates a row with vertical rules', () => {
      const { container } = render(
        <Stack direction="row" divider={<Divider />}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </Stack>
      );

      const cls = classesOfFirstRule(container);
      expect(cls).toContain('border-l');
      expect(cls).toContain('self-stretch');
      // The shipped behaviour, and the whole defect: a full-width rule of
      // zero height inside a flex row.
      expect(cls).not.toContain('border-t');
      expect(cls).not.toContain('w-full');
    });

    it('separates a column with horizontal rules', () => {
      const { container } = render(
        <Stack direction="col" divider={<Divider />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );

      const cls = classesOfFirstRule(container);
      expect(cls).toContain('border-t');
      expect(cls).toContain('w-full');
    });

    it('follows the reversed axes too', () => {
      const row = render(
        <Stack direction="row-reverse" divider={<Divider />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );
      expect(classesOfFirstRule(row.container)).toContain('border-l');
      cleanup();

      const col = render(
        <Stack direction="col-reverse" divider={<Divider />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );
      expect(classesOfFirstRule(col.container)).toContain('border-t');
    });

    it('defaults to horizontal when the stack states no direction', () => {
      // `defaultVariants.direction` is `col`, so the rule has to match it.
      const { container } = render(
        <Stack divider={<Divider />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );
      expect(classesOfFirstRule(container)).toContain('border-t');
    });
  });

  describe('what the derivation must not touch', () => {
    it('an explicit orientation always wins, even when it is the odd one', () => {
      // A caller who writes it deliberately gets it, including the shape
      // that looks wrong: they may be after that squeeze on purpose.
      const { container } = render(
        <Stack direction="row" divider={<Divider orientation="horizontal" />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );

      expect(classesOfFirstRule(container)).toContain('border-t');
    });

    it('a divider that is not ours is passed through untouched', () => {
      // Injecting `orientation` into a foreign element would put an unknown
      // attribute on the DOM, which is exactly BUG 9.
      const { container } = render(
        <Stack direction="row" divider={<hr data-custom="yes" />}>
          <span>1</span>
          <span>2</span>
        </Stack>
      );

      const rule = rules(container)[0] as HTMLElement;
      expect(rule.getAttribute('data-custom')).toBe('yes');
      expect(rule.hasAttribute('orientation')).toBe(false);
    });

    it('a non-element divider still interleaves', () => {
      const { container } = render(
        <Stack direction="row" divider={'·'}>
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </Stack>
      );
      expect(container.textContent).toBe('1·2·3');
    });
  });

  describe('interleaving arithmetic', () => {
    it.each([
      [0, 0],
      [1, 0],
      [2, 1],
      [3, 2],
      [5, 4],
    ])('%i children produce %i rules', (childCount, expected) => {
      const { container } = render(
        <Stack direction="row" divider={<Divider />}>
          {Array.from({ length: childCount }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </Stack>
      );
      expect(rules(container)).toHaveLength(expected);
    });
  });
});
