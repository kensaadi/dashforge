import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { AppShell } from './AppShell';
import type { LeftNavItem } from '../LeftNav/types';

/**
 * Unit tests for AppShell component.
 * Tests cover composition, responsive layout coordination, and toolbar spacing.
 *
 * Test Intents:
 * - Intent A: Basic composition (LeftNav + TopBar + main)
 * - Intent B: Desktop offset math
 * - Intent C: Mobile behavior
 * - Intent D: Fixed TopBar spacer
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

describe('AppShell', () => {
  const mockItems: LeftNavItem[] = [
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

  const mockRenderLink = (item: LeftNavItem, children: ReactNode) => (
    <a href={`/${item.key}`}>{children}</a>
  );

  const mockIsActive = (item: LeftNavItem) => item.key === 'dashboard';

  describe('Intent A – Basic Composition', () => {
    it('A1: renders LeftNav + TopBar + main children', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
          topBarLeft={<div data-testid="topbar-left">Logo</div>}
          topBarCenter={<div data-testid="topbar-center">Title</div>}
          topBarRight={<div data-testid="topbar-right">Avatar</div>}
        >
          <div data-testid="main-content">Main Content</div>
        </AppShell>
      );

      // LeftNav rendered (check for nav items)
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // TopBar rendered (check for slots)
      expect(screen.getByTestId('topbar-left')).toBeInTheDocument();
      expect(screen.getByTestId('topbar-center')).toBeInTheDocument();
      expect(screen.getByTestId('topbar-right')).toBeInTheDocument();

      // Main content rendered
      expect(screen.getByTestId('main-content')).toBeInTheDocument();

      // Main element exists
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Intent B – Desktop Offset Math', () => {
    beforeEach(() => {
      // Mock desktop (>= lg breakpoint)
      mockMatches = false;
    });

    it('B1: navOpen=true uses expanded width for main offset', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
          navOpen={true}
          navWidthExpanded={280}
          navWidthCollapsed={64}
        >
          <div>Content</div>
        </AppShell>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('data-dash-main-offset', '280');
      // Check that it has a width or margin-left marker
      expect(
        main.hasAttribute('data-dash-main-width') ||
          main.hasAttribute('data-dash-main-margin-left')
      ).toBe(true);
    });

    it('B2: navOpen=false uses collapsed width for main offset', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
        >
          <div>Content</div>
        </AppShell>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('data-dash-main-offset', '64');
    });
  });

  describe('Intent C – Mobile Behavior', () => {
    beforeEach(() => {
      // Mock mobile (< lg breakpoint)
      mockMatches = true;
    });

    it('C1: main offset becomes 0 on mobile', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
        >
          <div>Content</div>
        </AppShell>
      );

      // Note: When nav is closed in mobile, main is accessible
      // When nav is open (modal), main gets aria-hidden, but we can still check attributes
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('data-dash-main-offset', '0');
    });
  });

  describe('Intent D – Fixed TopBar Spacer', () => {
    it('D1: adds toolbar spacer when TopBar position is fixed (default)', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
        >
          <div>Content</div>
        </AppShell>
      );

      const spacer = screen.getByTestId('toolbar-spacer');
      expect(spacer).toBeInTheDocument();
      expect(spacer).toHaveAttribute('data-dash-toolbar-spacer', 'true');
    });

    it('D2: no spacer when TopBar position is static', () => {
      renderWithTheme(
        <AppShell
          items={mockItems}
          renderLink={mockRenderLink}
          isActive={mockIsActive}
          topBarPosition="static"
        >
          <div>Content</div>
        </AppShell>
      );

      const spacer = screen.queryByTestId('toolbar-spacer');
      expect(spacer).not.toBeInTheDocument();
    });
  });
});
