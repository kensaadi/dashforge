// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Divider } from './Divider.js';

describe('<Divider>', () => {
  // ─── Line-only mode ─────────────────────────────────────────────────
  describe('line-only (no children)', () => {
    it('renders <hr> for horizontal', () => {
      const { container } = render(<Divider />);
      expect(container.firstElementChild?.tagName).toBe('HR');
    });

    it('renders <div role="separator"> for vertical', () => {
      const { container } = render(<Divider orientation="vertical" />);
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('DIV');
      expect(el?.getAttribute('role')).toBe('separator');
    });

    it('sets aria-orientation correctly', () => {
      const { container: ch } = render(<Divider />);
      expect(ch.firstElementChild?.getAttribute('aria-orientation')).toBe('horizontal');

      const { container: cv } = render(<Divider orientation="vertical" />);
      expect(cv.firstElementChild?.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('horizontal applies border-t (line carrier)', () => {
      const { container } = render(<Divider />);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border-t');
    });

    it('vertical applies border-l', () => {
      const { container } = render(<Divider orientation="vertical" />);
      expect(container.firstElementChild?.className).toContain('border-l');
    });

    it('strips <hr> UA default via border-0', () => {
      const { container } = render(<Divider />);
      expect(container.firstElementChild?.className).toContain('border-0');
    });
  });

  // ─── Variants — line style ──────────────────────────────────────────
  describe('variant', () => {
    it('default solid', () => {
      const { container } = render(<Divider />);
      expect(container.firstElementChild?.className).toContain('border-solid');
    });

    it('dashed', () => {
      const { container } = render(<Divider variant="dashed" />);
      expect(container.firstElementChild?.className).toContain('border-dashed');
    });

    it('dotted', () => {
      const { container } = render(<Divider variant="dotted" />);
      expect(container.firstElementChild?.className).toContain('border-dotted');
    });
  });

  // ─── Color intent ───────────────────────────────────────────────────
  describe('color', () => {
    it('default neutral', () => {
      const { container } = render(<Divider />);
      const cls = container.firstElementChild?.className ?? '';
      // Sprint 4.3 identity sweep: neutral palette auto-inverts via
      // the dashforgePreset() CSS-var swap — no `dark:` needed.
      expect(cls).toContain('border-neutral-200');
      expect(cls).not.toContain('dark:border-neutral-');
    });

    it('color="primary"', () => {
      const { container } = render(<Divider color="primary" />);
      expect(container.firstElementChild?.className).toContain('border-primary-300');
    });

    it('color="danger"', () => {
      const { container } = render(<Divider color="danger" />);
      expect(container.firstElementChild?.className).toContain('border-danger-300');
    });
  });

  // ─── Labeled mode ───────────────────────────────────────────────────
  describe('labeled (with children)', () => {
    it('renders 3 children: line, label, line', () => {
      const { container } = render(<Divider>OR</Divider>);
      const root = container.firstElementChild;
      expect(root?.children.length).toBe(3);
    });

    it('label text is preserved', () => {
      const { container } = render(<Divider>OR</Divider>);
      expect(container.firstElementChild?.textContent).toBe('OR');
    });

    it('root has role="separator" + aria-orientation', () => {
      const { container } = render(<Divider>OR</Divider>);
      const root = container.firstElementChild;
      expect(root?.getAttribute('role')).toBe('separator');
      expect(root?.getAttribute('aria-orientation')).toBe('horizontal');
    });

    it('line segments are aria-hidden (separator role is on the root)', () => {
      const { container } = render(<Divider>OR</Divider>);
      const lines = container.firstElementChild?.querySelectorAll('span[aria-hidden]');
      expect(lines?.length).toBe(2);
    });

    it('center alignment: both segments flex-1', () => {
      const { container } = render(<Divider align="center">OR</Divider>);
      const lines = container.firstElementChild?.querySelectorAll('span[aria-hidden]');
      lines?.forEach((line) => {
        expect(line.className).toContain('flex-1');
      });
    });

    it('start alignment: left segment is short stub', () => {
      const { container } = render(<Divider align="start">OR</Divider>);
      const lines = container.firstElementChild?.querySelectorAll('span[aria-hidden]');
      expect(lines?.[0].className).toContain('basis-8');
      expect(lines?.[1].className).toContain('flex-1');
    });

    it('end alignment: right segment is short stub', () => {
      const { container } = render(<Divider align="end">OR</Divider>);
      const lines = container.firstElementChild?.querySelectorAll('span[aria-hidden]');
      expect(lines?.[0].className).toContain('flex-1');
      expect(lines?.[1].className).toContain('basis-8');
    });

    it('label gets shrink-0 + padding so it does not collapse', () => {
      const { container } = render(<Divider>Hello</Divider>);
      const label = container.firstElementChild?.children[1] as HTMLElement;
      expect(label.className).toContain('shrink-0');
      expect(label.className).toContain('px-3');
    });

    it('color applies to both segments in labeled mode', () => {
      const { container } = render(<Divider color="primary">OR</Divider>);
      const lines = container.firstElementChild?.querySelectorAll('span[aria-hidden]');
      lines?.forEach((line) => {
        expect(line.className).toContain('border-primary-300');
      });
    });

    it('renders complex children (JSX)', () => {
      const { container } = render(
        <Divider>
          <strong>Section title</strong>
        </Divider>,
      );
      const label = container.firstElementChild?.children[1];
      expect(label?.querySelector('strong')?.textContent).toBe('Section title');
    });
  });

  // ─── Override ───────────────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults', () => {
      const { container } = render(<Divider sx="border-t-4" />);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border-t-4');
      // tailwind-merge collapses border-t → border-t-4
      expect(cls).not.toMatch(/border-t (?!-)/);
    });

    it('sx applies on root in labeled mode', () => {
      const { container } = render(<Divider sx="my-8">OR</Divider>);
      expect(container.firstElementChild?.className).toContain('my-8');
    });
  });

  // ─── Pass-through ───────────────────────────────────────────────────
  describe('pass-through', () => {
    it('forwards data-* on root', () => {
      const { container } = render(<Divider data-testid="d" />);
      expect(container.firstElementChild?.getAttribute('data-testid')).toBe('d');
    });

    it('forwards data-* in labeled mode too', () => {
      const { container } = render(<Divider data-testid="d">OR</Divider>);
      expect(container.firstElementChild?.getAttribute('data-testid')).toBe('d');
    });
  });

  // ─── F11-bis edge cases ─────────────────────────────────────────────
  describe('color — every intent', () => {
    const INTENTS = ['secondary', 'success', 'warning', 'danger', 'info'] as const;
    it.each(INTENTS)('color="%s" emits border-%s-300 with dark pair', (color) => {
      const { container } = render(<Divider color={color} />);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain(`border-${color}-300`);
      expect(cls).toContain(`dark:border-${color}-700`);
    });
  });

  describe('vertical labeled mode', () => {
    it('vertical + label renders all 3 children with vertical layout', () => {
      const { container } = render(
        <Divider orientation="vertical">section</Divider>,
      );
      const root = container.firstElementChild;
      expect(root?.tagName).toBe('DIV');
      expect(root?.getAttribute('aria-orientation')).toBe('vertical');
      expect(root?.className).toContain('flex-col');
      expect(root?.children.length).toBe(3);
    });
  });

  describe('label edge values', () => {
    it('numeric label (0) renders correctly', () => {
      const { container } = render(<Divider>{0}</Divider>);
      // 0 is a valid React child, should render as "0"
      expect(container.firstElementChild?.textContent).toBe('0');
    });

    it('JSX with multiple elements as label', () => {
      const { container } = render(
        <Divider>
          <strong>bold</strong>
          <em> italic</em>
        </Divider>,
      );
      const root = container.firstElementChild;
      // root has 3 children (line + label-span + line); label-span has 2 nested
      expect(root?.children.length).toBe(3);
      expect(root?.querySelector('strong')?.textContent).toBe('bold');
      expect(root?.querySelector('em')?.textContent).toBe(' italic');
    });
  });

  describe('flexItem (no-op forward-compat hook)', () => {
    it('flexItem prop does not crash or leak as attribute', () => {
      const { container } = render(<Divider flexItem />);
      const el = container.firstElementChild as HTMLElement;
      expect(el.hasAttribute('flexitem')).toBe(false);
      expect(el.hasAttribute('flexItem')).toBe(false);
    });
  });

  // #112 (G-28) — untyped className snuck in via spread must NOT clobber
  // the variant chain via JSX last-wins prop override. Applies to all
  // three render paths (horizontal line, vertical line, labeled).
  describe('#112 (G-28) className sneak-in safety net', () => {
    it('horizontal line-only preserves variant classes with smuggled className', () => {
      const smuggled = { className: 'my-4' } as Record<string, unknown>;
      const { container } = render(
        <Divider orientation="horizontal" {...(smuggled as never)} />,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border-t');
      expect(cls).toContain('my-4');
    });

    it('vertical line-only preserves variant classes with smuggled className', () => {
      const smuggled = { className: 'mx-4' } as Record<string, unknown>;
      const { container } = render(
        <Divider orientation="vertical" {...(smuggled as never)} />,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border-l');
      expect(cls).toContain('mx-4');
    });

    it('labeled preserves variant classes with smuggled className', () => {
      const smuggled = { className: 'my-8' } as Record<string, unknown>;
      const { container } = render(
        <Divider {...(smuggled as never)}>Section</Divider>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('flex');
      expect(cls).toContain('my-8');
    });
  });
});
