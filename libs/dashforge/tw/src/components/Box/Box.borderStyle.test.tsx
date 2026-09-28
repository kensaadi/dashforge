// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Box } from './Box.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap I — `borderStyle` on `<Box>`, for wireframe and
 * placeholder surfaces (a dashed drop target, a dotted empty-state frame).
 *
 * The axis is orthogonal to `variant` on purpose: a dashed box can be
 * outlined, soft or solid. The cases below pin that orthogonality, because
 * the obvious alternative — folding the styles into `variant` — is what a
 * later refactor would reach for.
 */
describe('<Box borderStyle>', () => {
  const cls = (ui: React.ReactElement) =>
    render(ui).container.firstElementChild!.className;

  it('emits nothing when the prop is absent', () => {
    const c = cls(<Box variant="outlined">x</Box>);

    expect(c).not.toMatch(/border-(solid|dashed|dotted|double)/);
    // The border-width from `outlined` is untouched.
    expect(c).toMatch(/\bborder\b/);
  });

  it.each([
    ['solid', 'border-solid'],
    ['dashed', 'border-dashed'],
    ['dotted', 'border-dotted'],
    ['double', 'border-double'],
  ] as const)('maps %s to %s', (value, expected) => {
    expect(cls(<Box variant="outlined" borderStyle={value}>x</Box>)).toContain(
      expected
    );
  });

  it('keeps the border-width from variant alongside the style', () => {
    const c = cls(
      <Box variant="outlined" borderStyle="dashed">
        x
      </Box>
    );

    // tailwind-merge must not treat `border` and `border-dashed` as the
    // same group and drop one: they are width and style.
    expect(c).toMatch(/\bborder\b/);
    expect(c).toContain('border-dashed');
  });

  it('is independent of variant', () => {
    // A soft box with a dashed border is a legitimate placeholder; the
    // axis must not be silently tied to `outlined`.
    for (const variant of ['plain', 'soft', 'solid', 'elevated'] as const) {
      expect(cls(<Box variant={variant} borderStyle="dotted">x</Box>)).toContain(
        'border-dotted'
      );
    }
  });

  it('is overridable through sx, which wins over the axis', () => {
    const c = cls(
      <Box variant="outlined" borderStyle="dashed" sx="border-dotted">
        x
      </Box>
    );

    expect(c).toContain('border-dotted');
    expect(c).not.toContain('border-dashed');
  });
});
