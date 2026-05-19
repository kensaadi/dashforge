// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Tooltip } from './Tooltip.js';

void React;
afterEach(() => cleanup());

// jsdom doesn't implement ResizeObserver — Radix Floating UI requires it.
// Shim with a noop before any test mounts a Tooltip.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (typeof globalThis.DOMRect === 'undefined') {
    (globalThis as unknown as { DOMRect: unknown }).DOMRect = class {
      static fromRect(r?: DOMRectInit) {
        return new (globalThis as unknown as { DOMRect: new (x: number, y: number, w: number, h: number) => unknown }).DOMRect(
          r?.x ?? 0, r?.y ?? 0, r?.width ?? 0, r?.height ?? 0
        );
      }
      constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
    };
  }
});

describe('Tooltip — rendering', () => {
  it('renders the trigger (children) always', () => {
    render(
      <Tooltip content="Tip text">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.queryByRole('button', { name: 'Trigger' })).not.toBeNull();
  });

  it('renders content when controlled open=true', () => {
    render(
      <Tooltip content="Tip text" open onOpenChange={() => {}}>
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.queryAllByText('Tip text').length).toBeGreaterThan(0);
  });

  it('does not render content when controlled open=false', () => {
    render(
      <Tooltip content="Tip text" open={false} onOpenChange={() => {}}>
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.queryByText('Tip text')).toBeNull();
  });
});

describe('Tooltip — placement props', () => {
  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'renders side=%s without crashing',
    (side) => {
      render(
        <Tooltip content="Tip" open side={side} onOpenChange={() => {}}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.queryByRole('button', { name: 'Trigger' })).not.toBeNull();
    }
  );
});
