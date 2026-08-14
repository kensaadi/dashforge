import { tv, type VariantProps } from 'tailwind-variants';

/**
 * `<Video>` variant recipe — the moving-image twin of `imageVariants`.
 *
 * Slots:
 *  - `root`     — positioned wrapper. Holds the `<video>` plus the
 *                 loading skeleton / error-fallback overlays, and owns
 *                 the corner radius + overflow clipping. `relative` so
 *                 the overlays can be `absolute inset-0`.
 *  - `video`    — the `<video>` element. `object-*` (the `fit` axis)
 *                 lives here; `block w-full h-full` so it fills the
 *                 reserved box when an aspect ratio / dimensions are
 *                 given.
 *  - `skeleton` — the loading placeholder overlay (a `<Skeleton>`
 *                 stretched over the reserved box).
 *  - `fallback` — the error overlay shown after `onError`.
 *
 * Variant axes:
 *  - `fit`     — CSS `object-fit`. `cover` (default) crops to fill,
 *                `contain` letterboxes, etc.
 *  - `rounded` — corner radius token, applied to `root` (which clips
 *                the video via `overflow-hidden`).
 *
 * Neutral fallback surface auto-inverts through the dashforge preset's
 * CSS-variable layer (no explicit `dark:`).
 */
export const videoVariants = tv({
  slots: {
    root: ['relative', 'block', 'overflow-hidden'],
    video: ['block', 'w-full', 'h-full'],
    skeleton: ['absolute', 'inset-0', 'h-full', 'w-full'],
    fallback: [
      'absolute',
      'inset-0',
      'flex',
      'items-center',
      'justify-center',
      // Neutral surface — auto-inverts via CSS vars, no `dark:`.
      'bg-neutral-100',
      'text-neutral-400',
    ],
  },
  variants: {
    fit: {
      cover: { video: 'object-cover' },
      contain: { video: 'object-contain' },
      fill: { video: 'object-fill' },
      none: { video: 'object-none' },
      'scale-down': { video: 'object-scale-down' },
    },
    rounded: {
      none: { root: 'rounded-none' },
      sm: { root: 'rounded-sm' },
      md: { root: 'rounded-md' },
      lg: { root: 'rounded-lg' },
      full: { root: 'rounded-full' },
    },
  },
  defaultVariants: {
    fit: 'cover',
    rounded: 'none',
  },
});

export type VideoVariants = VariantProps<typeof videoVariants>;
