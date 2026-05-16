import { cn } from '../../utils/cn.js';
import { topBarVariants } from './topBar.variants.js';
import type { TopBarProps } from './topBar.types.js';

/**
 * Dashforge TW TopBar — sticky header with 3 named slots.
 *
 * Pure composition. Three regions arranged horizontally:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ start   │           center                  │      end   │
 *   └──────────────────────────────────────────────────────────┘
 *
 * - `start` and `end` shrink to content.
 * - `center` grows to fill remaining space.
 * - If you pass `children` instead of `center`, those children render
 *   in the center region — handy for terse JSX:
 *
 *   ```tsx
 *   <TopBar start={<Logo />} end={<UserMenu />}>
 *     <Breadcrumbs items={trail} />
 *   </TopBar>
 *   ```
 *
 * Default renders as `<header role="banner">` (implicit from
 * `<header>` as a top-level landmark). Pass `asDiv` for cases where
 * you don't want the banner role (e.g., nested inside another header).
 *
 * **A11y**:
 *   - `<header>` is a banner landmark — only one per page; if you put
 *     multiple TopBars on a page, use `asDiv` on the secondary ones.
 *   - Slots are agnostic about ARIA — wrap your slot content with
 *     appropriate roles (`<nav>`, `<search>`, etc.) where needed.
 */
export function TopBar(props: TopBarProps) {
  const {
    start,
    center,
    end,
    children,
    height,
    sticky,
    asDiv,
    sx,
    slotProps,
  } = props;

  const v = topBarVariants({ height, sticky });
  const Tag = (asDiv ? 'div' : 'header') as 'header';

  return (
    <Tag className={cn(v.root(), sx, slotProps?.root?.className)}>
      {(start != null) && (
        <div className={cn(v.start(), slotProps?.start?.className)}>
          {start}
        </div>
      )}
      <div className={cn(v.center(), slotProps?.center?.className)}>
        {center ?? children}
      </div>
      {(end != null) && (
        <div className={cn(v.end(), slotProps?.end?.className)}>{end}</div>
      )}
    </Tag>
  );
}
