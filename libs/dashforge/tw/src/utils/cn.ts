import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * className composition helper for Dashforge TW components.
 *
 * Wraps `clsx` (for boolean / object / array compaction) with
 * `tailwind-merge` (for last-wins conflict resolution between
 * conflicting Tailwind utilities). This is the override contract
 * that powers `sx` and `slotProps`:
 *
 * ```tsx
 * cn(buttonVariants({ variant: 'solid', color: 'primary' }), sx)
 * // sx="bg-red-500" beats the variant's `bg-primary-500`.
 * ```
 *
 * Without `tailwind-merge`, Tailwind's stylesheet output order decides
 * who wins, which is unpredictable for consumers and breaks the
 * documented "override always wins" semantics.
 *
 * @example
 * ```tsx
 * <button className={cn('px-4 py-2', isPrimary && 'bg-primary-500')}>
 * cn(['inline-flex', { 'opacity-50': disabled }], extra);
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
