// @vitest-environment jsdom
import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { Avatar, AvatarGroup } from './Avatar.js';

void React;
afterEach(() => cleanup());

/**
 * Unit tests for the Avatar family. Covers:
 *   - Image rendering (src + alt)
 *   - Auto-initials from name (1 word, 2 words, edge cases)
 *   - Fallback chain (src fail → initials → custom icon → generic)
 *   - Shape ↔ radius interaction (radius wins when both set)
 *   - Size axis (5 enum values map to spacing classes)
 *   - Color × tone resolution (soft default vs explicit tone)
 *   - AvatarGroup slicing + overflow indicator + size inheritance
 */

describe('<Avatar>', () => {
  describe('image rendering', () => {
    it('renders an <img> when src is set', () => {
      const { container } = render(
        <Avatar src="/avatar.png" alt="Maya" />
      );
      expect(container.querySelector('img')).toBeTruthy();
    });

    it('applies the alt attribute', () => {
      render(<Avatar src="/x.png" alt="Maya Rodriguez" />);
      const img = screen.getByRole('img', { name: /maya rodriguez/i });
      expect(img).toBeTruthy();
    });

    it('falls back to initials when the image fails to load', () => {
      const { container } = render(<Avatar src="/broken.png" name="Maya Rodriguez" />);
      const img = container.querySelector('img')!;
      fireEvent.error(img);
      // After onError the img is gone, initials shown.
      expect(container.querySelector('img')).toBeNull();
      expect(screen.getByText('MR')).toBeTruthy();
    });
  });

  describe('auto-initials from name', () => {
    it('extracts MR from "Maya Rodriguez"', () => {
      render(<Avatar name="Maya Rodriguez" />);
      expect(screen.getByText('MR')).toBeTruthy();
    });

    it('extracts C from single-word name "Cher"', () => {
      render(<Avatar name="Cher" />);
      expect(screen.getByText('C')).toBeTruthy();
    });

    it('uppercases the initials', () => {
      render(<Avatar name="maya rodriguez" />);
      expect(screen.getByText('MR')).toBeTruthy();
    });

    it('handles extra whitespace', () => {
      render(<Avatar name="  Maya   Rodriguez  " />);
      expect(screen.getByText('MR')).toBeTruthy();
    });

    it('renders a generic icon when name is empty', () => {
      const { container } = render(<Avatar name="" />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders a generic icon when name is omitted entirely', () => {
      const { container } = render(<Avatar />);
      expect(container.querySelector('svg')).toBeTruthy();
    });

    it('renders fallbackIcon over the generic icon when set', () => {
      render(<Avatar fallbackIcon={<span data-testid="custom-icon">★</span>} />);
      expect(screen.getByTestId('custom-icon')).toBeTruthy();
    });

    it('initials win over fallbackIcon when name is present', () => {
      render(
        <Avatar
          name="Maya Rodriguez"
          fallbackIcon={<span data-testid="custom-icon">★</span>}
        />
      );
      expect(screen.getByText('MR')).toBeTruthy();
      expect(screen.queryByTestId('custom-icon')).toBeNull();
    });
  });

  describe('shape ↔ radius', () => {
    it('default shape=circle → rounded-full', () => {
      const { container } = render(<Avatar name="x" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('rounded-full');
    });

    it('shape="rounded" → rounded-lg', () => {
      const { container } = render(<Avatar name="x" shape="rounded" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('rounded-lg');
    });

    it('shape="square" → rounded-none', () => {
      const { container } = render(<Avatar name="x" shape="square" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('rounded-none');
    });

    it('explicit radius wins over shape', () => {
      const { container } = render(
        <Avatar name="x" shape="circle" radius="md" />
      );
      const root = container.firstElementChild!;
      expect(root.className).toContain('rounded-md');
      expect(root.className).not.toContain('rounded-full');
    });
  });

  describe('size axis', () => {
    it.each([
      ['xs', 'w-5'],
      ['sm', 'w-7'],
      ['md', 'w-9'],
      ['lg', 'w-12'],
      ['xl', 'w-16'],
    ] as const)('size=%s → %s', (size, expected) => {
      const { container } = render(<Avatar name="x" size={size} />);
      const root = container.firstElementChild!;
      expect(root.className).toContain(expected);
    });
  });

  describe('color × tone resolution', () => {
    it('default color=neutral + no tone → bg-neutral-100', () => {
      const { container } = render(<Avatar name="x" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('bg-neutral-100');
    });

    it('color=primary + no tone → soft default bg-primary-100', () => {
      const { container } = render(<Avatar name="x" color="primary" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('bg-primary-100');
    });

    it('color=success + tone=500 → bg-success-500 text-success-50', () => {
      const { container } = render(<Avatar name="x" color="success" tone={500} />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('bg-success-500');
      expect(root.className).toContain('text-success-50');
    });

    it('color=danger + tone=700 → bg-danger-700 text-danger-50', () => {
      const { container } = render(<Avatar name="x" color="danger" tone={700} />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('bg-danger-700');
    });

    it('color=warning + tone=50 → bg-warning-50 text-warning-900 (dark text)', () => {
      const { container } = render(<Avatar name="x" color="warning" tone={50} />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('bg-warning-50');
      expect(root.className).toContain('text-warning-900');
    });

    it('color classes are NOT applied when image loads', () => {
      const { container } = render(<Avatar src="/x.png" alt="x" color="primary" />);
      const root = container.firstElementChild!;
      // Image surface — no fallback bg paint underneath (transparent
      // PNGs would peek through otherwise).
      expect(root.className).not.toContain('bg-primary-100');
    });
  });

  describe('overrides', () => {
    it('appends sx to the root', () => {
      const { container } = render(<Avatar name="x" sx="ring-4 ring-purple-500" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('ring-purple-500');
    });

    it('appends className to the root', () => {
      const { container } = render(<Avatar name="x" className="my-custom" />);
      const root = container.firstElementChild!;
      expect(root.className).toContain('my-custom');
    });
  });
});

describe('<AvatarGroup>', () => {
  it('renders all children when total ≤ max', () => {
    const { container } = render(
      <AvatarGroup max={5}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
      </AvatarGroup>
    );
    // 3 avatars rendered, no overflow indicator
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars.length).toBe(3);
  });

  it('slices to max and renders overflow indicator', () => {
    const { container } = render(
      <AvatarGroup max={3}>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
        <Avatar name="E" />
      </AvatarGroup>
    );
    // 3 visible + 1 overflow indicator
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars.length).toBe(4);
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('default max=4 — 5th avatar collapses', () => {
    render(
      <AvatarGroup>
        <Avatar name="A" />
        <Avatar name="B" />
        <Avatar name="C" />
        <Avatar name="D" />
        <Avatar name="E" />
      </AvatarGroup>
    );
    expect(screen.getByText('+1')).toBeTruthy();
  });

  it('applies negative spacing class to the wrapper', () => {
    const { container } = render(
      <AvatarGroup spacing="md">
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain('-space-x-3');
  });

  it('propagates size to children when they do not override', () => {
    const { container } = render(
      <AvatarGroup size="xl">
        <Avatar name="A" />
        <Avatar name="B" size="sm" />
      </AvatarGroup>
    );
    const avatars = container.querySelectorAll('[role="img"]');
    // First child inherits xl
    expect(avatars[0]!.className).toContain('w-16');
    // Second child preserves sm
    expect(avatars[1]!.className).toContain('w-7');
  });

  it('applies ring-2 halo when withRing=true (default)', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars[0]!.className).toContain('ring-2');
    // Ring uses the auto-inverting neutral-50 token (NOT
    // `ring-white dark:ring-neutral-N` — that would violate the
    // theme-identity rule for the neutral palette).
    expect(avatars[0]!.className).toContain('ring-neutral-50');
  });

  it('omits ring when withRing=false', () => {
    const { container } = render(
      <AvatarGroup withRing={false}>
        <Avatar name="A" />
        <Avatar name="B" />
      </AvatarGroup>
    );
    const avatars = container.querySelectorAll('[role="img"]');
    expect(avatars[0]!.className).not.toContain('ring-2');
  });
});
