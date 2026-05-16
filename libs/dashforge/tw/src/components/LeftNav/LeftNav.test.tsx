// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { LeftNav } from './LeftNav.js';
import type { LeftNavNode } from './leftNav.types.js';

void React;
afterEach(() => cleanup());

const flatNav: LeftNavNode[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'reports', label: 'Reports', href: '/reports' },
  { id: 'settings', label: 'Settings', href: '/settings' },
];

const nestedNav: LeftNavNode[] = [
  { id: 'home', label: 'Home', href: '/' },
  {
    kind: 'group',
    id: 'sales',
    label: 'Sales',
    children: [
      { id: 'invoices', label: 'Invoices', href: '/invoices' },
      { id: 'customers', label: 'Customers', href: '/customers' },
    ],
  },
];

describe('<LeftNav>', () => {
  describe('rendering', () => {
    it('renders a nav landmark with the default aria-label', () => {
      render(<LeftNav items={flatNav} />);
      expect(
        screen.getByRole('navigation', { name: 'Main navigation' })
      ).toBeTruthy();
    });

    it('renders a custom aria-label', () => {
      render(<LeftNav items={flatNav} ariaLabel="App nav" />);
      expect(
        screen.getByRole('navigation', { name: 'App nav' })
      ).toBeTruthy();
    });

    it('renders one link per flat item', () => {
      render(<LeftNav items={flatNav} />);
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });

    it('renders a brand slot', () => {
      render(
        <LeftNav
          items={flatNav}
          brand={<span data-testid="brand">Dashforge</span>}
        />
      );
      expect(screen.getByTestId('brand')).toBeTruthy();
    });

    it('renders a footer slot', () => {
      render(
        <LeftNav
          items={flatNav}
          footer={<span data-testid="footer">user@x.io</span>}
        />
      );
      expect(screen.getByTestId('footer')).toBeTruthy();
    });
  });

  describe('active item', () => {
    it('marks the active item with aria-current="page"', () => {
      render(<LeftNav items={flatNav} activeId="reports" />);
      const link = screen.getByRole('link', { name: 'Reports' });
      expect(link.getAttribute('aria-current')).toBe('page');
    });

    it('marks NO item when activeId is missing or unknown', () => {
      render(<LeftNav items={flatNav} activeId="unknown" />);
      const links = screen.getAllByRole('link');
      links.forEach((l) => {
        expect(l.getAttribute('aria-current')).toBeNull();
      });
    });
  });

  describe('items without href render as button', () => {
    it('renders a button when only onSelect is provided', () => {
      const onSelect = vi.fn();
      render(
        <LeftNav
          items={[{ id: 'logout', label: 'Logout', onSelect }]}
        />
      );
      const btn = screen.getByRole('button', { name: 'Logout' });
      expect(btn.tagName).toBe('BUTTON');
      fireEvent.click(btn);
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('does not call onSelect on a disabled item', () => {
      const onSelect = vi.fn();
      render(
        <LeftNav
          items={[{ id: 'x', label: 'X', onSelect, disabled: true }]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'X' }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('marks the disabled link with aria-disabled', () => {
      render(
        <LeftNav
          items={[
            { id: 'x', label: 'X', href: '/x', disabled: true },
          ]}
        />
      );
      const link = screen.getByRole('link', { name: 'X' });
      expect(link.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('groups (nested)', () => {
    it('renders a group header as a button with aria-expanded', () => {
      render(<LeftNav items={nestedNav} />);
      const header = screen.getByRole('button', { name: /Sales/ });
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });

    it('shows group children when expanded (default true)', () => {
      render(<LeftNav items={nestedNav} />);
      expect(screen.getByRole('link', { name: 'Invoices' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Customers' })).toBeTruthy();
    });

    it('hides group children after the user clicks the header', () => {
      render(<LeftNav items={nestedNav} />);
      const header = screen.getByRole('button', { name: /Sales/ });
      fireEvent.click(header);
      expect(screen.queryByRole('link', { name: 'Invoices' })).toBeNull();
    });

    it('starts collapsed when defaultExpanded=false', () => {
      const items: LeftNavNode[] = [
        {
          kind: 'group',
          id: 'g',
          label: 'Group',
          defaultExpanded: false,
          children: [{ id: 'c', label: 'Child', href: '/c' }],
        },
      ];
      render(<LeftNav items={items} />);
      expect(screen.queryByRole('link', { name: 'Child' })).toBeNull();
    });

    it('honours controlled `expanded` prop', () => {
      const items: LeftNavNode[] = [
        {
          kind: 'group',
          id: 'g',
          label: 'Group',
          expanded: false,
          children: [{ id: 'c', label: 'Child', href: '/c' }],
        },
      ];
      const { rerender } = render(<LeftNav items={items} />);
      expect(screen.queryByRole('link', { name: 'Child' })).toBeNull();
      const expanded: LeftNavNode[] = [
        { ...(items[0] as { expanded: boolean }), expanded: true } as LeftNavNode,
      ];
      rerender(<LeftNav items={expanded} />);
      expect(screen.getByRole('link', { name: 'Child' })).toBeTruthy();
    });

    it('fires onGroupExpandedChange when toggled', () => {
      const cb = vi.fn();
      render(
        <LeftNav items={nestedNav} onGroupExpandedChange={cb} />
      );
      fireEvent.click(screen.getByRole('button', { name: /Sales/ }));
      expect(cb).toHaveBeenCalledWith('sales', false);
    });
  });

  describe('collapsed (rail mode)', () => {
    it('hides labels visually via sr-only when collapsed', () => {
      const { container } = render(
        <LeftNav items={flatNav} collapsed />
      );
      // Labels are still in the DOM, just hidden — accessible name
      // resolution still works.
      const link = screen.getByRole('link', { name: 'Home' });
      expect(link).toBeTruthy();
      // The label span carries the sr-only class.
      const labelSpans = container.querySelectorAll('.sr-only');
      expect(labelSpans.length).toBeGreaterThanOrEqual(3);
    });

    it('shows a tooltip via `title` for string labels in rail mode', () => {
      render(<LeftNav items={flatNav} collapsed />);
      const link = screen.getByRole('link', { name: 'Home' });
      expect(link.getAttribute('title')).toBe('Home');
    });

    it('fires onCollapseChange when the toggle is clicked', () => {
      const cb = vi.fn();
      render(<LeftNav items={flatNav} onCollapseChange={cb} />);
      fireEvent.click(
        screen.getByRole('button', { name: /Collapse navigation/ })
      );
      expect(cb).toHaveBeenCalledWith(true);
    });

    it('renders the toggle as Expand-button when already collapsed', () => {
      render(<LeftNav items={flatNav} collapsed onCollapseChange={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: /Expand navigation/ })
      ).toBeTruthy();
    });

    it('hides the toggle button when showCollapseToggle=false', () => {
      render(
        <LeftNav
          items={flatNav}
          onCollapseChange={vi.fn()}
          showCollapseToggle={false}
        />
      );
      expect(
        screen.queryByRole('button', { name: /(Collapse|Expand) navigation/ })
      ).toBeNull();
    });
  });

  describe('polymorphic linkComponent', () => {
    it('uses the supplied link component for every linked item', () => {
      const MyLink = vi.fn(
        ({
          children,
          ...rest
        }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a data-testid="my-link" {...rest}>
            {children}
          </a>
        )
      );
      render(<LeftNav items={flatNav} linkComponent={MyLink} />);
      expect(screen.getAllByTestId('my-link')).toHaveLength(3);
    });
  });

  describe('badges', () => {
    it('renders a badge node next to the label', () => {
      const items: LeftNavNode[] = [
        {
          id: 'inbox',
          label: 'Inbox',
          href: '/inbox',
          badge: <span data-testid="badge">42</span>,
        },
      ];
      render(<LeftNav items={items} />);
      expect(screen.getByTestId('badge')).toBeTruthy();
    });

    it('hides the badge in collapsed/rail mode', () => {
      const items: LeftNavNode[] = [
        {
          id: 'inbox',
          label: 'Inbox',
          href: '/inbox',
          badge: <span data-testid="badge">42</span>,
        },
      ];
      render(<LeftNav items={items} collapsed />);
      expect(screen.queryByTestId('badge')).toBeNull();
    });
  });

  describe('width variants', () => {
    it('renders sm / md / lg without throwing', () => {
      (['sm', 'md', 'lg'] as const).forEach((w) => {
        const { unmount } = render(<LeftNav items={flatNav} width={w} />);
        expect(
          screen.getByRole('navigation', { name: 'Main navigation' })
        ).toBeTruthy();
        unmount();
      });
    });
  });
});
