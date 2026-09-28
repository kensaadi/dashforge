// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { checkboxVariants } from './checkbox.variants';
import { switchVariants } from '../Switch/switch.variants';
import { radioGroupVariants } from '../RadioGroup/radioGroup.variants';
import { Checkbox } from './Checkbox';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 36 in libs/dashforge/README-BUG.md.
 *
 * Radix renders a hidden native input for form participation with inline
 * `position: absolute; opacity: 0; transform: translateX(-100%)`. With no
 * positioned ancestor it anchors to the BODY, which means it escapes any
 * `overflow: hidden` ancestor and extends the document's scrollable area
 * down to wherever the field sits.
 *
 * Found while verifying BUG 27's fix on `learn/dash`: the AppShell had
 * just been given `h-dvh overflow-hidden`, yet the window still scrolled
 * 800px. One checkbox ~1870px down the page was the whole cause —
 * `document.documentElement.scrollHeight` was 1891 against a 768px
 * viewport, and its `offsetParent` was `body`. Adding `relative` to the
 * field's own root dropped scrollHeight to 768 and the window scroll to 0.
 *
 * jsdom has no layout and no Radix bubble input to place, so the class
 * contract is what is pinned here; the browser numbers are in the entry.
 */

const rootClasses = (fn: () => string) => fn().split(/\s+/).filter(Boolean);

describe('BUG 36 regression guard — a field contains its own hidden input', () => {
  it.each([
    ['Checkbox', () => checkboxVariants().root()],
    ['Switch', () => switchVariants().root()],
    ['RadioGroup', () => radioGroupVariants().root()],
  ])('%s root establishes a containing block', (_name, get) => {
    // Without this the Radix bubble input anchors to the body.
    expect(rootClasses(get as () => string)).toContain('relative');
  });

  it('does not position the root any other way', () => {
    // `relative` is there to be a containing block, nothing more. Anything
    // stronger would change how the field sits in its own layout.
    for (const get of [
      () => checkboxVariants().root(),
      () => switchVariants().root(),
      () => radioGroupVariants().root(),
    ]) {
      const cls = rootClasses(get);
      expect(cls).not.toContain('absolute');
      expect(cls).not.toContain('fixed');
      expect(cls).not.toContain('sticky');
    }
  });

  it('reaches the rendered root', () => {
    const { container } = render(<Checkbox name="agree" label="Agree" />);
    expect((container.firstElementChild as HTMLElement).className).toContain(
      'relative',
    );
  });
});
