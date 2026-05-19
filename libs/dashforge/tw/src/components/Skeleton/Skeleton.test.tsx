// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Skeleton } from './Skeleton.js';

void React;
afterEach(() => cleanup());

describe('Skeleton — rendering', () => {
  it('renders a span with aria-hidden', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('aria-hidden')).toBe('true');
    expect(el?.getAttribute('role')).toBe('presentation');
  });

  it('defaults to variant=text + animation=pulse', () => {
    const { container } = render(<Skeleton />);
    const cls = container.querySelector('span')!.className;
    expect(cls).toContain('animate-pulse');
    // text variant has a height of 1em
    expect(cls).toContain('h-[1em]');
  });
});

describe('Skeleton — variants', () => {
  it.each(['text', 'rectangle', 'circle'] as const)(
    'renders variant=%s without crashing',
    (variant) => {
      const { container } = render(<Skeleton variant={variant} />);
      expect(container.querySelector('span')).not.toBeNull();
    },
  );

  it('rectangle has rounded-md class', () => {
    const { container } = render(<Skeleton variant="rectangle" />);
    expect(container.querySelector('span')!.className).toContain('rounded-md');
  });

  it('circle has rounded-full class', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelector('span')!.className).toContain('rounded-full');
  });
});

describe('Skeleton — animations', () => {
  it('animation=pulse adds animate-pulse', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.querySelector('span')!.className).toContain('animate-pulse');
  });

  it('animation=none does NOT add animate-pulse', () => {
    const { container } = render(<Skeleton animation="none" />);
    expect(container.querySelector('span')!.className).not.toContain('animate-pulse');
  });

  it('animation=wave adds overflow-hidden + after gradient', () => {
    const { container } = render(<Skeleton animation="wave" />);
    const cls = container.querySelector('span')!.className;
    expect(cls).toContain('overflow-hidden');
    expect(cls).toContain('relative');
  });

  it('always carries motion-reduce safety regardless of animation', () => {
    const { container } = render(<Skeleton animation="pulse" />);
    expect(container.querySelector('span')!.className).toContain('motion-reduce:animate-none');
  });
});

describe('Skeleton — dimensions', () => {
  it('passes width as inline style', () => {
    const { container } = render(<Skeleton width="200px" />);
    expect((container.querySelector('span') as HTMLElement).style.width).toBe('200px');
  });

  it('passes height as inline style', () => {
    const { container } = render(<Skeleton variant="rectangle" height="120px" />);
    expect((container.querySelector('span') as HTMLElement).style.height).toBe('120px');
  });

  it('for circle, height defaults to width', () => {
    const { container } = render(<Skeleton variant="circle" width="48px" />);
    const el = container.querySelector('span') as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });

  it('for circle, explicit height wins over width-default', () => {
    const { container } = render(<Skeleton variant="circle" width="48px" height="64px" />);
    const el = container.querySelector('span') as HTMLElement;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('64px');
  });
});

describe('Skeleton — sx + slotProps', () => {
  it('appends sx to root className', () => {
    const { container } = render(<Skeleton sx="my-custom-sx" />);
    expect(container.querySelector('span')!.className).toContain('my-custom-sx');
  });

  it('applies slotProps.root.className', () => {
    const { container } = render(
      <Skeleton slotProps={{ root: { className: 'slot-class' } }} />,
    );
    expect(container.querySelector('span')!.className).toContain('slot-class');
  });

  it('sx wins over variant default on conflict via tailwind-merge', () => {
    // variant=text emits `bg-neutral-200`; sx forces `bg-red-500`.
    const { container } = render(<Skeleton sx="bg-red-500" />);
    const cls = container.querySelector('span')!.className;
    expect(cls).toContain('bg-red-500');
    expect(cls).not.toContain('bg-neutral-200');
  });
});

describe('Skeleton — accessibility', () => {
  it('does not appear in role-based queries (aria-hidden + role=presentation)', () => {
    const { container } = render(<Skeleton />);
    const el = container.querySelector('span')!;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('role')).toBe('presentation');
  });
});
