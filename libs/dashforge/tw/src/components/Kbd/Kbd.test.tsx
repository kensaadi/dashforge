// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Kbd } from './Kbd.js';

void React;
beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap J — a keycap primitive.
 *
 * The first case is the one the whole primitive exists for. Everything here
 * could be had from a styled `<span>`; what a span cannot give is the
 * `<kbd>` element, which assistive tech and reader modes treat as keyboard
 * input. If that regresses to a span the component is decoration.
 */
describe('<Kbd>', () => {
  const root = (ui: React.ReactElement) =>
    render(ui).container.firstElementChild as HTMLElement;

  it('renders the semantic kbd element', () => {
    const el = root(<Kbd>Esc</Kbd>);

    expect(el.tagName).toBe('KBD');
    expect(el.textContent).toBe('Esc');
  });

  it('defaults to the md cap', () => {
    expect(root(<Kbd>K</Kbd>).className).toContain('text-xs');
  });

  it.each([
    ['sm', 'text-2xs'],
    ['md', 'text-xs'],
    ['lg', 'text-sm'],
  ] as const)('size %s uses %s', (size, expected) => {
    expect(root(<Kbd size={size}>K</Kbd>).className).toContain(expected);
  });

  it('puts the border on a tier that clears 3:1 in both themes', () => {
    // Measured on learn/dash against both surfaces a cap sits on: -300 is
    // 1.48/1.42, -400 is 2.52/2.42, -500 is 4.74/4.54. The surface cannot
    // carry the separation (a neutral one step off the page is ~1.1:1, and
    // in dark it is the same colour as a card), so the border does, and it
    // lands on the tier BUG 40 reached for the same reason.
    const cls = root(<Kbd>K</Kbd>).className;

    expect(cls).toContain('border-neutral-500');
    expect(cls).not.toContain('border-neutral-300');
    // The surface stays as a faint lift.
    expect(cls).toContain('bg-neutral-100');
  });

  it('uses a token radius rather than the bare utility', () => {
    // Bare `rounded` is hard-coded at 0.25rem and immune to the radius
    // tokens (BUG 26), so a themed app could not square the cap.
    const cls = root(<Kbd>K</Kbd>).className.split(/\s+/);

    expect(cls).toContain('rounded-md');
    expect(cls).not.toContain('rounded');
  });

  it('stays on the neutral ramp, which auto-inverts', () => {
    // A `dark:` variant on the neutral palette double-inverts against the
    // preset's CSS-var swap and breaks dark mode.
    const cls = root(<Kbd>K</Kbd>).className;

    expect(cls).not.toMatch(/dark:/);
  });

  it('lets sx win over the recipe', () => {
    const cls = root(<Kbd sx="bg-primary-100">K</Kbd>).className;

    expect(cls).toContain('bg-primary-100');
    expect(cls).not.toContain('bg-neutral-100');
  });

  it('forwards its ref to the kbd element', () => {
    const ref = { current: null } as React.RefObject<HTMLElement | null>;
    render(<Kbd ref={ref}>K</Kbd>);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('KBD');
  });

  it('takes its size from the theme when the prop is absent', () => {
    act(() => {
      patchTheme({ components: { Kbd: { defaults: { size: 'lg' } } } });
    });
    const { container } = render(<Kbd>K</Kbd>);

    expect(container.querySelector('kbd')!.className).toContain('text-sm');
  });

  it('lets an explicit prop beat the theme default', () => {
    act(() => {
      patchTheme({ components: { Kbd: { defaults: { size: 'lg' } } } });
    });
    const { container } = render(<Kbd size="sm">K</Kbd>);

    expect(container.querySelector('kbd')!.className).toContain('text-2xs');
  });

  it('composes into a chord without a keys prop', () => {
    const { container } = render(
      <span>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    );

    expect(container.querySelectorAll('kbd')).toHaveLength(2);
    expect(container.textContent).toBe('⌘K');
  });
});
