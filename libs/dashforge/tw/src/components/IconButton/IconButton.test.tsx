// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { IconButton } from './IconButton.js';

void React;
afterEach(() => cleanup());

/**
 * `<IconButton>` unit tests. Covers:
 *   - icon rendering, required aria-label, base layout primitives
 *   - variant × color × size matrix (5 variants × 5 colors × 3 sizes)
 *     — sampled, not exhaustive (the full matrix is covered by
 *     `<Button>`'s tests since IconButton reuses `buttonVariants`)
 *   - square geometry via SIZE_OVERRIDES + aspect-square
 *   - asChild polymorphism via Radix Slot
 *   - loading state (spinner + aria-busy + disabled)
 *   - disabled state (explicit + access.disabled + access.readonly)
 *   - access RBAC: hide / disable
 *   - click handler firing semantics
 */

const TestIcon = () => (
  <svg data-testid="test-icon" width={20} height={20} viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" />
  </svg>
);

const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};
const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [
    { name: 'guest', permissions: [] },
  ],
};
const adminSubject: Subject = { id: 'a', roles: ['admin'] };
const guestSubject: Subject = { id: 'g', roles: ['guest'] };

describe('<IconButton>', () => {
  describe('rendering', () => {
    it('renders the icon child', () => {
      render(
        <IconButton aria-label="x">
          <TestIcon />
        </IconButton>
      );
      expect(screen.getByTestId('test-icon')).toBeTruthy();
    });

    it('applies the aria-label to the button element', () => {
      render(
        <IconButton aria-label="Open settings">
          <TestIcon />
        </IconButton>
      );
      expect(screen.getByRole('button', { name: /open settings/i })).toBeTruthy();
    });

    it('renders as type="button" by default', () => {
      render(
        <IconButton aria-label="x">
          <TestIcon />
        </IconButton>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.type).toBe('button');
    });

    it('respects an explicit type prop', () => {
      render(
        <IconButton aria-label="x" type="submit">
          <TestIcon />
        </IconButton>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.type).toBe('submit');
    });
  });

  describe('layout primitives — square geometry', () => {
    it('always applies aspect-square + inline-flex (layout base)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('aspect-square');
      expect(btn.className).toContain('inline-flex');
      expect(btn.className).toContain('items-center');
      expect(btn.className).toContain('justify-center');
    });

    it('applies SIZE_OVERRIDES (w-N + px-0) for sm', () => {
      const { container } = render(
        <IconButton aria-label="x" size="sm">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('w-8');
      expect(btn.className).toContain('px-0');
    });

    it('applies SIZE_OVERRIDES for md (default)', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('w-10');
    });

    it('applies SIZE_OVERRIDES for lg', () => {
      const { container } = render(
        <IconButton aria-label="x" size="lg">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('w-12');
    });
  });

  describe('variant × color (inherits buttonVariants)', () => {
    it('renders solid + primary (token-driven, no hardcoded hex)', () => {
      const { container } = render(
        <IconButton aria-label="x" variant="solid" color="primary">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('bg-primary-500');
      expect(btn.className).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(btn.className).not.toMatch(/\bdark:/);
    });

    it('renders outline + danger (border color comes through)', () => {
      const { container } = render(
        <IconButton aria-label="x" variant="outline" color="danger">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('border');
      expect(btn.className).toContain('danger');
    });

    it('ghost variant uses bg-transparent', () => {
      const { container } = render(
        <IconButton aria-label="x" variant="ghost">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('bg-transparent');
    });
  });

  describe('asChild polymorphism', () => {
    it('renders the child via Radix Slot when asChild=true', () => {
      const { container } = render(
        <IconButton asChild aria-label="Open">
          <a href="/open" data-testid="anchor-child">
            <TestIcon />
          </a>
        </IconButton>
      );
      // Should be an <a>, not a <button>
      const anchor = container.querySelector('a[data-testid="anchor-child"]');
      expect(anchor).toBeTruthy();
      expect(container.querySelector('button')).toBeNull();
      // Anchor carries the IconButton className
      expect(anchor!.className).toContain('aspect-square');
    });
  });

  describe('loading state', () => {
    it('swaps the icon with a spinner', () => {
      const { container } = render(
        <IconButton aria-label="x" loading>
          <TestIcon />
        </IconButton>
      );
      // Icon child gone, replaced by Spinner (animate-spin is on the
      // Spinner's outer <span> wrapper now, since Sprint 4.4 refactor
      // delegated to the public <Spinner> component).
      expect(screen.queryByTestId('test-icon')).toBeNull();
      const spinner = container.querySelector('[class*="animate-spin"]');
      expect(spinner).toBeTruthy();
    });

    it('sets aria-busy=true while loading', () => {
      render(
        <IconButton aria-label="x" loading>
          <TestIcon />
        </IconButton>
      );
      const btn = screen.getByRole('button');
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('is disabled while loading', () => {
      render(
        <IconButton aria-label="x" loading>
          <TestIcon />
        </IconButton>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('respects the explicit disabled prop', () => {
      render(
        <IconButton aria-label="x" disabled>
          <TestIcon />
        </IconButton>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('does not fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(
        <IconButton aria-label="x" disabled onClick={onClick}>
          <TestIcon />
        </IconButton>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('access RBAC integration', () => {
    it('hides the button when access.onUnauthorized=hide and subject lacks permission', () => {
      const { container } = render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <IconButton
            aria-label="x"
            access={{
              resource: 'article',
              action: 'publish',
              onUnauthorized: 'hide',
            }}
          >
            <TestIcon />
          </IconButton>
        </RbacProvider>
      );
      expect(container.querySelector('button')).toBeNull();
    });

    it('disables the button when access.onUnauthorized=disable and subject lacks permission', () => {
      render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <IconButton
            aria-label="x"
            access={{
              resource: 'article',
              action: 'publish',
              onUnauthorized: 'disable',
            }}
          >
            <TestIcon />
          </IconButton>
        </RbacProvider>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('renders normally for an admin subject', () => {
      render(
        <RbacProvider policy={FULL_ACCESS_POLICY} subject={adminSubject}>
          <IconButton
            aria-label="x"
            access={{
              resource: 'article',
              action: 'publish',
              onUnauthorized: 'hide',
            }}
          >
            <TestIcon />
          </IconButton>
        </RbacProvider>
      );
      expect(screen.getByRole('button')).toBeTruthy();
    });
  });

  describe('click handler', () => {
    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      render(
        <IconButton aria-label="x" onClick={onClick}>
          <TestIcon />
        </IconButton>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('visibleWhen (engine-reactive, Sprint 4.4)', () => {
    it('renders when visibleWhen returns true', () => {
      const { container } = render(
        <IconButton aria-label="x" visibleWhen={() => true}>
          <TestIcon />
        </IconButton>
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('returns null when visibleWhen returns false', () => {
      const { container } = render(
        <IconButton aria-label="x" visibleWhen={() => false}>
          <TestIcon />
        </IconButton>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders normally when visibleWhen is omitted', () => {
      const { container } = render(
        <IconButton aria-label="x">
          <TestIcon />
        </IconButton>
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('overrides — sx + className', () => {
    it('appends sx to the root className', () => {
      const { container } = render(
        <IconButton aria-label="x" sx="ring-2 ring-purple-500">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('ring-purple-500');
    });

    it('appends className to the root', () => {
      const { container } = render(
        <IconButton aria-label="x" className="my-custom-icon-btn">
          <TestIcon />
        </IconButton>
      );
      const btn = container.querySelector('button')!;
      expect(btn.className).toContain('my-custom-icon-btn');
    });
  });
});
