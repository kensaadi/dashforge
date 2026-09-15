// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { buttonVariants } from '../Button/button.variants.js';
import { tabsVariants } from '../Tabs/tabs.variants.js';
import { checkboxVariants } from '../Checkbox/checkbox.variants.js';
import { radioGroupVariants } from '../RadioGroup/radioGroup.variants.js';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 13 in libs/dashforge/README-BUG.md.
 *
 * The browser UA cursor on `<button>` is `default`, not `pointer`;
 * Tailwind Preflight does not add `cursor-pointer` and v4 explicitly
 * dropped the reset that some earlier stacks carried. Every
 * interactive `<button>` element in this package must therefore carry
 * `cursor-pointer` on its base recipe — otherwise the user hovers the
 * control and gets an arrow, which reads as "the page is dead".
 *
 * Two levels of assertion:
 *   1. Recipe-level: `buttonVariants()` / `tabsVariants().trigger()` /
 *      `checkboxVariants().control()` / `radioGroupVariants().control()`
 *      each emit a class string that CONTAINS `cursor-pointer`. This
 *      catches a regression in the variants file directly.
 *   2. Rendered-DOM: `<Button>` and `<IconButton>` render a `<button>`
 *      whose className string contains `cursor-pointer`. This catches
 *      a regression that removes the class between the variant recipe
 *      and the JSX site (e.g. an accidental override).
 *
 * Not tested here: computed style via `getComputedStyle`. jsdom does
 * not execute the Tailwind pipeline, so `getComputedStyle(el).cursor`
 * would return the browser default regardless. The class-string
 * presence is the stable, framework-agnostic proxy.
 */

describe('BUG 13 regression guard — interactive controls carry cursor-pointer', () => {
  describe('recipe-level', () => {
    it('buttonVariants() emits `cursor-pointer` in the base string', () => {
      const cls = buttonVariants();
      expect(cls).toMatch(/\bcursor-pointer\b/);
    });

    it('buttonVariants({ variant: "link" }) still emits `cursor-pointer` (base survives variant)', () => {
      const cls = buttonVariants({ variant: 'link' });
      expect(cls).toMatch(/\bcursor-pointer\b/);
    });

    it('tabsVariants().trigger() emits `cursor-pointer`', () => {
      const cls = tabsVariants().trigger();
      expect(cls).toMatch(/\bcursor-pointer\b/);
    });

    it('checkboxVariants().control() emits `cursor-pointer`', () => {
      const cls = checkboxVariants().control();
      expect(cls).toMatch(/\bcursor-pointer\b/);
    });

    it('radioGroupVariants().control() emits `cursor-pointer`', () => {
      const cls = radioGroupVariants().control();
      expect(cls).toMatch(/\bcursor-pointer\b/);
    });
  });

  describe('rendered-DOM', () => {
    it('<Button> renders a <button> whose className contains `cursor-pointer`', () => {
      const { container } = render(<Button>Click me</Button>);
      const btn = container.querySelector('button');
      expect(btn).toBeTruthy();
      expect(btn!.className).toMatch(/\bcursor-pointer\b/);
    });

    it('<IconButton> renders a <button> whose className contains `cursor-pointer`', () => {
      const { container } = render(
        <IconButton aria-label="probe">
          <svg />
        </IconButton>,
      );
      const btn = container.querySelector('button');
      expect(btn).toBeTruthy();
      expect(btn!.className).toMatch(/\bcursor-pointer\b/);
    });
  });
});
