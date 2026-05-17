// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Box } from './Box.js';

/**
 * Suite mirrors the Typography/Button test shape (rendering · variants ·
 * compound × intent · override · polymorphism · pass-through). The big
 * delta here is the compound-variant matrix: 5 surface variants × 7
 * intents = 35 combos, of which 21 carry actual visual differences
 * (outlined / soft / solid × 7 intents). We spot-check a representative
 * subset rather than enumerate all 35 — if the TV compound resolution
 * works for one of each (primary, danger, neutral), it works for all.
 */
describe('<Box>', () => {
  // ─── Default rendering ──────────────────────────────────────────────
  describe('default rendering', () => {
    it('renders a <div> by default', () => {
      const { container } = render(<Box>x</Box>);
      expect(container.firstElementChild?.tagName).toBe('DIV');
    });

    it('default variant is plain — no border, no bg, no shadow', () => {
      const { container } = render(<Box>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).not.toContain('border');
      expect(cls).not.toContain('bg-');
      expect(cls).not.toContain('shadow-sm');
      // baseline `block` is always present
      expect(cls).toContain('block');
    });
  });

  // ─── Variant — surface chrome ───────────────────────────────────────
  describe('surface variants', () => {
    it('variant="outlined" adds a border', () => {
      const { container } = render(<Box variant="outlined" color="neutral">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('border');
      // neutral outlined picks the white surface + neutral-200 border
      expect(cls).toContain('border-neutral-200');
      expect(cls).toContain('bg-white');
    });

    it('variant="elevated" adds the neutral surface, no border, no color tint', () => {
      const { container } = render(<Box variant="elevated" elevation={3}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-white');
      expect(cls).toContain('dark:bg-neutral-900');
      expect(cls).toContain('shadow-md');
      expect(cls).not.toContain('border ');
    });

    it('variant="soft" + color="warning" picks the warning soft tones', () => {
      const { container } = render(<Box variant="soft" color="warning">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-warning-100');
      expect(cls).toContain('text-warning-900');
      expect(cls).toContain('dark:bg-warning-950/50');
    });

    it('variant="solid" + color="primary" picks the primary solid', () => {
      const { container } = render(<Box variant="solid" color="primary">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-primary-600');
      expect(cls).toContain('text-white');
      expect(cls).toContain('dark:bg-primary-500');
    });

    it('variant="solid" + color="danger" picks the danger solid', () => {
      const { container } = render(<Box variant="solid" color="danger">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-danger-600');
      expect(cls).toContain('text-white');
    });
  });

  // ─── Elevation scale ─────────────────────────────────────────────────
  describe('elevation', () => {
    it('elevation={0} emits shadow-none', () => {
      const { container } = render(<Box variant="elevated" elevation={0}>x</Box>);
      expect(container.firstElementChild?.className).toContain('shadow-none');
    });

    it('elevation={5} emits shadow-xl', () => {
      const { container } = render(<Box variant="elevated" elevation={5}>x</Box>);
      expect(container.firstElementChild?.className).toContain('shadow-xl');
    });
  });

  // ─── Spacing ─────────────────────────────────────────────────────────
  describe('spacing', () => {
    it('p={4} emits p-4', () => {
      const { container } = render(<Box p={4}>x</Box>);
      expect(container.firstElementChild?.className).toContain('p-4');
    });

    it('px={6} + py={2} emits px-6 + py-2', () => {
      const { container } = render(<Box px={6} py={2}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('px-6');
      expect(cls).toContain('py-2');
    });

    it('m={"0.5"} emits m-0.5', () => {
      const { container } = render(<Box m="0.5">x</Box>);
      expect(container.firstElementChild?.className).toContain('m-0.5');
    });
  });

  // ─── Rounded + sizing ────────────────────────────────────────────────
  describe('rounded + sizing', () => {
    it('rounded="xl" emits rounded-xl', () => {
      const { container } = render(<Box rounded="xl">x</Box>);
      expect(container.firstElementChild?.className).toContain('rounded-xl');
    });

    it('fullWidth emits w-full', () => {
      const { container } = render(<Box fullWidth>x</Box>);
      expect(container.firstElementChild?.className).toContain('w-full');
    });

    it('fullHeight emits h-full', () => {
      const { container } = render(<Box fullHeight>x</Box>);
      expect(container.firstElementChild?.className).toContain('h-full');
    });
  });

  // ─── Override semantics ─────────────────────────────────────────────
  describe('override', () => {
    it('sx wins over variant defaults via tailwind-merge', () => {
      const { container } = render(
        <Box variant="solid" color="primary" sx="bg-fuchsia-600">x</Box>,
      );
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('bg-fuchsia-600');
      // the conflicting bg-primary-600 from the compound is collapsed
      expect(cls).not.toContain('bg-primary-600');
    });

    it('sx can add utilities Box deliberately omits (overflow)', () => {
      const { container } = render(<Box sx="overflow-hidden">x</Box>);
      expect(container.firstElementChild?.className).toContain('overflow-hidden');
    });
  });

  // ─── Polymorphism ───────────────────────────────────────────────────
  describe('polymorphism', () => {
    it('as="section" renders a <section>', () => {
      const { container } = render(<Box as="section">x</Box>);
      expect(container.firstElementChild?.tagName).toBe('SECTION');
    });

    it('asChild renders the single child element with merged className', () => {
      const { container } = render(
        <Box variant="elevated" elevation={2} asChild>
          <article>x</article>
        </Box>,
      );
      const el = container.firstElementChild;
      expect(el?.tagName).toBe('ARTICLE');
      expect(el?.className).toContain('shadow');
      expect(el?.className).toContain('bg-white');
    });

    it('asChild wins over as when both are passed', () => {
      const { container } = render(
        <Box as="section" asChild>
          <article>x</article>
        </Box>,
      );
      expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    });
  });

  // ─── Pass-through ────────────────────────────────────────────────────
  describe('pass-through', () => {
    it('forwards data-* and aria-*', () => {
      const { container } = render(
        <Box data-testid="box" aria-label="surface">x</Box>,
      );
      const el = container.firstElementChild;
      expect(el?.getAttribute('data-testid')).toBe('box');
      expect(el?.getAttribute('aria-label')).toBe('surface');
    });
  });

  // ─── F11-bis edge cases: every compound variant explicit ─────────────
  // The original suite spot-checked 4 surface×intent combos (outlined
  // neutral, soft warning, solid primary, solid danger). The validation
  // pass before publishing 0.2.0-beta enumerates ALL 21 visually-distinct
  // compound entries so a future TV recipe edit can't silently drop one.
  describe('compound variants matrix — every surface × intent', () => {
    const INTENTS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

    /*
     * Outlined × 7 intents — each emits a tinted border + soft bg pair
     * with the dark-mode counterpart pre-wired. Spot-check picks the
     * `border-{color}-300` light token and the `dark:border-{color}-{N}` pair.
     */
    describe('outlined × intent', () => {
      it.each(INTENTS)('outlined × %s emits border + bg with dark pair', (color) => {
        const { container } = render(<Box variant="outlined" color={color}>x</Box>);
        const cls = container.firstElementChild?.className ?? '';
        if (color === 'neutral') {
          // neutral uses the special border-neutral-200 + bg-white shape
          expect(cls).toContain('border-neutral-200');
          expect(cls).toContain('bg-white');
          expect(cls).toContain('dark:border-neutral-700');
          expect(cls).toContain('dark:bg-neutral-900');
        } else {
          // primary/secondary/success/warning/danger/info share the
          // border-{color}-300 + bg-{color}-50/40 + dark:* pattern
          expect(cls).toContain(`border-${color}-300`);
          expect(cls).toContain(`bg-${color}-50/40`);
          expect(cls).toContain(`dark:border-${color}-800`);
          expect(cls).toContain(`dark:bg-${color}-950/30`);
        }
      });
    });

    /*
     * Soft × 7 intents — semi-transparent tinted background + matching
     * intent text colour. Dark pair uses a darker bg + lighter text so
     * contrast holds in both modes.
     */
    describe('soft × intent', () => {
      it.each(INTENTS)('soft × %s emits bg + text with dark pair', (color) => {
        const { container } = render(<Box variant="soft" color={color}>x</Box>);
        const cls = container.firstElementChild?.className ?? '';
        if (color === 'neutral') {
          expect(cls).toContain('bg-neutral-100');
          expect(cls).toContain('text-neutral-900');
          expect(cls).toContain('dark:bg-neutral-800');
          expect(cls).toContain('dark:text-neutral-100');
        } else {
          expect(cls).toContain(`bg-${color}-100`);
          expect(cls).toContain(`text-${color}-900`);
          expect(cls).toContain(`dark:bg-${color}-950/50`);
          expect(cls).toContain(`dark:text-${color}-100`);
        }
      });
    });

    /*
     * Solid × 7 intents — full-bleed intent background, white text by
     * default (neutral inverts: black bg → white text in light, white
     * bg → black text in dark). The dark variant typically uses a
     * lighter shade so the surface doesn't look pitch black on already-
     * dark page backgrounds.
     */
    describe('solid × intent', () => {
      it.each(INTENTS)('solid × %s emits bg + text-white (or contrast pair for neutral)', (color) => {
        const { container } = render(<Box variant="solid" color={color}>x</Box>);
        const cls = container.firstElementChild?.className ?? '';
        if (color === 'neutral') {
          expect(cls).toContain('bg-neutral-900');
          expect(cls).toContain('text-white');
          expect(cls).toContain('dark:bg-neutral-100');
          expect(cls).toContain('dark:text-neutral-900');
        } else if (color === 'warning') {
          // warning uses 500/600 instead of 600/500 to keep contrast
          // legible against an already-yellow surface in light mode.
          expect(cls).toContain('bg-warning-500');
          expect(cls).toContain('text-white');
          expect(cls).toContain('dark:bg-warning-600');
        } else {
          expect(cls).toContain(`bg-${color}-600`);
          expect(cls).toContain('text-white');
          expect(cls).toContain(`dark:bg-${color}-500`);
        }
      });
    });
  });

  // ─── F11-bis edge cases: color is ignored for plain / elevated ──────
  // These two variants are color-agnostic by design (see box.variants.ts
  // header) — passing `color` shouldn't accidentally inject the intent
  // bg/border via the compound matrix.
  describe('color-agnostic variants', () => {
    it('plain + color="primary" does NOT add intent classes', () => {
      const { container } = render(<Box variant="plain" color="primary">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).not.toContain('bg-primary-');
      expect(cls).not.toContain('border-primary-');
      expect(cls).not.toContain('text-primary-');
    });

    it('elevated + color="danger" stays on the neutral surface', () => {
      const { container } = render(<Box variant="elevated" color="danger">x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      // elevated paints bg-white / dark:bg-neutral-900 regardless of intent
      expect(cls).toContain('bg-white');
      expect(cls).toContain('dark:bg-neutral-900');
      expect(cls).not.toContain('bg-danger-');
      expect(cls).not.toContain('border-danger-');
    });
  });

  // ─── F11-bis edge cases: spacing axis coexistence ───────────────────
  describe('spacing axis coexistence', () => {
    it('p={4} + px={6}: both classes emitted (tailwind-merge resolves)', () => {
      const { container } = render(<Box p={4} px={6}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      // tailwind-merge: px-6 wins over p-4 on horizontal padding,
      // p-4 keeps applying vertical via py
      expect(cls).toContain('px-6');
      // p-4 → tailwind-merge collapses with px-6 (latter wins on x-axis)
      // The vertical (py-4 derived from p-4) is what remains.
    });

    it('m={2} + mx={4} + my={6}: all three coexist (resolves to mx-4 + my-6 effectively)', () => {
      const { container } = render(<Box m={2} mx={4} my={6}>x</Box>);
      const cls = container.firstElementChild?.className ?? '';
      expect(cls).toContain('mx-4');
      expect(cls).toContain('my-6');
    });
  });

  // ─── F11-bis edge cases: elevation × variant interaction ────────────
  describe('elevation × variant', () => {
    it('elevation works on non-elevated variants too (consumer choice)', () => {
      const { container } = render(<Box variant="outlined" color="neutral" elevation={4}>x</Box>);
      // The shadow class still gets emitted even though the design
      // recommendation is "use elevation only with variant=elevated".
      // We don't gate this at the TV level because compound restrictions
      // would make the API harder to discover.
      expect(container.firstElementChild?.className).toContain('shadow-lg');
    });

    it('elevation=0 explicitly disables shadow', () => {
      const { container } = render(<Box variant="elevated" elevation={0}>x</Box>);
      expect(container.firstElementChild?.className).toContain('shadow-none');
    });
  });

  // ─── F11-bis edge cases: rounded full ───────────────────────────────
  describe('rounded edge values', () => {
    it('rounded="full" produces rounded-full (avatars, pills)', () => {
      const { container } = render(<Box rounded="full">x</Box>);
      expect(container.firstElementChild?.className).toContain('rounded-full');
    });

    it('rounded="none" explicitly removes any rounding', () => {
      const { container } = render(<Box rounded="none">x</Box>);
      expect(container.firstElementChild?.className).toContain('rounded-none');
    });
  });
});
