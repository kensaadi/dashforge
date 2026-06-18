// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import { Card, CardContent, CardActionArea } from './Card.js';

void React;
afterEach(() => cleanup());

/**
 * Unit tests for the Card family. Covers:
 *   - <Card>: thin Box wrapper with restricted variant axis, inherits
 *     access + visibleWhen from Box (verified at integration level)
 *   - <CardContent>: padded inner box with default p=4 and override
 *   - <CardActionArea>: clickable wrapper (button or asChild), focus
 *     ring, selected aria-pressed, disabled state, access RBAC,
 *     visibleWhen predicate
 */

const ADMIN_POLICY: RbacPolicy = {
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

describe('<Card>', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<Card data-testid="card">hello</Card>);
      expect(screen.getByTestId('card')).toBeTruthy();
      expect(screen.getByText('hello')).toBeTruthy();
    });

    it('applies default outlined variant (border class from Box)', () => {
      const { container } = render(<Card>x</Card>);
      const root = container.firstElementChild!;
      expect(root.className).toContain('border');
    });

    it('applies default rounded="lg"', () => {
      const { container } = render(<Card>x</Card>);
      const root = container.firstElementChild!;
      expect(root.className).toContain('rounded-lg');
    });

    it('overrides default variant to elevated', () => {
      const { container } = render(<Card variant="elevated">x</Card>);
      const root = container.firstElementChild!;
      // Elevated variant uses bg-white in light mode
      expect(root.className).toContain('bg-white');
    });

    it('respects elevation override', () => {
      const { container } = render(<Card elevation={3}>x</Card>);
      const root = container.firstElementChild!;
      expect(root.className).toContain('shadow-md');
    });

    it('inherits visibleWhen from Box', () => {
      const { container } = render(
        <Card visibleWhen={() => false}>hidden</Card>
      );
      expect(container.firstChild).toBeNull();
    });

    it('inherits access from Box (hide mode)', () => {
      const { container } = render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Card
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            admin-only
          </Card>
        </RbacProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('inherits access from Box (visible for authorized subject)', () => {
      const { container } = render(
        <RbacProvider policy={ADMIN_POLICY} subject={adminSubject}>
          <Card
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            shown
          </Card>
        </RbacProvider>
      );
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('shown')).toBeTruthy();
    });
  });
});

describe('<CardContent>', () => {
  it('renders children inside a Box with default p=4', () => {
    const { container } = render(
      <CardContent>content</CardContent>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('p-4');
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('respects custom p value', () => {
    const { container } = render(
      <CardContent p={6}>spacious</CardContent>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('p-6');
  });

  it('respects p={0} for zero padding', () => {
    const { container } = render(
      <CardContent p={0}>flush</CardContent>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('p-0');
  });

  it('appends className', () => {
    const { container } = render(
      <CardContent className="my-custom-content">x</CardContent>
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain('my-custom-content');
  });
});

describe('<CardActionArea>', () => {
  describe('rendering', () => {
    it('renders as <button> by default', () => {
      render(<CardActionArea>click me</CardActionArea>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy();
    });

    it('renders as the immediate child when asChild=true', () => {
      const { container } = render(
        <CardActionArea asChild>
          <a href="/x" data-testid="anchor-child">link content</a>
        </CardActionArea>
      );
      const anchor = container.querySelector('a[data-testid="anchor-child"]');
      expect(anchor).toBeTruthy();
      expect(container.querySelector('button')).toBeNull();
    });

    it('applies base layout (block w-full)', () => {
      const { container } = render(<CardActionArea>x</CardActionArea>);
      const root = container.firstElementChild!;
      expect(root.className).toContain('block');
      expect(root.className).toContain('w-full');
    });
  });

  describe('selected state', () => {
    it('applies aria-pressed=true when selected', () => {
      render(<CardActionArea selected>x</CardActionArea>);
      expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
    });

    it('does NOT set aria-pressed when not selected', () => {
      render(<CardActionArea>x</CardActionArea>);
      expect(screen.getByRole('button').getAttribute('aria-pressed')).toBeNull();
    });

    it('applies primary ring class when selected', () => {
      const { container } = render(<CardActionArea selected>x</CardActionArea>);
      const btn = container.firstElementChild!;
      expect(btn.className).toContain('ring-primary-500');
    });
  });

  describe('disabled state', () => {
    it('respects explicit disabled prop', () => {
      render(<CardActionArea disabled>x</CardActionArea>);
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('does NOT fire onClick when disabled', () => {
      const onClick = vi.fn();
      render(<CardActionArea disabled onClick={onClick}>x</CardActionArea>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('applies opacity-50 + cursor-not-allowed when disabled', () => {
      const { container } = render(<CardActionArea disabled>x</CardActionArea>);
      const btn = container.firstElementChild!;
      expect(btn.className).toContain('opacity-50');
    });
  });

  describe('click handler', () => {
    it('fires onClick when clicked', () => {
      const onClick = vi.fn();
      render(<CardActionArea onClick={onClick}>x</CardActionArea>);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('access RBAC', () => {
    it('hides when access.onUnauthorized=hide and subject lacks permission', () => {
      const { container } = render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <CardActionArea
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            admin-cta
          </CardActionArea>
        </RbacProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('disables when access.onUnauthorized=disable', () => {
      render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <CardActionArea
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'disable',
            }}
          >
            disable-cta
          </CardActionArea>
        </RbacProvider>
      );
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });

    it('renders normally for authorized subject', () => {
      render(
        <RbacProvider policy={ADMIN_POLICY} subject={adminSubject}>
          <CardActionArea
            access={{
              resource: 'admin',
              action: 'read',
              onUnauthorized: 'hide',
            }}
          >
            admin-cta
          </CardActionArea>
        </RbacProvider>
      );
      expect(screen.getByText('admin-cta')).toBeTruthy();
    });
  });

  describe('visibleWhen', () => {
    it('renders when predicate returns true', () => {
      render(
        <CardActionArea visibleWhen={() => true}>shown</CardActionArea>
      );
      expect(screen.getByText('shown')).toBeTruthy();
    });

    it('returns null when predicate returns false', () => {
      const { container } = render(
        <CardActionArea visibleWhen={() => false}>hidden</CardActionArea>
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
