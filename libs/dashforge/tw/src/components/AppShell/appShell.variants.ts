import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<AppShell>`.
 *
 * Slots:
 *   - `root`      — outer flex column (full viewport)
 *   - `header`    — top region
 *   - `body`      — flex row holding nav + main
 *   - `nav`       — desktop nav rail (md+)
 *   - `navMobile` — mobile drawer (slide-in)
 *   - `main`      — scrollable content area
 *   - `footer`    — bottom region
 *   - `backdrop`  — semi-opaque overlay behind the mobile drawer
 */
export const appShellVariants = tv({
  slots: {
    root: 'flex flex-col min-h-screen bg-neutral-100',
    header: 'shrink-0',
    body: 'flex flex-1 min-h-0',
    nav: 'hidden md:flex shrink-0',
    navMobile: [
      'flex md:hidden fixed inset-y-0 left-0 z-40',
      // Drawer slide-in is the most prominent motion in AppShell and
      // a clear WCAG 2.3.3 candidate. Gate the transition on
      // `prefers-reduced-motion: no-preference`; the data-driven
      // `-translate-x-full` / `translate-x-0` still applies, just
      // without the smooth slide.
      'transition-transform duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0',
      '-translate-x-full',
    ],
    main: 'flex-1 min-w-0 overflow-y-auto',
    footer: 'shrink-0',
    backdrop: [
      'md:hidden fixed inset-0 z-30 bg-black/40',
      // Backdrop opacity fade — micro motion, gated for consistency.
      'transition-opacity duration-200 motion-reduce:transition-none motion-reduce:duration-0',
      'opacity-0 pointer-events-none',
    ],
  },
  variants: {
    navOpen: {
      true: {
        navMobile: 'translate-x-0',
        backdrop: 'opacity-100 pointer-events-auto',
      },
    },
  },
  defaultVariants: {
    navOpen: false,
  },
});

export type AppShellVariants = VariantProps<typeof appShellVariants>;
