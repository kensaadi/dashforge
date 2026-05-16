// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { Breadcrumbs } from './Breadcrumbs.js';
import type { BreadcrumbItem } from './breadcrumbs.types.js';

// Keep the React import alive for the classic JSX transform — when this
// file is run in environments where the bundler tree-shakes
// `import * as React`, the JSX call sites would lose the global.
void React;

// Auto-cleanup is not reliably registered when test-library is loaded
// before vitest globals are wired up — register the unmount step
// explicitly so back-to-back `render()` calls don't accumulate trees.
afterEach(() => {
  cleanup();
});

const trail: BreadcrumbItem[] = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'settings', label: 'Settings', href: '/settings' },
  { id: 'profile', label: 'Profile' },
];

describe('<Breadcrumbs>', () => {
  describe('basic rendering', () => {
    it('renders a nav with role + accessible name', () => {
      render(<Breadcrumbs items={trail} />);
      const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
      expect(nav).toBeTruthy();
    });

    it('renders an <ol> with one <li> per item', () => {
      const { container } = render(<Breadcrumbs items={trail} />);
      expect(container.querySelectorAll('li')).toHaveLength(3);
    });

    it('returns null for an empty items array', () => {
      const { container } = render(<Breadcrumbs items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('marks the last crumb as aria-current="page" by default', () => {
      render(<Breadcrumbs items={trail} />);
      const current = screen.getByText('Profile').closest('span');
      expect(current?.getAttribute('aria-current')).toBe('page');
    });

    it('honours an explicit `current: true` flag', () => {
      const custom: BreadcrumbItem[] = [
        { id: 'a', label: 'A', href: '/a' },
        { id: 'b', label: 'B', current: true },
        { id: 'c', label: 'C', href: '/c' },
      ];
      render(<Breadcrumbs items={custom} />);
      const bElement = screen.getByText('B').closest('span');
      expect(bElement?.getAttribute('aria-current')).toBe('page');
    });
  });

  describe('separator', () => {
    it('inserts the default `/` between crumbs', () => {
      const { container } = render(<Breadcrumbs items={trail} />);
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      // 2 separators between 3 crumbs.
      expect(separators).toHaveLength(2);
      expect(separators[0].textContent).toBe('/');
    });

    it('accepts a custom separator (string)', () => {
      const { container } = render(
        <Breadcrumbs items={trail} separator=">" />
      );
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators[0].textContent).toBe('>');
    });

    it('accepts a custom separator (ReactNode)', () => {
      render(
        <Breadcrumbs
          items={trail}
          separator={<span data-testid="sep">»</span>}
        />
      );
      // Two separators ⇒ two custom nodes.
      expect(screen.getAllByTestId('sep')).toHaveLength(2);
    });
  });

  describe('navigation links', () => {
    it('renders a non-current crumb with href as a real link', () => {
      render(<Breadcrumbs items={trail} />);
      const link = screen.getByRole('link', { name: 'Home' });
      expect(link.getAttribute('href')).toBe('/');
    });

    it('renders a crumb without href as a non-link span', () => {
      const noHref: BreadcrumbItem[] = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ];
      render(<Breadcrumbs items={noHref} />);
      expect(screen.queryByRole('link')).toBeNull();
    });

    it('fires onClick on link crumbs', () => {
      const onClick = vi.fn();
      const itemsWithClick: BreadcrumbItem[] = [
        { id: 'a', label: 'A', href: '/a', onClick },
        { id: 'b', label: 'B' },
      ];
      render(<Breadcrumbs items={itemsWithClick} />);
      fireEvent.click(screen.getByText('A'));
      expect(onClick).toHaveBeenCalled();
    });

    it('renders a disabled crumb as a non-interactive span', () => {
      const dis: BreadcrumbItem[] = [
        { id: 'a', label: 'A', href: '/a', disabled: true },
        { id: 'b', label: 'B' },
      ];
      render(<Breadcrumbs items={dis} />);
      // 'A' must not be a link (disabled overrides interactivity).
      expect(screen.queryByRole('link', { name: 'A' })).toBeNull();
      const span = screen.getByText('A').closest('span');
      expect(span?.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('truncation', () => {
    const long: BreadcrumbItem[] = Array.from({ length: 6 }, (_, i) => ({
      id: `c${i}`,
      label: `Crumb ${i}`,
      href: i === 5 ? undefined : `/c${i}`,
    }));

    it('collapses the middle when items > maxItems', () => {
      const { container } = render(
        <Breadcrumbs items={long} maxItems={3} />
      );
      // 1 (head) + 1 ellipsis + 1 (tail) = 3 <li>s.
      expect(container.querySelectorAll('li')).toHaveLength(3);
      expect(
        container.querySelector('[aria-label="More breadcrumbs"]')
      ).toBeTruthy();
    });

    it('respects itemsBeforeCollapse / itemsAfterCollapse', () => {
      const { container } = render(
        <Breadcrumbs
          items={long}
          maxItems={4}
          itemsBeforeCollapse={2}
          itemsAfterCollapse={2}
        />
      );
      // 2 head + 1 ellipsis + 2 tail = 5 <li>s.
      // (maxItems is the visible-budget hint; once collapsed the
      // before/after counts drive the final visible count.)
      expect(container.querySelectorAll('li')).toHaveLength(5);
    });

    it('does NOT collapse when items.length <= maxItems', () => {
      const { container } = render(
        <Breadcrumbs items={trail} maxItems={10} />
      );
      expect(container.querySelectorAll('li')).toHaveLength(3);
      expect(
        container.querySelector('[aria-label="More breadcrumbs"]')
      ).toBeNull();
    });

    it('does NOT collapse when maxItems is 0 (default)', () => {
      const { container } = render(<Breadcrumbs items={long} />);
      expect(container.querySelectorAll('li')).toHaveLength(6);
    });

    it('preserves the LAST crumb (current page) when collapsing', () => {
      render(<Breadcrumbs items={long} maxItems={3} />);
      expect(screen.getByText('Crumb 0')).toBeTruthy(); // first
      expect(screen.getByText('Crumb 5')).toBeTruthy(); // last/current
      expect(screen.queryByText('Crumb 2')).toBeNull(); // middle, collapsed
    });
  });

  describe('polymorphic link component', () => {
    it('uses the provided linkComponent instead of <a>', () => {
      const MyLink = vi.fn(
        ({ children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
          <a data-testid="custom-link" {...rest}>
            {children}
          </a>
        )
      );
      render(<Breadcrumbs items={trail} linkComponent={MyLink} />);
      // Two interactive crumbs ⇒ MyLink called twice.
      expect(MyLink).toHaveBeenCalledTimes(2);
      expect(screen.getAllByTestId('custom-link')).toHaveLength(2);
    });
  });

  describe('size variants', () => {
    it('renders sm / md / lg without throwing', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((s) => {
        const { unmount } = render(
          <Breadcrumbs items={trail} size={s} />
        );
        expect(
          screen.getByRole('navigation', { name: 'Breadcrumb' })
        ).toBeTruthy();
        unmount();
      });
    });
  });

  describe('aria-label override', () => {
    it('applies a custom aria-label to the nav landmark', () => {
      render(<Breadcrumbs items={trail} ariaLabel="Sentiero corrente" />);
      expect(
        screen.getByRole('navigation', { name: 'Sentiero corrente' })
      ).toBeTruthy();
    });
  });
});
