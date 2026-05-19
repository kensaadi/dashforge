// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Popover } from './Popover.js';

void React;
afterEach(() => cleanup());

// jsdom doesn't implement ResizeObserver — Radix Floating UI requires it.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('Popover — rendering', () => {
  it('renders the trigger always', () => {
    render(
      <Popover content={<p>Panel</p>}>
        <button>Open panel</button>
      </Popover>
    );
    expect(screen.queryByRole('button', { name: 'Open panel' })).not.toBeNull();
  });

  it('renders content when controlled open=true', () => {
    render(
      <Popover content={<p>Panel content</p>} open onOpenChange={() => {}}>
        <button>Open panel</button>
      </Popover>
    );
    expect(screen.queryByText('Panel content')).not.toBeNull();
  });

  it('does not render content when open=false', () => {
    render(
      <Popover content={<p>Panel content</p>} open={false} onOpenChange={() => {}}>
        <button>Open panel</button>
      </Popover>
    );
    expect(screen.queryByText('Panel content')).toBeNull();
  });
});

describe('Popover — placement', () => {
  it.each(['top', 'right', 'bottom', 'left'] as const)(
    'renders side=%s without crashing',
    (side) => {
      render(
        <Popover content={<p>Panel</p>} open side={side} onOpenChange={() => {}}>
          <button>T</button>
        </Popover>
      );
      expect(screen.queryByText('Panel')).not.toBeNull();
    }
  );

  it('applies width style', () => {
    render(
      <Popover content={<p>Panel</p>} open width="300px" onOpenChange={() => {}}>
        <button>T</button>
      </Popover>
    );
    const content = screen.getByText('Panel').closest('[role="dialog"]') as HTMLElement | null;
    expect(content?.style.width).toBe('300px');
  });
});
