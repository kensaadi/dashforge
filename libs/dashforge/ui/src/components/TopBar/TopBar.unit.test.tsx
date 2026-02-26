import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

/**
 * Unit tests for TopBar component.
 * Tests cover LeftNav integration, responsive behavior, slot rendering, and prop forwarding.
 *
 * Test Intents:
 * - Intent A: Plain render & prop forwarding
 * - Intent B: Desktop layout coordination with LeftNav
 * - Intent C: Mobile behavior (ignores nav state)
 * - Intent D: Transition & toolbar heights
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

describe('TopBar', () => {
  describe('Intent A – Plain Render & Prop Forwarding', () => {
    it('A1: renders left, center, right slots', () => {
      renderWithTheme(
        <TopBar
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          left={<div data-testid="left-slot">Left Content</div>}
          center={<div data-testid="center-slot">Center Content</div>}
          right={<div data-testid="right-slot">Right Content</div>}
        />
      );

      expect(screen.getByTestId('left-slot')).toBeInTheDocument();
      expect(screen.getByTestId('center-slot')).toBeInTheDocument();
      expect(screen.getByTestId('right-slot')).toBeInTheDocument();
    });

    it('A2: forwards className prop', () => {
      renderWithTheme(
        <TopBar
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          className="custom-class"
          data-testid="top-bar"
        />
      );

      const topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveClass('custom-class');
    });

    it('A3: position is configurable (default fixed)', () => {
      const { rerender } = renderWithTheme(
        <TopBar
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          data-testid="top-bar"
        />
      );

      let topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-position', 'fixed');

      rerender(
        <ThemeProvider theme={createTheme()}>
          <TopBar
            navOpen={false}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            position="sticky"
            data-testid="top-bar"
          />
        </ThemeProvider>
      );

      topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-position', 'sticky');
    });
  });

  describe('Intent B – Desktop Layout Coordination', () => {
    beforeEach(() => {
      // Mock desktop (>= lg breakpoint)
      mockMatches = false;
    });

    it('B1: navOpen=true uses navWidthExpanded', () => {
      renderWithTheme(
        <TopBar
          navOpen={true}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          data-testid="top-bar"
        />
      );

      const topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-offset', '280');
      expect(topBar).toHaveAttribute('data-dash-width', 'calc(100% - 280px)');
    });

    it('B2: navOpen=false uses navWidthCollapsed', () => {
      renderWithTheme(
        <TopBar
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          data-testid="top-bar"
        />
      );

      const topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-offset', '64');
      expect(topBar).toHaveAttribute('data-dash-width', 'calc(100% - 64px)');
    });
  });

  describe('Intent C – Mobile Behavior', () => {
    beforeEach(() => {
      // Mock mobile (< lg breakpoint)
      mockMatches = true;
    });

    it('C1: forces 100% width regardless of nav state', () => {
      const { rerender } = renderWithTheme(
        <TopBar
          navOpen={true}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          data-testid="top-bar"
        />
      );

      let topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-offset', '0');
      expect(topBar).toHaveAttribute('data-dash-width', '100%');

      // Verify it also works when nav is closed
      rerender(
        <ThemeProvider theme={createTheme()}>
          <TopBar
            navOpen={false}
            navWidthExpanded={280}
            navWidthCollapsed={64}
            data-testid="top-bar"
          />
        </ThemeProvider>
      );

      topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-offset', '0');
      expect(topBar).toHaveAttribute('data-dash-width', '100%');
    });
  });

  describe('Intent D – Transition & Toolbar Heights', () => {
    it('D1: transition marker exists', () => {
      renderWithTheme(
        <TopBar
          navOpen={false}
          navWidthExpanded={280}
          navWidthCollapsed={64}
          data-testid="top-bar"
        />
      );

      const topBar = screen.getByTestId('top-bar');
      expect(topBar).toHaveAttribute('data-dash-has-transition', 'true');
    });

    it('D2: toolbar has marker', () => {
      renderWithTheme(
        <TopBar navOpen={false} navWidthExpanded={280} navWidthCollapsed={64} />
      );

      const toolbar = screen.getByTestId('top-bar-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('data-dash-toolbar', 'true');
    });
  });
});
