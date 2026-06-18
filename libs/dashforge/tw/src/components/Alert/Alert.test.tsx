// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Alert, AlertTitle } from './Alert.js';

void React;
afterEach(() => cleanup());

/**
 * `<Alert>` unit tests. Covers:
 *   - severity × variant matrix (12 combinations) — token classes
 *     actually emitted, role auto-derived, no `dark:` leaks
 *   - icon control (default per severity, custom override, false → none)
 *   - close button (onClose triggers, custom closeText label)
 *   - action slot (replaces close button when both set)
 *   - AlertTitle sub-component rendering
 *   - sx / className / slotProps overrides
 *   - bridge integration: visibleWhen + access return null when false
 *
 * NB: visibleWhen + access deep integration is covered by the
 * underlying `useEngineVisibility` and `useAccessState` test suites;
 * here we just verify Alert wires them correctly (return null when
 * gated).
 */

describe('<Alert>', () => {
  describe('severity × variant matrix', () => {
    const SEVERITIES = ['info', 'success', 'warning', 'danger'] as const;
    const VARIANTS = ['standard', 'filled', 'outlined'] as const;

    SEVERITIES.forEach((severity) => {
      VARIANTS.forEach((variant) => {
        it(`renders ${variant}/${severity} with token-driven utilities`, () => {
          const { container } = render(
            <Alert severity={severity} variant={variant}>
              Body content
            </Alert>
          );
          const root = container.firstChild as HTMLElement;
          expect(root).toBeTruthy();
          // Surface and border carry the severity name
          const className = root.className;
          expect(className).toContain(severity);
          // No dark: variants — preset handles inversion via CSS vars
          expect(className).not.toMatch(/\bdark:/);
          // No hardcoded hex
          expect(className).not.toMatch(/#[0-9a-fA-F]{3,8}/);
        });
      });
    });

    it('defaults to standard variant when omitted', () => {
      const { container } = render(<Alert severity="info">x</Alert>);
      const root = container.firstChild as HTMLElement;
      // Standard variant emits bg-info-50 + text-info-900
      expect(root.className).toContain('bg-info-50');
      expect(root.className).toContain('text-info-900');
    });
  });

  describe('ARIA role auto-derivation', () => {
    it('uses role="alert" for warning', () => {
      render(<Alert severity="warning">x</Alert>);
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    it('uses role="alert" for danger', () => {
      render(<Alert severity="danger">x</Alert>);
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    it('uses role="status" for info', () => {
      render(<Alert severity="info">x</Alert>);
      expect(screen.getByRole('status')).toBeTruthy();
    });

    it('uses role="status" for success', () => {
      render(<Alert severity="success">x</Alert>);
      expect(screen.getByRole('status')).toBeTruthy();
    });

    it('allows explicit role override', () => {
      render(
        <Alert severity="danger" role="status">
          downgraded to polite
        </Alert>
      );
      // No "alert" role, only the overridden "status"
      expect(screen.queryByRole('alert')).toBeFalsy();
      expect(screen.getByRole('status')).toBeTruthy();
    });
  });

  describe('icon prop — tristate behaviour', () => {
    it('renders a default icon SVG when icon is omitted', () => {
      const { container } = render(<Alert severity="warning">x</Alert>);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders the consumer-provided icon when icon is a ReactNode', () => {
      render(
        <Alert severity="info" icon={<span data-testid="custom-icon">ᐅ</span>}>
          x
        </Alert>
      );
      expect(screen.getByTestId('custom-icon')).toBeTruthy();
    });

    it('renders no icon container when icon is false', () => {
      const { container } = render(
        <Alert severity="info" icon={false}>
          x
        </Alert>
      );
      // No SVG anywhere (the close button SVG only renders with onClose)
      expect(container.querySelector('svg')).toBeNull();
    });
  });

  describe('close button (onClose)', () => {
    it('renders no close button when onClose is undefined', () => {
      render(<Alert severity="info">x</Alert>);
      expect(screen.queryByRole('button', { name: /close/i })).toBeNull();
    });

    it('renders a close button labelled "Close" by default when onClose is defined', () => {
      const onClose = vi.fn();
      render(
        <Alert severity="warning" onClose={onClose}>
          x
        </Alert>
      );
      const btn = screen.getByRole('button', { name: /^close$/i });
      expect(btn).toBeTruthy();
    });

    it('fires onClose on click', () => {
      const onClose = vi.fn();
      render(
        <Alert severity="warning" onClose={onClose}>
          x
        </Alert>
      );
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('respects custom closeText for the aria-label', () => {
      const onClose = vi.fn();
      render(
        <Alert severity="warning" onClose={onClose} closeText="Dismiss alert">
          x
        </Alert>
      );
      expect(screen.getByRole('button', { name: /dismiss alert/i })).toBeTruthy();
    });
  });

  describe('action slot', () => {
    it('renders the action node when provided', () => {
      render(
        <Alert
          severity="warning"
          action={<button data-testid="renew-cta">Renew</button>}
        >
          Trial expires
        </Alert>
      );
      expect(screen.getByTestId('renew-cta')).toBeTruthy();
    });

    it('action wins over onClose when both are provided (matches MUI)', () => {
      const onClose = vi.fn();
      render(
        <Alert
          severity="warning"
          onClose={onClose}
          action={<button data-testid="custom-action">Custom</button>}
        >
          x
        </Alert>
      );
      // Custom action renders
      expect(screen.getByTestId('custom-action')).toBeTruthy();
      // No auto close button rendered alongside
      expect(screen.queryByRole('button', { name: /^close$/i })).toBeNull();
    });
  });

  describe('<AlertTitle>', () => {
    it('renders title text', () => {
      render(
        <Alert severity="info">
          <AlertTitle>Heads up</AlertTitle>
          Body line below.
        </Alert>
      );
      expect(screen.getByText('Heads up')).toBeTruthy();
      expect(screen.getByText(/Body line below/i)).toBeTruthy();
    });

    it('AlertTitle accepts className override', () => {
      const { container } = render(
        <AlertTitle className="custom-title-class">Title</AlertTitle>
      );
      const node = container.firstChild as HTMLElement;
      expect(node.className).toContain('custom-title-class');
    });
  });

  describe('overrides — sx / className / slotProps', () => {
    it('applies sx to the root', () => {
      const { container } = render(
        <Alert severity="info" sx="mt-8">
          x
        </Alert>
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('mt-8');
    });

    it('appends className to the root', () => {
      const { container } = render(
        <Alert severity="info" className="my-custom-class">
          x
        </Alert>
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('my-custom-class');
    });

    it('applies slotProps.root.className to the root', () => {
      const { container } = render(
        <Alert
          severity="info"
          slotProps={{ root: { className: 'slot-root-class' } }}
        >
          x
        </Alert>
      );
      const root = container.firstChild as HTMLElement;
      expect(root.className).toContain('slot-root-class');
    });

    it('applies slotProps.icon.className to the icon wrapper', () => {
      const { container } = render(
        <Alert
          severity="warning"
          slotProps={{ icon: { className: 'icon-custom' } }}
        >
          x
        </Alert>
      );
      const iconSpan = container.querySelector('.icon-custom');
      expect(iconSpan).toBeTruthy();
    });

    it('applies slotProps.closeButton.className to the close button', () => {
      const onClose = vi.fn();
      render(
        <Alert
          severity="warning"
          onClose={onClose}
          slotProps={{ closeButton: { className: 'close-custom' } }}
        >
          x
        </Alert>
      );
      const btn = screen.getByRole('button', { name: /close/i });
      expect(btn.className).toContain('close-custom');
    });
  });

  describe('bridge integration — visibleWhen', () => {
    it('renders when visibleWhen returns true (no DashForm context)', () => {
      const { container } = render(
        <Alert severity="info" visibleWhen={() => true}>
          shown
        </Alert>
      );
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('shown')).toBeTruthy();
    });

    it('returns null when visibleWhen returns false', () => {
      const { container } = render(
        <Alert severity="info" visibleWhen={() => false}>
          hidden
        </Alert>
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders normally when visibleWhen is omitted', () => {
      const { container } = render(<Alert severity="info">always</Alert>);
      expect(container.firstChild).toBeTruthy();
    });
  });
});
