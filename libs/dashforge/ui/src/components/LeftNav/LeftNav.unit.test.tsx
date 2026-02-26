import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { LeftNav } from './LeftNav';
import type { LeftNavItem } from './types';

/**
 * Unit tests for LeftNav component.
 * Tests cover router-agnostic navigation, controlled/uncontrolled state,
 * responsive behavior, and accessibility.
 */

// Helper to wrap component with theme
function renderWithTheme(ui: ReactNode) {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

// Mock media query
let mockMatches = false;
beforeEach(() => {
  mockMatches = false;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: mockMatches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('LeftNav', () => {
  const mockLeafItems: LeftNavItem[] = [
    {
      id: 'dashboard',
      type: 'item',
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      id: 'profile',
      type: 'item',
      label: 'Profile',
      key: 'profile',
    },
  ];

  const mockItemsWithCollapse: LeftNavItem[] = [
    {
      id: 'dashboard',
      type: 'item',
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      id: 'settings',
      type: 'collapse',
      label: 'Settings',
      key: 'settings',
      children: [
        {
          id: 'settings-general',
          type: 'item',
          label: 'General',
          key: 'settings/general',
        },
        {
          id: 'settings-security',
          type: 'item',
          label: 'Security',
          key: 'settings/security',
        },
      ],
    },
  ];

  const mockItemsWithMultipleCollapses: LeftNavItem[] = [
    {
      id: 'dashboard',
      type: 'item',
      label: 'Dashboard',
      key: 'dashboard',
    },
    {
      id: 'settings',
      type: 'collapse',
      label: 'Settings',
      key: 'settings',
      children: [
        {
          id: 'settings-general',
          type: 'item',
          label: 'General',
          key: 'settings/general',
        },
      ],
    },
    {
      id: 'admin',
      type: 'collapse',
      label: 'Admin',
      key: 'admin',
      children: [
        {
          id: 'admin-users',
          type: 'item',
          label: 'Users',
          key: 'admin/users',
        },
      ],
    },
  ];

  describe('Intent A: Plain Render & Slots', () => {
    it('A1: renders header and footer slots', () => {
      const header = <div data-testid="header-slot">Header Content</div>;
      const footer = <div data-testid="footer-slot">Footer Content</div>;

      renderWithTheme(
        <LeftNav items={mockLeafItems} header={header} footer={footer} />
      );

      expect(screen.getByTestId('header-slot')).toBeInTheDocument();
      expect(screen.getByTestId('footer-slot')).toBeInTheDocument();
    });

    it('A2: forwards className to root', () => {
      const { container } = renderWithTheme(
        <LeftNav items={mockLeafItems} className="custom-class" />
      );

      const root = container.firstChild as HTMLElement;
      expect(root).toHaveClass('custom-class');
    });
  });

  describe('Intent B: Router-Agnostic Link Contract', () => {
    it('B1: calls renderLink for leaf items', () => {
      const renderLink = vi.fn((item: LeftNavItem, children: ReactNode) => (
        <a href={`/${item.key}`} data-testid={`link-${item.id}`}>
          {children}
        </a>
      ));

      renderWithTheme(
        <LeftNav items={mockLeafItems} renderLink={renderLink} />
      );

      // Should be called for each leaf item
      expect(renderLink).toHaveBeenCalledTimes(2);
      expect(renderLink).toHaveBeenCalledWith(
        mockLeafItems[0],
        expect.anything()
      );
      expect(renderLink).toHaveBeenCalledWith(
        mockLeafItems[1],
        expect.anything()
      );

      // Verify rendered nodes are in the document
      expect(screen.getByTestId('link-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('link-profile')).toBeInTheDocument();
    });

    it('B2: applies active pill when isActive(item) is true', () => {
      const isActive = vi.fn((item: LeftNavItem) => item.id === 'dashboard');
      const renderLink = vi.fn((item: LeftNavItem, children: ReactNode) => (
        <a href={`/${item.key}`}>{children}</a>
      ));

      renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          isActive={isActive}
          renderLink={renderLink}
        />
      );

      const dashboardItem = screen.getByText('Dashboard').closest('[role]');
      expect(dashboardItem).toHaveAttribute('aria-current', 'page');
      expect(dashboardItem).toHaveAttribute('data-dash-active', 'true');

      const profileItem = screen.getByText('Profile').closest('[role]');
      expect(profileItem).not.toHaveAttribute('aria-current');
      expect(profileItem).toHaveAttribute('data-dash-active', 'false');
    });
  });

  describe('Intent C: Controlled vs Uncontrolled Drawer Open', () => {
    it('C1: controlled open does not mutate internal state', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      const { rerender } = renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          open={false}
          onOpenChange={onOpenChange}
        />
      );

      // Verify drawer is collapsed
      const root = screen.getByRole('navigation').closest('[data-dash-open]');
      expect(root).toHaveAttribute('data-dash-open', 'false');

      // Click toggle button
      const toggleButton = screen.getByTestId('LeftNav.Toggle');
      await user.click(toggleButton);

      // Should call callback
      expect(onOpenChange).toHaveBeenCalledWith(true);

      // Re-render with open still false
      rerender(
        <ThemeProvider theme={createTheme()}>
          <LeftNav
            items={mockLeafItems}
            open={false}
            onOpenChange={onOpenChange}
          />
        </ThemeProvider>
      );

      // Drawer should still be collapsed
      expect(root).toHaveAttribute('data-dash-open', 'false');
    });

    it('C2: uncontrolled open toggles with defaultOpen', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          defaultOpen={false}
          onOpenChange={onOpenChange}
        />
      );

      const root = screen.getByRole('navigation').closest('[data-dash-open]');
      expect(root).toHaveAttribute('data-dash-open', 'false');

      // Click toggle
      const toggleButton = screen.getByTestId('LeftNav.Toggle');
      await user.click(toggleButton);

      // Should toggle state internally
      expect(root).toHaveAttribute('data-dash-open', 'true');
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Intent D: Inline Collapse (Expanded Mode)', () => {
    it('D1: clicking collapse toggles children inline in expanded mode', async () => {
      const user = userEvent.setup();

      renderWithTheme(<LeftNav items={mockItemsWithCollapse} open={true} />);

      // Initially children should be hidden
      expect(screen.queryByText('General')).not.toBeInTheDocument();
      expect(screen.queryByText('Security')).not.toBeInTheDocument();

      // Click collapse row
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      expect(settingsRow).toBeInTheDocument();
      await user.click(settingsRow!);

      // Children should be visible
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();

      // Click again to collapse
      await user.click(settingsRow!);

      // Children should be hidden again
      await waitFor(() => {
        expect(screen.queryByText('General')).not.toBeInTheDocument();
        expect(screen.queryByText('Security')).not.toBeInTheDocument();
      });
    });

    it('D2: controlled expandedIds calls onExpandedIdsChange', async () => {
      const user = userEvent.setup();
      const onExpandedIdsChange = vi.fn();

      renderWithTheme(
        <LeftNav
          items={mockItemsWithCollapse}
          open={true}
          expandedIds={[]}
          onExpandedIdsChange={onExpandedIdsChange}
        />
      );

      // Click collapse
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsRow!);

      // Callback should be called with the collapse id
      expect(onExpandedIdsChange).toHaveBeenCalledWith(['settings']);
    });
  });

  describe('Intent E: Flyout (Collapsed Mode, Click)', () => {
    it('E1: collapsed + click collapse opens popper flyout', async () => {
      const user = userEvent.setup();

      renderWithTheme(<LeftNav items={mockItemsWithCollapse} open={false} />);

      // Children should not be visible initially
      expect(screen.queryByText('General')).not.toBeInTheDocument();

      // Click collapse item
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsRow!);

      // Check that aria-expanded changed
      expect(settingsRow).toHaveAttribute('aria-expanded', 'true');

      // Flyout content should be visible
      await waitFor(
        () => {
          expect(screen.getByText('General')).toBeInTheDocument();
          expect(screen.getByText('Security')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('E2: click-away closes flyout', async () => {
      const user = userEvent.setup();

      renderWithTheme(<LeftNav items={mockItemsWithCollapse} open={false} />);

      // Open flyout
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsRow!);

      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
      });

      // Click document body
      await user.click(document.body);

      // Flyout should be closed
      await waitFor(() => {
        expect(screen.queryByText('General')).not.toBeInTheDocument();
      });
    });

    it('E3: Escape closes flyout', async () => {
      const user = userEvent.setup();

      renderWithTheme(<LeftNav items={mockItemsWithCollapse} open={false} />);

      // Open flyout
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsRow!);

      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      // Flyout should be closed
      await waitFor(() => {
        expect(screen.queryByText('General')).not.toBeInTheDocument();
      });
    });

    it('E4: opening another collapse closes previous flyout', async () => {
      const user = userEvent.setup();

      renderWithTheme(
        <LeftNav items={mockItemsWithMultipleCollapses} open={false} />
      );

      // Open first flyout (Settings)
      const settingsRow = screen.getByRole('button', { name: 'Settings' });
      await user.click(settingsRow!);

      await waitFor(() => {
        expect(screen.getByText('General')).toBeInTheDocument();
      });

      // Open second flyout (Admin)
      const adminRow = screen.getByRole('button', { name: 'Admin' });
      await user.click(adminRow!);

      await waitFor(() => {
        expect(screen.getByText('Users')).toBeInTheDocument();
      });

      // First flyout should be closed
      expect(screen.queryByText('General')).not.toBeInTheDocument();
    });
  });

  describe('Intent F: Mobile Variant Close-on-Navigate', () => {
    it('F1: on mobile, clicking leaf closes drawer if closeOnNavigateMobile=true', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      // Mock mobile breakpoint
      mockMatches = true;

      const renderLink = vi.fn((item: LeftNavItem, children: ReactNode) => (
        <a href={`/${item.key}`}>{children}</a>
      ));

      renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          open={true}
          onOpenChange={onOpenChange}
          closeOnNavigateMobile={true}
          mobileBreakpoint="md"
          renderLink={renderLink}
        />
      );

      // Click a leaf item
      const dashboardLink = screen.getByText('Dashboard');
      await user.click(dashboardLink);

      // Should call onOpenChange(false)
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Intent G: Size Variants', () => {
    it('G1: size changes item height marker', () => {
      const { container: containerSm } = renderWithTheme(
        <LeftNav items={mockLeafItems} size="sm" />
      );

      const itemSm = containerSm.querySelector('[data-dash-size]');
      expect(itemSm).toHaveAttribute('data-dash-size', 'sm');

      const { container: containerLg } = renderWithTheme(
        <LeftNav items={mockLeafItems} size="lg" />
      );

      const itemLg = containerLg.querySelector('[data-dash-size]');
      expect(itemLg).toHaveAttribute('data-dash-size', 'lg');
    });
  });

  describe('Intent H: Width Props', () => {
    it('H1: uses default widths when props are not provided', () => {
      const { container } = renderWithTheme(
        <LeftNav items={mockLeafItems} open={true} data-testid="nav-expanded" />
      );

      const drawerExpanded = container.querySelector(
        '[data-testid="nav-expanded"]'
      );
      expect(drawerExpanded).toHaveAttribute('data-dash-expanded-width', '280');
      expect(drawerExpanded).toHaveAttribute('data-dash-collapsed-width', '64');

      const { container: containerCollapsed } = renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          open={false}
          data-testid="nav-collapsed"
        />
      );

      const drawerCollapsed = containerCollapsed.querySelector(
        '[data-testid="nav-collapsed"]'
      );
      expect(drawerCollapsed).toHaveAttribute(
        'data-dash-expanded-width',
        '280'
      );
      expect(drawerCollapsed).toHaveAttribute(
        'data-dash-collapsed-width',
        '64'
      );
    });

    it('H2: uses widthExpanded / widthCollapsed when provided', () => {
      const { container } = renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          open={true}
          widthExpanded={333}
          widthCollapsed={55}
          data-testid="nav-custom"
        />
      );

      const drawer = container.querySelector('[data-testid="nav-custom"]');
      expect(drawer).toHaveAttribute('data-dash-expanded-width', '333');
      expect(drawer).toHaveAttribute('data-dash-collapsed-width', '55');

      const { container: containerCollapsed } = renderWithTheme(
        <LeftNav
          items={mockLeafItems}
          open={false}
          widthExpanded={333}
          widthCollapsed={55}
          data-testid="nav-custom-collapsed"
        />
      );

      const drawerCollapsed = containerCollapsed.querySelector(
        '[data-testid="nav-custom-collapsed"]'
      );
      expect(drawerCollapsed).toHaveAttribute(
        'data-dash-expanded-width',
        '333'
      );
      expect(drawerCollapsed).toHaveAttribute(
        'data-dash-collapsed-width',
        '55'
      );
    });
  });
});
