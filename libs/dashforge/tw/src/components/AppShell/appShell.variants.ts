import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Tailwind-variants recipe for `<AppShell>`.
 *
 * Slots:
 *   - `root`      — outer flex column
 *   - `header`    — top region
 *   - `body`      — flex row holding nav + main
 *   - `nav`       — desktop nav rail (md+)
 *   - `navMobile` — mobile drawer (slide-in)
 *   - `main`      — content area
 *   - `footer`    — bottom region
 *   - `backdrop`  — semi-opaque overlay behind the mobile drawer
 *
 * Which element scrolls is decided by the `layout` axis, NOT by the
 * slots. Before BUG 27 it was decided by neither: `root` carried
 * `min-h-screen` while `main` carried `overflow-y-auto`, which describe
 * two different layouts, and `min-h-screen` won. The root grew with the
 * content, the window scrolled, and `main` never overflowed, so its
 * `overflow-y-auto` was dead on every page long enough to need it.
 */
export const appShellVariants = tv({
  slots: {
    root: 'flex flex-col bg-neutral-100',
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
    main: 'flex-1 min-w-0',
    footer: 'shrink-0',
    backdrop: [
      'md:hidden fixed inset-0 z-30 bg-black/40',
      // Backdrop opacity fade — micro motion, gated for consistency.
      'transition-opacity duration-200 motion-reduce:transition-none motion-reduce:duration-0',
      'opacity-0 pointer-events-none',
    ],
  },
  variants: {
    /*
     * Both shells are legitimate, so this is an axis rather than a
     * decision baked into the slots. See README-BUG § BUG 27.
     *
     * `viewport` — the shell fills the window and `main` scrolls inside
     *   it, so header, nav and footer stay put. This is the layout the
     *   component's own header diagram draws and the one
     *   `main: overflow-y-auto` was written for, so it is the default.
     *
     * `page` — the window scrolls and the whole shell moves with it,
     *   which is what a marketing-style shell wants. `main` gets no
     *   overflow here: it could never be the scroller in this mode, and
     *   advertising one is how the two ended up contradicting.
     */
    layout: {
      viewport: {
        /*
         * `h-dvh`, never `h-screen`. `100vh` is the height the screen
         * has only while a phone's address bar is hidden, so `h-screen`
         * yields a shell taller than the window and the page scrolls
         * again, on exactly the devices where that is worst.
         */
        root: 'h-dvh overflow-hidden',
        // Fixed must not mean clipped: on a short screen the last nav
        // items have to stay reachable.
        nav: 'overflow-y-auto',
        main: 'overflow-y-auto',
      },
      page: {
        root: 'min-h-screen',
      },
    },
    navOpen: {
      true: {
        navMobile: 'translate-x-0',
        backdrop: 'opacity-100 pointer-events-auto',
      },
    },
  },
  defaultVariants: {
    layout: 'viewport',
    navOpen: false,
  },
});

export type AppShellVariants = VariantProps<typeof appShellVariants>;
