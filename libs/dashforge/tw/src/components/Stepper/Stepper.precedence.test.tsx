// @vitest-environment jsdom
/**
 * Option C precedence chain — Stepper.
 *
 *   1. TV defaultVariants (color=primary, size=md, orientation=horizontal, labelPlacement=end).
 *   2. theme.components.Stepper.defaults.
 *   3. Instance props.
 *   4. sx (utility escape hatch, tailwind-merge).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { patchTheme, setTheme } from '@dashforge/tw-theme';
import { defaultTWThemeLight } from '@dashforge/tw-tokens';
import { Stepper } from './Stepper.js';
import { Step } from './Step.js';

beforeEach(() => {
  setTheme({ ...defaultTWThemeLight, components: undefined });
  cleanup();
});

describe('Stepper precedence chain — Option C', () => {
  it('level 1 — TV defaults apply primary color', () => {
    const { container } = render(
      <Stepper>
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    expect(container.querySelector('[class*="bg-primary"]')).toBeTruthy();
  });

  it('level 2 — theme.components.Stepper.defaults wins', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stepper: { defaults: { color: 'success', size: 'lg' } } },
      });
    });
    const { container } = render(
      <Stepper>
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    expect(container.querySelector('[class*="bg-success"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-primary"]')).toBeFalsy();
  });

  it('level 3 — instance prop wins over theme defaults', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stepper: { defaults: { color: 'success' } } },
      });
    });
    const { container } = render(
      <Stepper color="danger">
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    expect(container.querySelector('[class*="bg-danger"]')).toBeTruthy();
    expect(container.querySelector('[class*="bg-success"]')).toBeFalsy();
  });

  it('level 4 — sx wins on the root via tailwind-merge', () => {
    const { container } = render(
      <Stepper sx="opacity-50">
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    expect(container.innerHTML).toContain('opacity-50');
  });

  it('slotProps.step.className applied to each step wrapper', () => {
    const { container } = render(
      <Stepper slotProps={{ step: { className: 'df-test-step' } }}>
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    const steps = container.querySelectorAll('.df-test-step');
    expect(steps.length).toBe(2);
  });

  it('orientation via theme defaults renders the vertical strip', () => {
    act(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patchTheme as any)({
        components: { Stepper: { defaults: { orientation: 'vertical' } } },
      });
    });
    const { container } = render(
      <Stepper>
        <Step name="a" label="A" />
        <Step name="b" label="B" />
      </Stepper>,
    );
    // Vertical wires flex-row on the root + flex-col on the strip.
    expect(container.querySelector('[class*="flex-col"]')).toBeTruthy();
  });
});
