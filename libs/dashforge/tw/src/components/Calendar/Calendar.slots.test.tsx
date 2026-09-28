// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Calendar } from './Calendar';

void React;
afterEach(() => cleanup());

/**
 * The two API proposals from BUG 31, built after the contrast fix closed
 * the defect itself.
 *
 * The report's underlying complaint was that the library makes a decision
 * (mute the neighbouring month) and then leaves no supported way to depart
 * from it: `slotProps.day.className` is one flat string applied to all 42
 * cells, so an app wanting to address a single state had to restyle every
 * cell identically, reach into the DOM after render, or fork.
 */

const GRID = { today: '2026-05-20', value: '2026-05-20' } as const;

describe('BUG 31 follow-up — showSiblingDays', () => {
  it('renders the neighbouring months by default', () => {
    const { container } = render(<Calendar {...GRID} />);
    // 42 cells, all of them real buttons.
    expect(container.querySelectorAll('[role="gridcell"]').length).toBe(42);
    expect(container.querySelectorAll('[role="gridcell"] button').length).toBe(42);
  });

  it('replaces sibling cells with placeholders when false, keeping the geometry', () => {
    const { container } = render(<Calendar {...GRID} showSiblingDays={false} />);

    // The grid must not reflow: still 42 cells in 6 rows of 7.
    expect(container.querySelectorAll('[role="gridcell"]').length).toBe(42);
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThan(1);

    // But the sibling ones are no longer pickable.
    const buttons = container.querySelectorAll('[role="gridcell"] button');
    expect(buttons.length).toBeLessThan(42);
    // May 2026 has 31 days, so exactly the current month remains.
    expect(buttons.length).toBe(31);

    // And the placeholders are hidden from assistive tech: an empty cell
    // announced as a gridcell is noise.
    expect(
      container.querySelectorAll('[role="gridcell"][aria-hidden="true"]').length,
    ).toBe(11);
  });
});

describe('BUG 31 follow-up — slotProps.day as a function of state', () => {
  it('still accepts a flat object, applied to every cell', () => {
    // The shape that existed before must keep working unchanged.
    const { container } = render(
      <Calendar {...GRID} slotProps={{ day: { className: 'probe-all' } }} />,
    );
    const buttons = [...container.querySelectorAll('[role="gridcell"] button')];
    expect(buttons.length).toBe(42);
    expect(buttons.every((b) => b.className.includes('probe-all'))).toBe(true);
  });

  it('addresses one state without touching the others', () => {
    const { container } = render(
      <Calendar
        {...GRID}
        slotProps={{
          day: ({ siblingMonth }) =>
            siblingMonth ? { className: 'probe-sibling' } : {},
        }}
      />,
    );
    const buttons = [...container.querySelectorAll('[role="gridcell"] button')];
    const tagged = buttons.filter((b) => b.className.includes('probe-sibling'));

    // 42 cells, 31 in May, so 11 belong to the neighbours.
    expect(tagged.length).toBe(11);
    expect(buttons.length - tagged.length).toBe(31);
  });

  it('receives every flag the recipe is keyed on', () => {
    const seen: string[] = [];
    render(
      <Calendar
        {...GRID}
        slotProps={{
          day: (state) => {
            seen.push(Object.keys(state).sort().join(','));
            return {};
          },
        }}
      />,
    );
    expect(new Set(seen).size).toBe(1);
    expect(seen[0]).toBe('disabled,selected,siblingMonth,today');
  });

  it('tags the selected cell and only that one', () => {
    const { container } = render(
      <Calendar
        {...GRID}
        slotProps={{
          day: ({ selected }) => (selected ? { className: 'probe-sel' } : {}),
        }}
      />,
    );
    expect(
      container.querySelectorAll('[role="gridcell"] button.probe-sel').length,
    ).toBe(1);
  });
});
