import type { ReactNode } from 'react';
import { cn } from '../../../utils/cn.js';

export interface RenderTwoLineProps {
  primary: ReactNode;
  secondary: ReactNode;
  className?: string;
}

/**
 * Two-line cell renderer: a bold primary line stacked above a muted
 * secondary line. Useful for `Name + email`, `Title + ID`, etc.
 *
 * Replaces the MUI-side `RenderTwoLineCell` without the magic-number
 * vertical-align fudges (`mt: 0.8 / 0.2`) — flexbox handles the
 * vertical layout cleanly.
 *
 * Dashforge identity rule: text colors auto-invert via the
 * `dashforgePreset()` CSS-variable swap. No `dark:` variants needed
 * on neutral palette.
 */
export function RenderTwoLine(props: RenderTwoLineProps) {
  const { primary, secondary, className } = props;
  return (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span className="font-medium text-neutral-900">
        {primary}
      </span>
      <span className="text-xs text-neutral-500 mt-0.5">
        {secondary}
      </span>
    </div>
  );
}
