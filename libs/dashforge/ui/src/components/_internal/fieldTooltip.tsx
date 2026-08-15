/**
 * Shared "label help tooltip" building blocks for the MUI form inputs.
 *
 * A single, self-contained mechanism used by `FieldLayoutShell` (and the
 * inputs that render their own label) so the `tooltip` prop renders a help
 * icon in the label row consistently.
 *
 * The default icon is a built-in inline SVG — no icon-library / webfont
 * dependency, so the affordance always renders. Consumers may pass any
 * ReactNode as `tooltip.icon` to override it.
 *
 * @internal — not exported publicly.
 */
import type { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

/** Full config for a field's label-help tooltip. */
export interface FieldTooltipConfig {
  /** The text/content shown in the popup on hover / focus. */
  content: ReactNode;
  /** Trigger icon. Defaults to a built-in info-circle SVG. */
  icon?: ReactNode;
  /** Where the icon sits relative to the label. @default 'after' */
  position?: 'before' | 'after';
  /** Which side the popup appears on. @default 'top' */
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/** The `tooltip` prop accepts a string shorthand (→ `{ content }`) or the full config. */
export type FieldTooltipProp = string | FieldTooltipConfig;

/** Normalise the `string | config` prop to a config (or null when absent). */
export function normalizeFieldTooltip(
  tooltip: FieldTooltipProp | undefined,
): FieldTooltipConfig | null {
  if (tooltip == null) return null;
  return typeof tooltip === 'string' ? { content: tooltip } : tooltip;
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

/** The focusable ⓘ trigger + the MUI Tooltip popup. */
function LabelTooltipTrigger({ config }: { config: FieldTooltipConfig }) {
  const { content, icon, position = 'after', side = 'top' } = config;
  return (
    <Tooltip title={content} placement={side} arrow enterDelay={200}>
      <Box
        component="button"
        type="button"
        aria-label="More information"
        sx={{
          ...(position === 'before' ? { mr: 0.5 } : { ml: 0.5 }),
          p: 0,
          border: 0,
          background: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          verticalAlign: 'middle',
          lineHeight: 0,
          color: 'text.secondary',
          cursor: 'help',
          '&:hover, &:focus-visible': { color: 'text.primary' },
        }}
      >
        {icon ?? <InfoCircleIcon />}
      </Box>
    </Tooltip>
  );
}

/**
 * Compose a label node with its help-tooltip trigger, honouring
 * `position`. Returns the plain label when there is no tooltip.
 */
export function renderLabelWithTooltip(
  label: ReactNode,
  tooltip: FieldTooltipProp | undefined,
): ReactNode {
  const config = normalizeFieldTooltip(tooltip);
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
