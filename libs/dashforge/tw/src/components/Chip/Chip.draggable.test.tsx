// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Chip } from './Chip.js';

void React;
afterEach(() => cleanup());

/**
 * kensaadi/dashforge#63 gap D — "no primitive for a palette of draggable
 * items".
 *
 * No new primitive was added. The palette layout the report describes is
 * `<Stack>` + `<Chip>`, which already composes; a `<Palette>` component
 * would be `<Stack>` with a different name. What was genuinely missing is
 * that `<Chip>` has a closed prop set and spreads nothing, so `draggable`
 * and `onDragStart` could not reach the DOM at all and the hand-rolled
 * workaround had to abandon `<Chip>` entirely.
 *
 * Native HTML5 drag-and-drop, so no dnd dependency and the transfer payload
 * stays the consumer's. The accessibility caveat is in the JSDoc and is not
 * a thing tests can enforce: a drag is a pointer gesture, so a palette that
 * offers nothing else fails WCAG 2.1.1 in the consuming app.
 */
describe('<Chip draggable>', () => {
  const root = (ui: React.ReactElement) =>
    render(ui).container.firstElementChild as HTMLElement;

  it('is not a drag source unless asked', () => {
    const el = root(<Chip label="Heading" />);

    // `draggable` must be absent, not "false": the attribute advertises a
    // capability, and every chip in the catalog would otherwise claim it.
    expect(el.hasAttribute('draggable')).toBe(false);
    expect(el.className).not.toContain('cursor-grab');
  });

  it('sets the native attribute and the grab affordance', () => {
    const el = root(<Chip label="Heading" draggable />);

    expect(el.getAttribute('draggable')).toBe('true');
    expect(el.className).toContain('cursor-grab');
    expect(el.className).toContain('active:cursor-grabbing');
  });

  it('hands the event to onDragStart so the payload stays the consumer’s', () => {
    const onDragStart = vi.fn();
    const el = root(
      <Chip label="Heading" draggable onDragStart={onDragStart} />
    );

    fireEvent.dragStart(el);
    expect(onDragStart).toHaveBeenCalledTimes(1);
  });

  it('fires onDragEnd when the gesture finishes', () => {
    const onDragEnd = vi.fn();
    const el = root(<Chip label="Heading" draggable onDragEnd={onDragEnd} />);

    fireEvent.dragEnd(el);
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });

  it('works on a clickable chip, which is the accessible shape', () => {
    // The pairing the JSDoc asks for: dragging for pointers, clicking for
    // everyone else. Both have to survive on the same chip.
    const onClick = vi.fn();
    const onDragStart = vi.fn();
    const el = root(
      <Chip
        label="Heading"
        draggable
        onClick={onClick}
        onDragStart={onDragStart}
      />
    );

    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('draggable')).toBe('true');

    fireEvent.dragStart(el);
    fireEvent.click(el);
    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stops advertising the drag when disabled', () => {
    // `pointer-events-none` already blocks the pointer, but leaving the
    // attribute on would still announce a capability that is gone.
    const onDragStart = vi.fn();
    const el = root(
      <Chip label="Heading" draggable disabled onDragStart={onDragStart} />
    );

    expect(el.hasAttribute('draggable')).toBe(false);
    fireEvent.dragStart(el);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('composes into the palette the report described', () => {
    const { container } = render(
      <div>
        {['Heading', 'Text', 'Image'].map((l) => (
          <Chip key={l} label={l} draggable />
        ))}
      </div>
    );

    const chips = [...container.querySelectorAll('[draggable="true"]')];
    expect(chips).toHaveLength(3);
  });
});
