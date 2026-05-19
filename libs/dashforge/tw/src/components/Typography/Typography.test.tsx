// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Typography } from './Typography.js';

/**
 * Suite mirrors the Button.test.tsx shape (rendering · variants · color ·
 * override · polymorphism) so the test surface is uniform across the
 * package.
 *
 * Strategy: render → query → assert on `tagName` (for HTML-element
 * resolution) and `className` (for variant resolution). We deliberately
 * DON'T snapshot: snapshots churn on every variant-class edit and offer
 * no signal on the actual contract — the contract is "this variant
 * emits THESE specific Tailwind utility classes", which we assert
 * positively below.
 */
describe('<Typography>', () => {
  // ─── Rendering / default tag mapping ────────────────────────────────
  describe('default tag mapping', () => {
    it('renders <p> for body1 by default', () => {
      const { container } = render(<Typography>hello</Typography>);
      expect(container.firstElementChild?.tagName).toBe('P');
    });

    it('renders <h1> for variant="h1"', () => {
      const { container } = render(<Typography variant="h1">title</Typography>);
      expect(container.firstElementChild?.tagName).toBe('H1');
    });

    it('renders <h3> for variant="h3"', () => {
      const { container } = render(<Typography variant="h3">title</Typography>);
      expect(container.firstElementChild?.tagName).toBe('H3');
    });

    it('renders <span> for variant="caption"', () => {
      const { container } = render(<Typography variant="caption">note</Typography>);
      expect(container.firstElementChild?.tagName).toBe('SPAN');
    });

    it('renders <span> for variant="overline"', () => {
      const { container } = render(<Typography variant="overline">label</Typography>);
      expect(container.firstElementChild?.tagName).toBe('SPAN');
    });
  });

  // ─── Variant classes ────────────────────────────────────────────────
  describe('variant → utility chain', () => {
    it('h1 has text-5xl + font-bold', () => {
      const { container } = render(<Typography variant="h1">x</Typography>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('text-5xl');
      expect(cls).toContain('font-bold');
    });

    it('body2 has text-sm', () => {
      const { container } = render(<Typography variant="body2">x</Typography>);
      expect(container.firstElementChild?.className).toContain('text-sm');
    });

    it('overline has uppercase + tracking', () => {
      const { container } = render(<Typography variant="overline">x</Typography>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('uppercase');
      expect(cls).toMatch(/tracking-\[/);
    });
  });

  // ─── Color intent ───────────────────────────────────────────────────
  describe('color', () => {
    it('color="primary" emits text-primary-* with dark variant', () => {
      const { container } = render(<Typography color="primary">x</Typography>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('text-primary-700');
      expect(cls).toContain('dark:text-primary-400');
    });

    it('color="danger" emits text-danger-*', () => {
      const { container } = render(<Typography color="danger">x</Typography>);
      expect(container.firstElementChild?.className).toContain('text-danger-700');
    });

    it('color="inherit" emits text-inherit', () => {
      const { container } = render(<Typography color="inherit">x</Typography>);
      expect(container.firstElementChild?.className).toContain('text-inherit');
    });
  });

  // ─── Override semantics ─────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults via tailwind-merge', () => {
      const { container } = render(
        <Typography variant="h1" color="primary" sx="text-pink-500">x</Typography>,
      );
      const cls = container.firstElementChild?.className ?? '';
      // tailwind-merge collapses the conflicting `text-*` colour to the last one
      expect(cls).toContain('text-pink-500');
      expect(cls).not.toContain('text-primary-700');
    });

    it('weight prop overrides variant default weight', () => {
      const { container } = render(<Typography variant="h1" weight="normal">x</Typography>);
      const cls = container.firstElementChild?.className ?? '';
      // h1's default `font-bold` is dropped by tailwind-merge, replaced by font-normal
      expect(cls).toContain('font-normal');
      expect(cls).not.toContain('font-bold');
    });

    it('truncate adds the truncate utility', () => {
      const { container } = render(<Typography truncate>x</Typography>);
      expect(container.firstElementChild?.className).toContain('truncate');
    });

    it('gutterBottom adds mb-3', () => {
      const { container } = render(<Typography gutterBottom>x</Typography>);
      expect(container.firstElementChild?.className).toContain('mb-3');
    });
  });

  // ─── Polymorphism — `as` and `asChild` ───────────────────────────────
  describe('polymorphism', () => {
    it('as="section" overrides the variant-default tag', () => {
      const { container } = render(
        <Typography variant="h1" as="section">x</Typography>,
      );
      expect(container.firstElementChild?.tagName).toBe('SECTION');
    });

    it('asChild renders the single child element with merged className', () => {
      const { container } = render(
        <Typography variant="h2" color="primary" asChild>
          <a href="#">link</a>
        </Typography>,
      );
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('A');
      expect(el?.className).toContain('text-4xl');
      expect(el?.className).toContain('text-primary-700');
      expect(el?.getAttribute('href')).toBe('#');
    });

    it('asChild wins over `as` when both are passed', () => {
      const { container } = render(
        <Typography variant="h1" as="section" asChild>
          <article>x</article>
        </Typography>,
      );
      // Slot renders the child element, ignoring `as`
      expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  describe('pass-through props', () => {
    it('forwards data-* attributes', () => {
      const { container } = render(
        <Typography data-testid="typo">x</Typography>,
      );
      expect(container.firstElementChild?.getAttribute('data-testid')).toBe('typo');
    });

    it('forwards aria-label', () => {
      const { container } = render(
        <Typography aria-label="heading">x</Typography>,
      );
      expect(container.firstElementChild?.getAttribute('aria-label')).toBe('heading');
    });
  });

  // ─── F11-bis edge cases ─────────────────────────────────────────────
  describe('multi-axis combinations', () => {
    it('variant=h2 + color=primary + weight=normal + align=center + truncate + gutterBottom', () => {
      const { container } = render(
        <Typography
          variant="h2"
          color="primary"
          weight="normal"
          align="center"
          truncate
          gutterBottom
        >
          x
        </Typography>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('text-4xl');           // h2 size
      expect(cls).toContain('text-primary-700');   // color intent
      expect(cls).toContain('font-normal');        // weight override (vs h2 default font-bold)
      expect(cls).not.toContain('font-bold');      // overridden
      expect(cls).toContain('text-center');        // align
      expect(cls).toContain('truncate');           // truncate
      expect(cls).toContain('mb-3');               // gutterBottom
    });

    it('noWrap + truncate: truncate wins (later in chain, tailwind-merge collapses whitespace-nowrap)', () => {
      const { container } = render(<Typography noWrap truncate>x</Typography>);
      // truncate utility already includes whitespace-nowrap — tailwind-merge
      // collapses the redundant nowrap from noWrap
      expect(container.firstElementChild?.className).toContain('truncate');
    });

    it('every variant maps to its expected default tag', () => {
      const cases: Array<[Parameters<typeof Typography>[0]['variant'], string]> = [
        ['h1', 'H1'], ['h2', 'H2'], ['h3', 'H3'], ['h4', 'H4'], ['h5', 'H5'], ['h6', 'H6'],
        ['subtitle1', 'P'], ['subtitle2', 'P'],
        ['body1', 'P'], ['body2', 'P'],
        ['caption', 'SPAN'], ['overline', 'SPAN'],
      ];
      cases.forEach(([variant, tag]) => {
        const { container } = render(<Typography variant={variant}>x</Typography>);
        expect(container.firstElementChild?.tagName).toBe(tag);
      });
    });
  });

  describe('color edge cases', () => {
    const INTENTS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'muted'] as const;
    it.each(INTENTS)('color="%s" emits the right text-* + dark pair', (color) => {
      const { container } = render(<Typography color={color}>x</Typography>);
      const cls = container.firstElementChild?.className ?? '';
      if (color === 'muted') {
        // Sprint 4.3 identity sweep: neutral palette auto-inverts via
        // CSS-var swap — no `dark:` variant needed.
        expect(cls).toContain('text-neutral-600');
        expect(cls).not.toContain('dark:text-neutral-');
      } else {
        expect(cls).toContain(`text-${color}-700`);
        expect(cls).toContain(`dark:text-${color}-400`);
      }
    });
  });
});
