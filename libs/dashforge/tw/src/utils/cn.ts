import clsx, { type ClassValue } from 'clsx';

/**
 * className composition helper.
 *
 * Thin wrapper around `clsx` exposed as the canonical entry point for
 * Dashforge TW components. Using a stable workspace-internal export
 * means we can later swap to `tailwind-merge` (or a Dashforge-specific
 * merger that knows the `dashforgePreset` namespaces) without forcing
 * a breaking change on consumers.
 *
 * @example
 * ```tsx
 * <button className={cn('px-4 py-2', isPrimary && 'bg-primary-500')}>
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
