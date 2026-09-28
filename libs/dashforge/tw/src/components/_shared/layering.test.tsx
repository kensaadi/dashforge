// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Dialog } from '../Dialog/Dialog';
import { Drawer } from '../Drawer/Drawer';
import { dialogVariants } from '../Dialog/dialog.variants';
import { drawerVariants } from '../Drawer/drawer.variants';
import { snackbarVariants } from '../Snackbar/snackbar.variants';
import { tooltipVariants } from '../Tooltip/tooltip.variants';
import { menuVariants } from '../Menu/menu.variants';
import { popoverVariants } from '../Popover/popover.variants';

void React;
afterEach(() => cleanup());

/**
 * Stacking order across the overlay family.
 *
 * Written to FIND a defect, not to confirm one: overlays are the one place
 * where every component is authored in isolation and the bug only appears
 * when two of them meet. Nothing in the catalog tests a pair.
 *
 * The contract being asserted is the obvious one a consumer assumes: an
 * overlay opened LATER, on top of another, is the one you see and interact
 * with. A modal raised from inside a drawer is the common case.
 */

/** The numeric z of a class string, whether `z-50` or `z-[1400]`. */
function zOf(classes: string): number | null {
  const m = classes.match(/(?:^|\s)z-\[?(\d+)\]?(?:\s|$)/);
  return m ? Number(m[1]) : null;
}

const layer = {
  drawerOverlay: zOf(drawerVariants().overlay()),
  drawerContent: zOf(drawerVariants().content()),
  dialogOverlay: zOf(dialogVariants().overlay()),
  dialogContent: zOf(dialogVariants().content()),
  snackbar: zOf(snackbarVariants().container()),
  tooltip: zOf(tooltipVariants().content()),
  menu: zOf(menuVariants().content()),
  popover: zOf(popoverVariants().content()),
};

describe('overlay layering — the pairs nobody tests', () => {
  it('reports the whole ladder, so a regression is readable', () => {
    // Not an assertion, a record. When one of the tests below fails this is
    // the table you want in the output.
     
    console.log('  layers:', JSON.stringify(layer));
    expect(Object.values(layer).some((v) => v !== null)).toBe(true);
  });

  it('a Dialog opened over a Drawer renders ABOVE it', () => {
    // The scenario: a drawer holding a form, a confirm modal raised from a
    // button inside it. If the dialog loses, the user sees the drawer with
    // an invisible modal trapping their focus.
    expect(layer.dialogContent).not.toBeNull();
    expect(layer.drawerContent).not.toBeNull();

    // NOT strictly greater. The catalog's model is one overlay tier with
    // DOM order settling the rest, which is already how Dialog, Menu,
    // Popover and Tooltip coexist. What must never happen is the dialog
    // sitting BELOW, which is what `z-[1410]` on the drawer produced.
    expect(
      (layer.dialogContent as number) >= (layer.drawerContent as number),
      `dialog z=${layer.dialogContent} must not sit below drawer z=${layer.drawerContent}`,
    ).toBe(true);

    // The other half of the contract is asserted on the rendered pair
    // below: same tier, dialog later in document order.
  });

  it('a Snackbar is visible over any overlay', () => {
    // A toast confirming the action you just took inside a dialog is
    // useless behind it.
    const highest = Math.max(
      layer.dialogContent ?? 0,
      layer.drawerContent ?? 0,
    );
    expect(
      (layer.snackbar ?? 0) >= highest,
      `snackbar z=${layer.snackbar} must be at least ${highest}`,
    ).toBe(true);
  });

  it('a Tooltip beats the surface it is anchored in', () => {
    expect((layer.tooltip ?? 0) >= (layer.menu ?? 0)).toBe(true);
  });

  it('the family sits on ONE scale, not two', () => {
    // Every overlay in the catalog is on Tailwind's 0-50 ladder except one.
    // Mixing scales is what produces the pair defects above: authored alone
    // each value looks fine.
    const values = Object.values(layer).filter((v): v is number => v !== null);
    const offScale = values.filter((v) => v > 50);
    expect(
      offScale,
      `these overlays left the 0-50 ladder: ${offScale.join(', ')}`,
    ).toEqual([]);
  });

  it('renders the real pair and the dialog wins in the DOM', () => {
    render(
      <>
        <Drawer open onOpenChange={() => undefined}>
          <p>drawer body</p>
        </Drawer>
        <Dialog open onOpenChange={() => undefined} title="Confirm">
          <p>dialog body</p>
        </Dialog>
      </>,
    );

    const zs = [...document.querySelectorAll<HTMLElement>('*')]
      .map((el) => ({ cls: el.className, z: typeof el.className === 'string' ? zOf(el.className) : null }))
      .filter((x) => x.z !== null);

    // Both overlays live on the same tier, so the DOM decides — which is
    // the contract. Assert that, rather than a numeric comparison that
    // would pass for the wrong reason.
    const tiers = new Set(zs.map((x) => x.z));
    expect(
      [...tiers],
      `every mounted overlay should be on one tier, saw: ${[...tiers].join(', ')}`,
    ).toEqual([50]);

    // And the dialog, mounted second, must come later in document order so
    // it paints on top.
    const all = [...document.querySelectorAll<HTMLElement>('*')];
    const drawerIdx = all.findIndex((e) => e.textContent?.trim() === 'drawer body');
    const dialogIdx = all.findIndex((e) => e.textContent?.trim() === 'dialog body');
    expect(dialogIdx).toBeGreaterThan(drawerIdx);
  });
});
