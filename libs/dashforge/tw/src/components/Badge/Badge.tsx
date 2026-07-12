import { forwardRef, useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import { badgeVariants } from './badge.variants.js';
import type { BadgeProps } from './badge.types.js';

/**
 * Resolve the displayed badge content based on `content`, `max`, and
 * `showZero` props.
 *
 * Returns `null` when nothing should render (omitted content + no dot,
 * or `content=0` without `showZero`). Otherwise returns the string
 * to display (formatted overflow for numbers above `max`).
 *
 * @internal
 */
function resolveDisplayContent(
  content: number | string | undefined,
  max: number,
  showZero: boolean,
  dot: boolean
): string | null {
  // Dot mode — content is irrelevant, badge always shows (unless
  // gated by visibleWhen / access / invisible higher up).
  if (dot) return '';

  // No content + no dot → nothing to render.
  if (content === undefined || content === null) return null;

  // Numeric content — apply max overflow + showZero gate.
  if (typeof content === 'number') {
    if (content === 0 && !showZero) return null;
    if (max >= 0 && content > max) return `${max}+`;
    return String(content);
  }

  // String content — render verbatim. Empty string → hide
  // (counts as "no content" — consumer should pass `dot` for plain dot).
  return content === '' ? null : content;
}

/**
 * `<Badge>` — anchored indicator overlaying an anchor element.
 *
 * Common patterns:
 *   - Notification count on a bell IconButton
 *   - Presence dot on an Avatar
 *   - "NEW" label on a Card or feature tile
 *   - Unsaved-changes indicator on a save button
 *
 * For inline standalone pills (status labels, tags, removable
 * chips), use `<Chip>` instead — Chip and Badge are complementary
 * primitives. Chip is interactive (`onClick`, `onDelete`,
 * `selected`); Badge is passive overlay.
 *
 * Bridge integration (Sprint 4.4):
 *   - `access` — hide the badge for unauthorized subjects (anchor
 *     stays visible; wrap anchor in a separate Box `access` to gate
 *     it too)
 *   - `visibleWhen` — engine-reactive predicate
 *
 * The wrapped anchor element ALWAYS renders; only the floating
 * badge dot/count is gated by `access`, `visibleWhen`, `invisible`,
 * and content-resolution logic.
 *
 * @example
 * ```tsx
 * // Notification count on bell
 * <Badge content={unreadCount}>
 *   <IconButton aria-label="Notifications" variant="ghost">
 *     <BellIcon />
 *   </IconButton>
 * </Badge>
 *
 * // Presence dot on avatar
 * <Badge dot color="success" overlap="circular">
 *   <Avatar name="Maya Rodriguez" />
 * </Badge>
 *
 * // Overflow
 * <Badge content={1284} max={999}>
 *   <IconButton aria-label="Messages"><MailIcon /></IconButton>
 * </Badge>
 *
 * // RBAC-gated
 * <Badge
 *   content={adminQueueCount}
 *   access={{ resource: 'admin', action: 'read', onUnauthorized: 'hide' }}
 * >
 *   <IconButton aria-label="Admin queue"><SettingsIcon /></IconButton>
 * </Badge>
 *
 * // Engine-reactive
 * <Badge
 *   dot color="warning"
 *   visibleWhen={(engine) => !!engine.getNode('unsavedChanges')?.value}
 * >
 *   <IconButton aria-label="Save"><SaveIcon /></IconButton>
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  props,
  ref
) {
  const themeDefaults = useComponentDefaults('Badge');
  const merged: BadgeProps = { ...themeDefaults?.defaults, ...props };
  const {
    children,
    content,
    dot = false,
    max = 99,
    showZero = false,
    invisible = false,
    color = 'danger',
    placement = 'top-right',
    overlap = 'rectangular',
    withRing = true,
    access,
    visibleWhen,
    sx,
    className,
    slotProps,
  } = merged;

  // Bridge — both hooks called unconditionally (rules-of-hooks).
  const bridge = useContext(DashFormContext);
  const isBridgeVisible = useEngineVisibility(bridge?.engine, visibleWhen);
  const accessState = useAccessState(access);

  // Resolve the actual content to render (string or null = hide).
  // Computed regardless of access/visibleWhen so we can keep the
  // hook order stable; the final "render or not" check folds them in.
  const displayContent = resolveDisplayContent(content, max, showZero, dot);

  // The wrapped anchor ALWAYS renders. Only the floating badge is
  // gated. This is the right contract — gating the anchor too would
  // belong to a Box `access` wrapper one level up.
  const shouldRenderBadge =
    isBridgeVisible &&
    accessState.visible &&
    displayContent !== null;

  const v = badgeVariants({
    dot,
    invisible,
    withRing,
    color,
    placement,
    overlap,
  });

  return (
    <span
      ref={ref}
      className={cn(v.root(), sx, className, slotProps?.root?.className)}
    >
      {children}
      {shouldRenderBadge && (
        <span
          className={cn(v.badge(), slotProps?.badge?.className)}
          // Use `aria-hidden` because the count itself is decorative
          // — consumers should pair Badge with the anchor's
          // `aria-label` to convey the count semantically
          // (e.g., `aria-label="Notifications, 3 unread"`).
          aria-hidden="true"
        >
          {displayContent}
        </span>
      )}
    </span>
  );
});

Badge.displayName = 'Badge';
