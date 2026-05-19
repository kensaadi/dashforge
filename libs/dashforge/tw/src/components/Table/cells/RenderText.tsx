import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn.js';

export interface RenderTextProps {
  value: ReactNode;
  /** Truncate to one line with ellipsis on overflow. @default false */
  truncate?: boolean;
  /** Secondary text color (less prominent). @default false */
  muted?: boolean;
  /** Extra class merged via `tailwind-merge`. */
  className?: string;
}

/**
 * Plain text cell renderer. Wraps the value in a `<span>` and
 * optionally truncates on overflow. Use this for the most common
 * case: render a single string value.
 *
 * The Table component does NOT use this by default for plain
 * string columns — it just renders `{value}` directly. Use
 * `RenderText` when you need the truncate / muted styling.
 */
export function RenderText(props: RenderTextProps) {
  const { value, truncate, muted, className } = props;
  return (
    <span
      className={cn(
        truncate && 'block max-w-full truncate',
        // Neutral palette auto-inverts via dashforgePreset() CSS-var swap.
        muted && 'text-neutral-500',
        className,
      )}
    >
      {value}
    </span>
  );
}
