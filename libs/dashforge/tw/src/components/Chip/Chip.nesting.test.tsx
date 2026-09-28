// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Chip } from './Chip';

void React;
afterEach(() => cleanup());

/**
 * Regression guard for BUG 35 in libs/dashforge/README-BUG.md.
 *
 * `<Chip onClick onDelete>` rendered the delete control as a `<button>`
 * inside a root that was itself a `<button>`. Invalid HTML, a React
 * hydration error on every render, and the parser hoists the inner control
 * out of the outer one.
 *
 * Found while fixing BUG 23, from the suite's own stderr: the old test
 * asserted `stopPropagation` and passed, while the nesting complaint went
 * by unread. These tests make the markup itself the assertion.
 *
 * The fix is NOT just swapping the tag. `role="button"` carries ARIA's
 * presentational-children rule, so a nested control inside it is invisible
 * to assistive tech even though it is valid HTML. The delete affordance
 * therefore stops being focusable on a clickable chip, and the keyboard
 * path moves to Backspace / Delete on the chip, which is what MUI does.
 */

describe('BUG 35 regression guard — no interactive descendant in a clickable chip', () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  /** True if React complained about DOM nesting during the test. */
  const sawNestingComplaint = () =>
    errSpy.mock.calls.some((args) =>
      args.some(
        (a) =>
          typeof a === 'string' &&
          (a.includes('cannot be a descendant of') ||
            a.includes('cannot contain a nested')),
      ),
    );

  it('nests nothing interactive, and logs no DOM-nesting complaint', () => {
    const { container } = render(
      <Chip label="tag" onClick={() => undefined} onDelete={() => undefined} />,
    );

    const root = screen.getByRole('button');
    expect(root.tagName).toBe('DIV');
    expect(container.querySelector('button')).toBeNull();

    // The affordance is still rendered, just not as a control.
    const del = container.querySelector('[data-chip-delete]') as HTMLElement;
    expect(del).toBeTruthy();
    expect(del.tagName).toBe('SPAN');
    expect(del.getAttribute('aria-hidden')).toBe('true');
    expect(del.hasAttribute('tabindex')).toBe(false);

    expect(sawNestingComplaint()).toBe(false);
  });

  it('a static chip keeps a real, focusable delete button', () => {
    // A `<span>` root is not a widget, so a focusable button inside it is
    // valid and is the only keyboard path. This path was never broken and
    // must not be "fixed" along with the other one.
    const { container } = render(<Chip label="tag" onDelete={() => undefined} />);

    expect((container.firstElementChild as HTMLElement).tagName).toBe('SPAN');
    const del = container.querySelector('[data-chip-delete]') as HTMLElement;
    expect(del.tagName).toBe('BUTTON');
    expect(del.getAttribute('aria-label')).toBeTruthy();

    expect(sawNestingComplaint()).toBe(false);
  });

  it('is focusable and activates on Enter and Space', () => {
    const onClick = vi.fn();
    render(<Chip label="tag" onClick={onClick} />);
    const root = screen.getByRole('button');

    // A div has no implicit focusability or activation.
    expect(root.getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(root, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(root, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('deletes on Backspace and Delete, which is the keyboard path now', () => {
    const onDelete = vi.fn();
    const onClick = vi.fn();
    render(<Chip label="tag" onClick={onClick} onDelete={onDelete} />);
    const root = screen.getByRole('button');

    fireEvent.keyDown(root, { key: 'Backspace' });
    expect(onDelete).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(root, { key: 'Delete' });
    expect(onDelete).toHaveBeenCalledTimes(2);

    // Deleting is not activating.
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not fire the delete keys when there is no onDelete', () => {
    const onClick = vi.fn();
    render(<Chip label="tag" onClick={onClick} />);
    const root = screen.getByRole('button');

    fireEvent.keyDown(root, { key: 'Backspace' });
    fireEvent.keyDown(root, { key: 'Delete' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is inert while disabled, without a native `disabled` attribute', () => {
    const onClick = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <Chip label="tag" clickable disabled onClick={onClick} onDelete={onDelete} />,
    );
    const root = screen.getByRole('button');

    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('tabindex')).toBe('-1');

    fireEvent.click(root);
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.keyDown(root, { key: 'Backspace' });
    fireEvent.click(container.querySelector('[data-chip-delete]') as HTMLElement);

    expect(onClick).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
