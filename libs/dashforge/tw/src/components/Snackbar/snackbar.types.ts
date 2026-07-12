import type { ReactNode } from 'react';
import type {
  Severity,
  SeverityVariant,
} from '../_shared/severity/severity.types.js';

/**
 * Visual severity — drives icon color + accent on the snackbar surface.
 *
 * Re-exported alias of the shared `Severity` type from
 * `_shared/severity/`. Kept as a distinct local alias for
 * backwards-compatible name (`SnackbarSeverity`) — pre-1.1.0 consumers
 * that imported `SnackbarSeverity` keep their imports working.
 */
export type SnackbarSeverity = Severity;

/**
 * Visual variant — `standard` (default, soft tinted surface), `filled`
 * (solid colored surface), `outlined` (transparent + border + text).
 * Re-exported alias of the shared `SeverityVariant`. New in 1.1.0:
 * Snackbar now supports the same 3-way axis as Alert / future Banner.
 */
export type SnackbarVariant = SeverityVariant;

/** Corner anchor for the snackbar stack. */
export type SnackbarPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** One snackbar instance — what `useSnackbar().enqueue()` accepts. */
export interface SnackbarOptions {
  /** Required text/content. */
  message: ReactNode;
  /** Visual severity. @default 'info' */
  severity?: SnackbarSeverity;
  /**
   * Visual variant — same 3-way axis as Alert. **New in 1.1.0.**
   *
   * - `'standard'` (default) — tinted soft surface, severity-toned text
   * - `'filled'` — solid colored surface, light text (strong weight)
   * - `'outlined'` — transparent surface, severity border + text
   *
   * @default 'standard'
   */
  variant?: SnackbarVariant;
  /**
   * Icon control — same tristate as Alert. **New in 1.1.0.**
   *
   * - omitted / `undefined` → default per-severity icon (inline SVG
   *   shared with Alert via `_shared/severity/`)
   * - `ReactNode` → consumer-provided icon
   * - `false` → no icon (colored surface alone carries the severity)
   *
   * The legacy Unicode glyphs (`ⓘ ✓ ⚠ ✕`) shipped in 1.0.x have been
   * REMOVED — see CHANGELOG for the visual breaking note.
   */
  icon?: ReactNode | false;
  /**
   * Auto-dismiss after this many ms. `0` / negative ⇒ persistent
   * (only dismissed by the close button or `dismiss(id)`).
   * @default 4000
   */
  autoHideMs?: number;
  /** Optional action button label + handler. */
  action?: { label: ReactNode; onClick: () => void };
  /** Per-instance close-button visibility. @default true */
  showClose?: boolean;
  /**
   * Stable identifier for de-duplication. If a snackbar with the same
   * `id` is enqueued while already visible, the existing one is REUSED
   * (auto-dismiss timer reset) instead of stacking a duplicate. Useful
   * for "Saved" toasts triggered repeatedly from the same action.
   */
  id?: string;
}

/** Internal model — every enqueued snackbar gets a unique id + a tick. */
export interface SnackbarRecord extends SnackbarOptions {
  id: string;
  /**
   * Monotonic creation tick, used to drive the entry CSS transition
   * (the consumer's CSS can target `data-state="entered"` keyed by tick).
   */
  tick: number;
}

export interface SnackbarSlotProps {
  container?: { className?: string };
  item?: { className?: string };
  icon?: { className?: string };
  message?: { className?: string };
  action?: { className?: string };
  closeButton?: { className?: string };
}

/** API exposed by `useSnackbar()`. */
export interface SnackbarApi {
  /** Show a snackbar — returns its assigned id (auto-generated if not provided). */
  enqueue: (options: SnackbarOptions) => string;
  /** Dismiss a specific snackbar. */
  dismiss: (id: string) => void;
  /** Dismiss every visible snackbar. */
  dismissAll: () => void;
}

export interface SnackbarProviderProps {
  /** App tree to wrap. Required. */
  children: ReactNode;

  /**
   * Corner the stack anchors to.
   * @default 'bottom-right'
   */
  position?: SnackbarPosition;

  /**
   * Hard cap on simultaneously visible snackbars. Excess enqueued
   * items wait FIFO until a slot frees up.
   * @default 5
   */
  maxVisible?: number;

  /** Defaults merged into every enqueue. */
  defaults?: Pick<
    SnackbarOptions,
    'severity' | 'variant' | 'autoHideMs' | 'showClose'
  >;

  /** Per-slot className overrides applied to every snackbar. */
  slotProps?: SnackbarSlotProps;
}

/**
 * Subset of `<SnackbarProvider>` props theme-configurable via
 * `theme.components.Snackbar.defaults` (Option C).
 *
 * `enqueueDefaults` is theme-level per-enqueue defaults — merged BEFORE
 * the provider's own `defaults` prop (which wins).
 */
export interface SnackbarVariantProps {
  position?: SnackbarPosition;
  maxVisible?: number;
  enqueueDefaults?: Pick<
    SnackbarOptions,
    'severity' | 'variant' | 'autoHideMs' | 'showClose'
  >;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Snackbar?: {
      defaults?: Partial<SnackbarVariantProps>;
    };
  }
}
