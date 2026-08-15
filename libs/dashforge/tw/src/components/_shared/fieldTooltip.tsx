/**
 * Shared "label help tooltip" building blocks for the TW form inputs.
 *
 * Mirrors the MUI side (`@dashforge/ui` `_internal/fieldTooltip`): the
 * `tooltip` prop renders a ⓘ help trigger in the label row, revealing
 * `content` on hover / focus. The default icon is a built-in inline SVG —
 * no icon-library / webfont dependency, so it always renders.
 *
 * Supports Option C: `resolveFieldTooltip` deep-merges the per-instance
 * `tooltip` over a theme default (`theme.components.<Name>.defaults.tooltip`).
 *
 * @internal
 */
import type { ReactNode } from 'react';
import { Tooltip } from '../Tooltip/Tooltip.js';
import { cn } from '../../utils/cn.js';

/** Full config for a field's label-help tooltip. */
export interface FieldTooltipConfig {
  /** Text/content shown in the popup on hover / focus. */
  content: ReactNode;
  /** Trigger icon. Defaults to a built-in info-circle SVG. */
  icon?: ReactNode;
  /** Where the icon sits relative to the label. @default 'after' */
  position?: 'before' | 'after';
  /** Which side the popup appears on. @default 'top' */
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/** `tooltip` accepts a string shorthand (→ `{ content }`) or the full config. */
export type FieldTooltipProp = string | FieldTooltipConfig;

/** Normalise `string | config` to a config (or null when absent). */
export function normalizeFieldTooltip(
  tooltip: FieldTooltipProp | undefined,
): FieldTooltipConfig | null {
  if (tooltip == null) return null;
  return typeof tooltip === 'string' ? { content: tooltip } : tooltip;
}

/**
 * Resolve the effective tooltip config (Option C): deep-merge the
 * per-instance `tooltip` over the theme default. The instance wins per
 * key, so the theme can set `icon` / `position` / `side` while the
 * instance supplies just `content` (via the string shorthand).
 */
export function resolveFieldTooltip(
  instance: FieldTooltipProp | undefined,
  themeDefault: FieldTooltipProp | undefined,
): FieldTooltipConfig | null {
  const inst = normalizeFieldTooltip(instance);
  const base = normalizeFieldTooltip(themeDefault);
  if (!inst && !base) return null;
  if (!inst) return base;
  if (!base) return inst;
  return { ...base, ...inst };
}

/** Built-in default trigger icon — inline SVG, no external dependency. */
function InfoCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/** The focusable ⓘ trigger + the Radix-based `<Tooltip>` popup. */
function LabelTooltipTrigger({ config }: { config: FieldTooltipConfig }) {
  const { content, icon, position = 'after', side = 'top' } = config;
  return (
    <Tooltip content={content} side={side}>
      <button
        type="button"
        aria-label="More information"
        className={cn(
          'inline-flex items-center justify-center align-middle leading-none text-neutral-500 hover:text-neutral-700 cursor-help',
          position === 'before' ? 'mr-1' : 'ml-1',
        )}
      >
        {icon ?? <InfoCircleIcon />}
      </button>
    </Tooltip>
  );
}

/**
 * Compose a label node with its help-tooltip trigger. Pass the resolved
 * config (from {@link resolveFieldTooltip}) or `null`. Returns the plain
 * label when there is no tooltip.
 */
export function renderLabelWithTooltip(
  label: ReactNode,
  config: FieldTooltipConfig | null,
): ReactNode {
  if (!config) return label;
  const trigger = <LabelTooltipTrigger config={config} />;
  return config.position === 'before' ? (
    <>
      {trigger}
      {label}
    </>
  ) : (
    <>
      {label}
      {trigger}
    </>
  );
}
