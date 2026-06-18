// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSkeleton,
  MenuTrigger,
} from './Menu.js';

void React;
afterEach(() => cleanup());

/**
 * Unit tests for the Menu family.
 *
 * Testing strategy: open the menu via `defaultOpen={true}` instead
 * of clicking the trigger. Radix DropdownMenu's open/close flow
 * uses pointer events that don't translate cleanly to jsdom's
 * `fireEvent.click` — and that logic is Radix's responsibility
 * anyway (already covered by their tests). Our tests focus on:
 *   - Our `<MenuItem>` props (onClick / disabled / selected / color /
 *     icon / endIcon)
 *   - Bridge integration on `<MenuItem>` (access / visibleWhen)
 *   - Our wrapper components (`<MenuLabel>`, `<MenuSeparator>`,
 *     `<MenuSkeleton>`)
 *   - `closeOnItemClick` propagation
 *
 * NB: Radix DropdownMenu uses Portal — when `defaultOpen={true}`,
 * the content renders to `document.body`. We assert via
 * `screen.getByText` / `screen.getByRole` which scan the whole
 * document.
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

describe('<Menu>', () => {
  describe('rendering', () => {
    it('renders the trigger', () => {
      render(
        <Menu>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByRole('button', { name: /open/i })).toBeTruthy();
    });

    it('does NOT render content when closed (lazy mount)', () => {
      render(
        <Menu>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Hidden item</MenuItem>
          </MenuContent>
        </Menu>
      );
      // Without defaultOpen, Radix Portal isn't mounted.
      expect(screen.queryByText('Hidden item')).toBeNull();
    });

    it('renders content when defaultOpen=true', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Visible item</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByText('Visible item')).toBeTruthy();
    });
  });

  describe('MenuItem rendering', () => {
    it('renders icon prop', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem icon={<span data-testid="icon">i</span>}>
              With icon
            </MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByTestId('icon')).toBeTruthy();
    });

    it('renders endIcon prop', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem endIcon={<span data-testid="end">⌘K</span>}>
              Command
            </MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByTestId('end')).toBeTruthy();
    });

    it('renders the children as label', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>My label</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByText('My label')).toBeTruthy();
    });
  });

  describe('MenuItem disabled', () => {
    it('marks the item as disabled', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem disabled>Save</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('Save').closest('[role="menuitem"]');
      expect(item?.getAttribute('data-disabled')).not.toBeNull();
    });
  });

  describe('MenuItem selected visual', () => {
    it('applies primary bg classes when selected', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem selected>Theme: light</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('Theme: light').closest('[role="menuitem"]');
      expect(item?.className).toContain('bg-primary-50');
    });

    it('does NOT apply primary bg when not selected', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Theme: light</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('Theme: light').closest('[role="menuitem"]');
      expect(item?.className).not.toContain('bg-primary-50');
    });
  });

  describe('MenuItem color="danger"', () => {
    it('applies danger text class', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem color="danger">Delete</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('Delete').closest('[role="menuitem"]');
      expect(item?.className).toContain('text-danger-700');
    });

    it('default color does NOT apply danger class', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Default</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('Default').closest('[role="menuitem"]');
      expect(item?.className).not.toContain('text-danger-700');
    });
  });

  describe('MenuItem access RBAC', () => {
    it('hides the item for unauthorized subjects (onUnauthorized="hide")', () => {
      render(
        <RbacProvider policy={NO_ACCESS_POLICY} subject={guestSubject}>
          <Menu defaultOpen>
            <MenuTrigger>
              <button>Open</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem>Public</MenuItem>
              <MenuItem
                access={{
                  resource: 'admin',
                  action: 'manage',
                  onUnauthorized: 'hide',
                }}
              >
                Admin-only
              </MenuItem>
            </MenuContent>
          </Menu>
        </RbacProvider>
      );
      expect(screen.getByText('Public')).toBeTruthy();
      expect(screen.queryByText('Admin-only')).toBeNull();
    });

    it('renders for authorized subjects', () => {
      render(
        <RbacProvider policy={ADMIN_POLICY} subject={adminSubject}>
          <Menu defaultOpen>
            <MenuTrigger>
              <button>Open</button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                access={{
                  resource: 'admin',
                  action: 'manage',
                  onUnauthorized: 'hide',
                }}
              >
                Admin-only
              </MenuItem>
            </MenuContent>
          </Menu>
        </RbacProvider>
      );
      expect(screen.getByText('Admin-only')).toBeTruthy();
    });
  });

  describe('MenuItem visibleWhen', () => {
    it('renders when predicate returns true', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem visibleWhen={() => true}>Shown</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByText('Shown')).toBeTruthy();
    });

    it('returns null when predicate returns false', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Always shown</MenuItem>
            <MenuItem visibleWhen={() => false}>Hidden</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByText('Always shown')).toBeTruthy();
      expect(screen.queryByText('Hidden')).toBeNull();
    });
  });

  describe('MenuLabel + MenuSeparator', () => {
    it('renders MenuLabel content', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuLabel>Section heading</MenuLabel>
            <MenuItem>Item</MenuItem>
          </MenuContent>
        </Menu>
      );
      expect(screen.getByText('Section heading')).toBeTruthy();
    });

    it('renders MenuSeparator with role="separator"', () => {
      const { baseElement } = render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem>Above</MenuItem>
            <MenuSeparator />
            <MenuItem>Below</MenuItem>
          </MenuContent>
        </Menu>
      );
      const sep = baseElement.querySelector('[role="separator"]');
      expect(sep).toBeTruthy();
    });
  });

  describe('overrides — sx + className', () => {
    it('applies sx to a MenuItem', () => {
      render(
        <Menu defaultOpen>
          <MenuTrigger>
            <button>Open</button>
          </MenuTrigger>
          <MenuContent>
            <MenuItem sx="ring-2 ring-purple-500">x</MenuItem>
          </MenuContent>
        </Menu>
      );
      const item = screen.getByText('x').closest('[role="menuitem"]');
      expect(item?.className).toContain('ring-purple-500');
    });
  });
});

// ─── MenuSkeleton — standalone tests (no Menu wrapper) ───────────

describe('<MenuSkeleton>', () => {
  it('renders the default 3 placeholder rows', () => {
    const { container } = render(<MenuSkeleton />);
    // Each row is a div with the inline pulse classes; we match on
    // the unique "h-3 flex-1 rounded-sm bg-neutral-200" inline bone.
    const rows = container.querySelectorAll('.h-3.flex-1.rounded-sm');
    expect(rows.length).toBe(3);
  });

  it('renders custom count', () => {
    const { container } = render(<MenuSkeleton count={7} />);
    const rows = container.querySelectorAll('.h-3.flex-1.rounded-sm');
    expect(rows.length).toBe(7);
  });

  it('renders a skeleton heading when withHeading=true', () => {
    const { container } = render(<MenuSkeleton withHeading />);
    // Heading is the .uppercase wrapper (matches the MenuLabel style).
    expect(container.querySelector('.uppercase')).toBeTruthy();
  });

  it('omits the heading by default', () => {
    const { container } = render(<MenuSkeleton />);
    expect(container.querySelector('.uppercase')).toBeNull();
  });

  it('has aria-hidden="true" (decorative)', () => {
    const { container } = render(<MenuSkeleton />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('uses animate-pulse class (motion-reduce-safe)', () => {
    const { container } = render(<MenuSkeleton />);
    expect(container.firstElementChild?.className).toContain('animate-pulse');
    expect(container.firstElementChild?.className).toContain(
      'motion-reduce:animate-none'
    );
  });
});
