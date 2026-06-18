// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Badge } from './Badge.js';

void React;
afterEach(() => cleanup());

/**
 * Unit tests for `<Badge>`. Covers:
 *   - Content resolution (number, string, max overflow, showZero)
 *   - Dot mode
 *   - Placement (4 corners — sample 2)
 *   - Overlap (rectangular vs circular)
 *   - Color (7 intents — sample 3)
 *   - withRing toggle
 *   - invisible toggle (in DOM but hidden)
 *   - Access RBAC (hide vs always-show anchor)
 *   - visibleWhen predicate
 *   - Anchor children always render
 *   - Aria-hidden on badge slot
 */

const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [{ name: 'guest', permissions: [] }],
};
const ADMIN_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};
const guestSubject: Subject = { id: 'g', roles: ['guest'] };
const adminSubject: Subject = { id: 'a', roles: ['admin'] };

describe('<Badge>', () => {
  describe('content resolution', () => {
    it('renders numeric content', () => {
      render(
        <Badge content={3}>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('renders string content verbatim', () => {
      render(
        <Badge content="NEW">
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('NEW')).toBeTruthy();
    });

    it('renders nothing when content omitted + no dot', () => {
      const { container } = render(
        <Badge>
          <button>anchor</button>
        </Badge>
      );
      // Anchor present, no badge element
      expect(screen.getByText('anchor')).toBeTruthy();
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('hides badge when content=0 and showZero=false (default)', () => {
      const { container } = render(
        <Badge content={0}>
          <button>anchor</button>
        </Badge>
      );
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('shows badge when content=0 and showZero=true', () => {
      render(
        <Badge content={0} showZero>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('0')).toBeTruthy();
    });
  });

  describe('max overflow', () => {
    it('renders raw number when below max', () => {
      render(
        <Badge content={50} max={99}>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('50')).toBeTruthy();
    });

    it('renders "99+" when above default max=99', () => {
      render(
        <Badge content={1284}>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('99+')).toBeTruthy();
    });

    it('respects custom max', () => {
      render(
        <Badge content={1284} max={999}>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('999+')).toBeTruthy();
    });

    it('disables overflow when max=-1', () => {
      render(
        <Badge content={1284} max={-1}>
          <button>anchor</button>
        </Badge>
      );
      expect(screen.getByText('1284')).toBeTruthy();
    });
  });

  describe('dot mode', () => {
    it('renders a dot (w-2 h-2) when dot=true', () => {
      const { container } = render(
        <Badge dot>
          <button>anchor</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge).toBeTruthy();
      expect(badge.className).toContain('w-2');
      expect(badge.className).toContain('h-2');
    });

    it('ignores content when dot=true', () => {
      render(
        <Badge dot content={5}>
          <button>anchor</button>
        </Badge>
      );
      // Badge present but no "5" text
      expect(screen.queryByText('5')).toBeNull();
    });
  });

  describe('color axis', () => {
    it('default color=danger → bg-danger-500', () => {
      const { container } = render(
        <Badge content={1}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('bg-danger-500');
    });

    it('color=success → bg-success-500', () => {
      const { container } = render(
        <Badge content={1} color="success">
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('bg-success-500');
    });

    it('color=neutral uses auto-inverting neutral tokens (no dark:)', () => {
      const { container } = render(
        <Badge content={1} color="neutral">
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('bg-neutral-700');
      expect(badge.className).toContain('text-neutral-50');
      expect(badge.className).not.toMatch(/\bdark:/);
    });
  });

  describe('placement axis', () => {
    it('default placement=top-right → top-0 right-0', () => {
      const { container } = render(
        <Badge content={1}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('top-0');
      expect(badge.className).toContain('right-0');
    });

    it('placement=bottom-left → bottom-0 left-0', () => {
      const { container } = render(
        <Badge content={1} placement="bottom-left">
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('bottom-0');
      expect(badge.className).toContain('left-0');
    });
  });

  describe('overlap axis', () => {
    it('default overlap=rectangular → no circular inset class', () => {
      const { container } = render(
        <Badge content={1}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      // No `top-[14%]` / `right-[14%]` inset for rectangular
      expect(badge.className).not.toContain('top-[14%]');
    });

    it('overlap=circular adds the 14% inset', () => {
      const { container } = render(
        <Badge content={1} overlap="circular">
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('top-[14%]');
      expect(badge.className).toContain('right-[14%]');
    });
  });

  describe('withRing', () => {
    it('default withRing=true → ring-2 ring-neutral-50', () => {
      const { container } = render(
        <Badge content={1}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('ring-2');
      expect(badge.className).toContain('ring-neutral-50');
    });

    it('withRing=false → no ring class', () => {
      const { container } = render(
        <Badge content={1} withRing={false}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).not.toContain('ring-2');
    });
  });

  describe('invisible', () => {
    it('keeps badge in DOM but hidden when invisible=true', () => {
      const { container } = render(
        <Badge content={5} invisible>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge).toBeTruthy();
      expect(badge.className).toContain('hidden');
    });
  });

  describe('access RBAC', () => {
    it('hides the badge for unauthorized subjects (anchor still visible)', () => {
      const { container } = render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Badge
            content={5}
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            <button>anchor</button>
          </Badge>
        </RbacProvider>
      );
      // Anchor renders
      expect(screen.getByText('anchor')).toBeTruthy();
      // Badge does not
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('shows the badge for authorized subjects', () => {
      render(
        <RbacProvider policy={ADMIN_POLICY} subject={adminSubject}>
          <Badge
            content={5}
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            <button>anchor</button>
          </Badge>
        </RbacProvider>
      );
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  describe('visibleWhen', () => {
    it('renders when predicate returns true', () => {
      render(
        <Badge content={5} visibleWhen={() => true}>
          <button>x</button>
        </Badge>
      );
      expect(screen.getByText('5')).toBeTruthy();
    });

    it('hides badge (not anchor) when predicate returns false', () => {
      const { container } = render(
        <Badge content={5} visibleWhen={() => false}>
          <button>anchor</button>
        </Badge>
      );
      // Anchor still rendered
      expect(screen.getByText('anchor')).toBeTruthy();
      // Badge not
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });
  });

  describe('anchor always renders', () => {
    it('renders children even when badge is hidden via showZero', () => {
      render(
        <Badge content={0}>
          <button data-testid="anchor">anchor</button>
        </Badge>
      );
      expect(screen.getByTestId('anchor')).toBeTruthy();
    });

    it('renders children even when access denies badge', () => {
      render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Badge
            content={5}
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            <button data-testid="anchor">anchor</button>
          </Badge>
        </RbacProvider>
      );
      expect(screen.getByTestId('anchor')).toBeTruthy();
    });
  });

  describe('overrides — sx + className + slotProps', () => {
    it('appends sx to the root', () => {
      const { container } = render(
        <Badge content={1} sx="ring-4 ring-purple-500">
          <button>x</button>
        </Badge>
      );
      const root = container.firstElementChild!;
      expect(root.className).toContain('ring-purple-500');
    });

    it('appends slotProps.badge.className to the badge', () => {
      const { container } = render(
        <Badge content={1} slotProps={{ badge: { className: 'custom-badge-cls' } }}>
          <button>x</button>
        </Badge>
      );
      const badge = container.querySelector('[aria-hidden="true"]')!;
      expect(badge.className).toContain('custom-badge-cls');
    });
  });
});
