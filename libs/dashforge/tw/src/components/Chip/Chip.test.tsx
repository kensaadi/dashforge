// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Chip } from './Chip.js';

void React;
afterEach(() => cleanup());

/**
 * `<Chip>` unit tests. Covers:
 *   - static vs clickable rendering (span vs button)
 *   - sample variant × color cells (token-driven, no hardcoded hex)
 *   - icon / avatar leading slots (avatar wins when both set)
 *   - onClick (clickable) and onDelete (delete button) — separate
 *     event paths, delete button stops propagation
 *   - selected → aria-pressed
 *   - disabled state (explicit + access.disabled)
 *   - access RBAC: hide / disable
 *   - className / sx overrides
 */

const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};
const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [{ name: 'guest', permissions: [] }],
};
const adminSubject: Subject = { id: 'a', roles: ['admin'] };
const guestSubject: Subject = { id: 'g', roles: ['guest'] };

describe('<Chip>', () => {
  describe('rendering — root element', () => {
    it('renders as <span> by default (static)', () => {
      const { container } = render(<Chip label="Active" />);
      expect(container.querySelector('span')).toBeTruthy();
      expect(container.querySelector('button')).toBeNull();
    });

    it('renders as <button> when clickable=true', () => {
      render(<Chip label="Filter" clickable />);
      expect(screen.getByRole('button', { name: /filter/i })).toBeTruthy();
    });

    it('renders as <button> when onClick is provided (implicit clickable)', () => {
      render(<Chip label="Click me" onClick={() => {}} />);
      expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy();
    });

    it('renders the label content', () => {
      render(<Chip label="Active" />);
      expect(screen.getByText('Active')).toBeTruthy();
    });
  });

  describe('variant × color matrix (sample, token-driven)', () => {
    it('renders soft + primary with token classes (no hardcoded hex)', () => {
      const { container } = render(
        <Chip label="x" variant="soft" color="primary" />
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('bg-primary-100');
      expect(root.className).toContain('text-primary-700');
      expect(root.className).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    });

    it('renders solid + danger with full bg', () => {
      const { container } = render(
        <Chip label="x" variant="solid" color="danger" />
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('bg-danger-500');
      expect(root.className).toContain('text-white');
    });

    it('renders outline + info with border', () => {
      const { container } = render(
        <Chip label="x" variant="outline" color="info" />
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('border-info-500');
      expect(root.className).toContain('text-info-700');
    });

    it('defaults to soft + neutral when omitted', () => {
      const { container } = render(<Chip label="x" />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('bg-neutral-100');
      expect(root.className).toContain('text-neutral-700');
    });
  });

  describe('size axis', () => {
    it('applies h-5 + text-xs for size="sm" (default)', () => {
      const { container } = render(<Chip label="x" />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('h-5');
      expect(root.className).toContain('text-xs');
    });

    it('applies h-6 for size="md"', () => {
      const { container } = render(<Chip label="x" size="md" />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('h-6');
    });
  });

  describe('leading slots — icon / avatar', () => {
    it('renders icon when provided', () => {
      render(
        <Chip label="x" icon={<span data-testid="icon">i</span>} />
      );
      expect(screen.getByTestId('icon')).toBeTruthy();
    });

    it('renders avatar when provided', () => {
      render(
        <Chip label="x" avatar={<span data-testid="avatar">A</span>} />
      );
      expect(screen.getByTestId('avatar')).toBeTruthy();
    });

    it('avatar wins over icon when both set (MUI parity)', () => {
      render(
        <Chip
          label="x"
          icon={<span data-testid="icon">i</span>}
          avatar={<span data-testid="avatar">A</span>}
        />
      );
      expect(screen.getByTestId('avatar')).toBeTruthy();
      expect(screen.queryByTestId('icon')).toBeNull();
    });
  });

  describe('onClick (clickable chip)', () => {
    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      render(<Chip label="x" onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('does NOT fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(<Chip label="x" onClick={onClick} disabled />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('onDelete (delete button)', () => {
    it('renders a delete button when onDelete is provided', () => {
      render(<Chip label="tag" onDelete={() => {}} />);
      expect(screen.getByRole('button', { name: /^remove$/i })).toBeTruthy();
    });

    it('does NOT render a delete button when onDelete is omitted', () => {
      render(<Chip label="tag" />);
      expect(screen.queryByRole('button', { name: /^remove$/i })).toBeNull();
    });

    it('respects custom deleteLabel for aria-label', () => {
      render(<Chip label="tag" onDelete={() => {}} deleteLabel="Detach tag" />);
      expect(screen.getByRole('button', { name: /detach tag/i })).toBeTruthy();
    });

    it('fires onDelete when delete button clicked', () => {
      const onDelete = vi.fn();
      render(<Chip label="tag" onDelete={onDelete} />);
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('delete button does NOT trigger chip onClick (stopPropagation)', () => {
      const onClick = vi.fn();
      const onDelete = vi.fn();
      render(
        <Chip label="tag" onClick={onClick} onDelete={onDelete} />
      );
      // Click on the delete button
      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('selected state', () => {
    it('applies aria-pressed=true when selected on a clickable chip', () => {
      render(<Chip label="x" clickable selected />);
      const btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-pressed')).toBe('true');
    });

    it('applies the selected ring class', () => {
      const { container } = render(<Chip label="x" clickable selected />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('ring-2');
    });

    it('does NOT set aria-pressed when not selected', () => {
      render(<Chip label="x" clickable />);
      const btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-pressed')).toBeNull();
    });
  });

  describe('disabled state', () => {
    it('respects the explicit disabled prop on clickable chip', () => {
      render(<Chip label="x" clickable disabled />);
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('applies opacity-50 + cursor-not-allowed to root when disabled', () => {
      const { container } = render(<Chip label="x" disabled />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('opacity-50');
    });
  });

  describe('access RBAC integration', () => {
    it('hides the chip when access.onUnauthorized=hide and subject lacks permission', () => {
      const { container } = render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Chip
            label="x"
            access={{
              resource: 'admin-panel',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          />
        </RbacProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('disables a clickable chip when access.onUnauthorized=disable', () => {
      render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Chip
            label="x"
            clickable
            access={{
              resource: 'admin-panel',
              action: 'read',
              onUnauthorized: 'disable',
            }}
          />
        </RbacProvider>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('renders normally for admin subject', () => {
      render(
        <RbacProvider policy={FULL_ACCESS_POLICY} subject={adminSubject}>
          <Chip
            label="visible"
            access={{
              resource: 'admin-panel',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          />
        </RbacProvider>
      );
      expect(screen.getByText('visible')).toBeTruthy();
    });
  });

  describe('bridge integration — visibleWhen', () => {
    it('renders when visibleWhen returns true (no DashForm context)', () => {
      const { container } = render(
        <Chip label="shown" visibleWhen={() => true} />
      );
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('shown')).toBeTruthy();
    });

    it('returns null when visibleWhen returns false', () => {
      const { container } = render(
        <Chip label="hidden" visibleWhen={() => false} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders normally when visibleWhen is omitted', () => {
      const { container } = render(<Chip label="always" />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('overrides — sx + className', () => {
    it('appends sx to the root className', () => {
      const { container } = render(<Chip label="x" sx="ring-2 ring-purple-500" />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('ring-purple-500');
    });

    it('appends className to the root', () => {
      const { container } = render(<Chip label="x" className="my-custom-chip" />);
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('my-custom-chip');
    });
  });
});
